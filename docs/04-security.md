# Segurança

Este documento descreve os controles presentes na API e os limites que devem ser considerados na implantação. A API possui dois mecanismos distintos: JWT para operadores administrativos e chaves de API destinadas a identificar uma aplicação cliente. Eles não são intercambiáveis.

## Autenticação administrativa

O login é feito por `POST /auth`, enviando `email` e `password` no corpo. Em caso de sucesso, a resposta contém um `accessToken` JWT; as demais rotas administrativas recebem esse token no cabeçalho:

```http
Authorization: Bearer <accessToken>
```

O serviço procura a conta pelo e-mail, recusa contas inexistentes ou inativas e verifica a senha com Argon2. O seed cria o administrador inicial com Argon2id e lê as variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`; portanto, a senha inicial é transformada em hash antes de ser gravada no banco.

O JWT inclui `sub` (ID do administrador), `role` e `isActive`. Sua assinatura usa o segredo configurado por `JWT_SECRET_KEY`, e sua validade é configurada por `JWT_EXPIRES_IN` (o `.env.example` fornece apenas o nome dos parâmetros, sem valores). O guard verifica a assinatura e a expiração e consulta o banco para confirmar que a conta ainda existe e está ativa. Erros de validação do token e contas inativas resultam em `401 Unauthorized`.

O guard confirma o estado ativo no banco, mas as permissões são lidas do papel que está dentro do JWT. Assim, alterar o papel de uma conta não atualiza tokens já emitidos: eles podem conservar as permissões anteriores até expirarem. Para reduzir essa janela, configure um TTL curto e invalide ou substitua tokens conforme o processo operacional adotado.

O endpoint de login permite até 5 requisições por minuto. Credenciais inválidas retornam `401`; a resposta não diferencia um e-mail inexistente de uma senha incorreta.

## Autorização e papéis

As rotas administrativas aplicam dois guards em sequência:

1. `AdminAuthGuard` autentica o token Bearer e associa o payload verificado à requisição.
2. `AdminRolesGuard` compara o papel do token com os papéis declarados na rota por `@AdminRoles(...)`.

Quando mais de um papel é declarado, basta corresponder a um deles. Os papéis definidos no banco são:

| Papel      | Aplicações                                  | Chaves de API                      |
| ---------- | ------------------------------------------- | ---------------------------------- |
| `ADMIN`    | Consultar, criar, editar, ativar e inativar | Consultar, criar, editar e revogar |
| `OPERATOR` | Consultar                                   | Consultar                          |

As rotas de consulta de aplicações e chaves de API aceitam `ADMIN` e `OPERATOR`. Operações de escrita exigem `ADMIN`. Um token válido sem o papel exigido não autoriza a operação.

## Chaves de API de aplicações

O serviço gera uma chave com 32 bytes aleatórios, codificados em hexadecimal e precedidos pelo alias configurado em `API_KEY_ALIAS`. Apenas o hash SHA-256 da chave combinado com `API_KEY_PEPPER` é persistido; a comparação dos hashes usa `timingSafeEqual`. A chave em texto claro é devolvida somente na criação, portanto deve ser copiada e armazenada em um gerenciador de segredos nesse momento. As rotas de gestão das chaves são administrativas e seguem a matriz de papéis acima.

O `ApiKeyGuard` espera o mesmo formato `Authorization: Bearer <api-key>`. Ele localiza o registro pelo prefixo (`API_KEY_PREFIX_LENGTH`) e considera a chave inválida quando o hash não confere, a chave foi revogada, expirou ou a aplicação está inativa. Em uma validação bem-sucedida, associa o ID da aplicação à requisição. O campo `lastUsedAt` é atualizado no máximo uma vez a cada intervalo definido por `API_KEY_LAST_USED_UPDATE_INTERVAL_MS`.

**Estado atual:** o guard de chaves de API existe, mas não está aplicado a nenhum endpoint. `POST /notifications` também ainda não possui guard, e seu handler está vazio. Portanto, não considere a ingestão de notificações protegida por chave de API até que o guard seja conectado à rota e o endpoint seja implementado. A rota de notificações também não deve ser exposta publicamente nesse estado.

## Outros controles aplicados

- O Helmet adiciona cabeçalhos HTTP de segurança. HSTS fica habilitado somente em `NODE_ENV=production`, com validade de um ano e `includeSubDomains`.
- O `ValidationPipe` global transforma os dados recebidos conforme os DTOs e rejeita propriedades que não tenham decoradores de validação, devido à combinação de `whitelist` e `forbidNonWhitelisted`. Os DTOs também restringem tipos e comprimentos em campos de aplicações e chaves de API.
- O `ThrottlerGuard` aplica limites globais e limites mais restritivos em rotas sensíveis, detalhados abaixo.
- A API usa Pino para logging. Não registre tokens, senhas, chaves de API em texto claro ou valores de `JWT_SECRET_KEY` e `API_KEY_PEPPER` nos logs.

### Rate limit

Os limites usam janelas de 60 segundos. O limite global é de 100 requisições; os valores específicos substituem esse limite nas rotas anotadas com `@Throttle`:

| Escopo                  |                                 Limite | Rotas                                                |
| ----------------------- | -------------------------------------: | ---------------------------------------------------- |
| Global                  |             100 requisições por minuto | Todas as rotas, salvo configuração específica abaixo |
| Autenticação            |               5 requisições por minuto | `POST /auth`                                         |
| Escrita de aplicações   | 10 requisições por minuto em cada rota | `POST /applications` e rotas `PATCH` de aplicações   |
| Gestão de chaves de API | 10 requisições por minuto em cada rota | `POST` e rotas `PATCH` de chaves de API              |

O contador padrão é associado ao endereço IP da requisição. Ao exceder o limite, a API responde `429 Too Many Requests`; o cliente deve aguardar antes de repetir a chamada. Os contadores são independentes por rota, então o limite de uma rota não é um orçamento compartilhado entre todas as rotas da mesma categoria. Requisições rejeitadas pelo rate limit não devem ser repetidas imediatamente em loop.

### Melhoria

O armazenamento padrão do `@nestjs/throttler` é local ao processo. Com várias instâncias da API, cada instância mantém seus próprios contadores; assim, o limite efetivo pode se multiplicar conforme a distribuição das requisições. Para impor um limite consistente nesse ambiente, configure um armazenamento compartilhado ou aplique o controle em um gateway com estado compartilhado.

## Configuração e operação

Mantenha `JWT_SECRET_KEY` e `API_KEY_PEPPER` fortes, únicos por ambiente e fora do controle de versão. Restrinja o acesso ao banco e ao Redis, use TLS no ponto de entrada da aplicação e limite a exposição da API e do painel Bull Board a redes confiáveis. O servidor HTTP da aplicação não configura TLS por si só; em produção, o término TLS deve ser fornecido por um proxy ou balanceador devidamente configurado.

Há duas diferenças entre o código e o `.env.example` que precisam ser alinhadas antes de usar o arquivo de exemplo para provisionamento:

- O módulo JWT exige `JWT_SECRET_KEY`, enquanto o exemplo declara `JWT_SECRET`.
- O seed exige `ADMIN_PASSWORD` e gera o hash Argon2id, enquanto o exemplo declara `ADMIN_PASSWORD_HASH`.

Use os nomes que o código realmente consome ou atualize a configuração para que o exemplo, o ambiente de deploy e o código concordem. Nunca coloque senhas ou segredos reais no repositório.

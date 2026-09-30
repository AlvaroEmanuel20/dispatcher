# Seguranca

Este documento descreve os controles presentes na API e os limites que devem ser considerados na implantacao. A API possui dois mecanismos distintos: JWT para operadores administrativos e API keys destinadas a identificar uma aplicacao cliente. Eles nao sao intercambiaveis.

## Autenticacao administrativa

O login e feito por `POST /auth`, enviando `email` e `password` no corpo. Em caso de sucesso, a resposta contem um `accessToken` JWT; as demais rotas administrativas recebem esse token no cabecalho:

```http
Authorization: Bearer <accessToken>
```

O servico procura a conta pelo e-mail, recusa contas inexistentes ou inativas e verifica a senha com Argon2. O seed cria o administrador inicial com Argon2id e le as variaveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`; portanto, a senha inicial e transformada em hash antes de ser gravada no banco.

O JWT inclui `sub` (id do administrador), `role` e `isActive`. Sua assinatura usa o segredo configurado por `JWT_SECRET_KEY`, e sua validade e configurada por `JWT_EXPIRES_IN` (o `.env.example` fornece apenas o nome dos parametros, sem valores). O guard verifica a assinatura e a expiracao e consulta o banco para confirmar que a conta ainda existe e esta ativa. Erros de validacao do token e contas inativas resultam em `401 Unauthorized`.

O guard confirma o estado ativo no banco, mas as permissoes sao lidas do papel que esta dentro do JWT. Assim, alterar o papel de uma conta nao atualiza tokens ja emitidos: eles podem conservar as permissoes anteriores ate expirarem. Para reduzir essa janela, configure um TTL curto e invalide ou substitua tokens conforme o processo operacional adotado.

O endpoint de login permite ate 5 requisicoes por minuto. Credenciais invalidas retornam `401`; nao e retornado um motivo diferente para e-mail inexistente e senha incorreta.

## Autorizacao e papeis

As rotas administrativas aplicam dois guards em sequencia:

1. `AdminAuthGuard` autentica o bearer token e associa o payload verificado a requisicao.
2. `AdminRolesGuard` compara o papel do token com os papeis declarados na rota por `@AdminRoles(...)`.

Quando mais de um papel e declarado, basta corresponder a um deles. Os papeis definidos no banco sao:

| Papel      | Aplicacoes                                  | API keys                           |
| ---------- | ------------------------------------------- | ---------------------------------- |
| `ADMIN`    | Consultar, criar, editar, ativar e inativar | Consultar, criar, editar e revogar |
| `OPERATOR` | Consultar                                   | Consultar                          |

As rotas de consulta de aplicacoes e API keys aceitam `ADMIN` e `OPERATOR`. Operacoes de escrita exigem `ADMIN`. Um token valido sem o papel exigido nao autoriza a operacao.

## API keys de aplicacoes

O servico gera uma chave com 32 bytes aleatorios, codificados em hexadecimal e precedidos pelo alias configurado em `API_KEY_ALIAS`. Apenas o hash SHA-256 da chave combinado com `API_KEY_PEPPER` e persistido; a comparacao dos hashes usa `timingSafeEqual`. A chave em texto claro e devolvida somente na criacao, portanto deve ser copiada e armazenada em um gestor de segredos nesse momento. As rotas de gestao da chave sao administrativas e seguem a matriz de papeis acima.

O `ApiKeyGuard` espera o mesmo formato `Authorization: Bearer <api-key>`. Ele localiza o registro pelo prefixo (`API_KEY_PREFIX_LENGTH`) e considera a chave invalida quando o hash nao confere, a chave foi revogada, expirou ou a aplicacao esta inativa. Em uma validacao bem-sucedida, associa o id da aplicacao a requisicao. O campo `lastUsedAt` e atualizado no maximo conforme o intervalo `API_KEY_LAST_USED_UPDATE_INTERVAL_MS`.

**Estado atual:** o guard de API key existe, mas nao esta aplicado a nenhum endpoint. `POST /notifications` tambem ainda nao possui guard e seu handler esta vazio. Portanto, nao considere a ingestao de notificacoes protegida por API key ate que o guard seja conectado a rota e o endpoint seja implementado. A rota de notificacoes tambem nao deve ser exposta publicamente nesse estado.

## Outros controles aplicados

- O Helmet adiciona cabecalhos HTTP de seguranca. HSTS fica habilitado somente em `NODE_ENV=production`, com validade de um ano e `includeSubDomains`.
- O `ValidationPipe` global transforma os DTOs, remove campos nao permitidos da entrada (`whitelist`) e rejeita propriedades extras (`forbidNonWhitelisted`). Os DTOs tambem restringem tipos e comprimentos em campos de aplicacoes e API keys.
- O `ThrottlerGuard` aplica limites globais e limites mais restritivos em rotas sensiveis, detalhados abaixo.
- A API usa Pino para logging. Nao registre tokens, senhas, API keys em texto claro ou valores de `JWT_SECRET_KEY` e `API_KEY_PEPPER` nos logs.

### Rate limit

Os limites usam janelas de 60 segundos. O limite global e de 100 requisicoes; os valores especificos substituem esse limite nas rotas anotadas com `@Throttle`:

| Escopo                |                                 Limite | Rotas                                                |
| --------------------- | -------------------------------------: | ---------------------------------------------------- |
| Global                |             100 requisicoes por minuto | Todas as rotas, salvo configuracao especifica abaixo |
| Autenticacao          |               5 requisicoes por minuto | `POST /auth`                                         |
| Escrita de aplicacoes | 10 requisicoes por minuto em cada rota | `POST /applications` e rotas `PATCH` de aplicacoes   |
| Gestao de API keys    | 10 requisicoes por minuto em cada rota | `POST` e rotas `PATCH` de API keys                   |

O contador padrao e associado ao endereco IP da requisicao. Ao exceder o limite, a API responde `429 Too Many Requests`; o cliente deve aguardar antes de repetir a chamada. Os contadores sao independentes por rota, entao o limite de uma rota nao e um orcamento compartilhado entre todas as rotas da mesma categoria. Requisicoes rejeitadas pelo rate limit nao devem ser repetidas imediatamente em loop.

O armazenamento padrao do `@nestjs/throttler` e local ao processo. Com varias instancias da API, cada instancia mantem seus proprios contadores; assim, o limite efetivo pode se multiplicar conforme a distribuicao das requisicoes. Para impor um limite consistente nesse ambiente, configure um armazenamento compartilhado ou aplique o controle em um gateway com estado compartilhado.

A aplicacao tambem nao configura `trust proxy`. Se estiver atras de um proxy, confirme qual endereco IP chega ao Express: requisicoes podem ser agrupadas sob o IP do proxy. Configure a confianca apenas para proxies controlados e conhecidos, evitando confiar indiscriminadamente em cabecalhos encaminhados pelo cliente. Limites por IP tambem podem agrupar clientes que compartilham NAT e nao substituem controles anti-DDoS na infraestrutura.

## Configuracao e operacao

Mantenha `JWT_SECRET_KEY` e `API_KEY_PEPPER` fortes, unicos por ambiente e fora do controle de versao. Restrinja o acesso ao banco e ao Redis, use TLS no ponto de entrada da aplicacao e limite a exposicao da API e do painel Bull Board a redes confiaveis. O listener HTTP da aplicacao nao configura TLS por si so; em producao, o termino TLS deve ser fornecido por um proxy ou balanceador devidamente configurado.

Ha duas diferencas entre o codigo e o `.env.example` que precisam ser alinhadas antes de usar o arquivo de exemplo para provisionamento:

- O modulo JWT exige `JWT_SECRET_KEY`, enquanto o exemplo declara `JWT_SECRET`.
- O seed exige `ADMIN_PASSWORD` e gera o hash Argon2id, enquanto o exemplo declara `ADMIN_PASSWORD_HASH`.

Use os nomes que o codigo realmente consome ou atualize a configuracao para que exemplo, ambiente de deploy e codigo concordem. Nunca coloque senhas ou segredos reais no repositorio.

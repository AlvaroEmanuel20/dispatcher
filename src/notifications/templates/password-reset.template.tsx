import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  render,
  Section,
  Text,
  toPlainText,
} from 'react-email';
import { TemplateReturn } from './template.resolver';

export type PasswordResetVariables = {
  applicationName: string;
  name: string;
  url: string;
};

export async function getPasswordResetTemplate(
  variables: PasswordResetVariables,
): Promise<TemplateReturn> {
  const html = await render(<PasswordResetTemplate {...variables} />);

  return {
    subject: `Redefina sua senha no ${variables.applicationName}`,
    html,
    text: toPlainText(html),
  };
}

function PasswordResetTemplate({
  name,
  url,
  applicationName,
}: PasswordResetVariables) {
  return (
    <Html lang="pt-BR">
      <Head />

      <Preview>Redefina sua senha</Preview>

      <Body>
        <Container>
          <Section>
            <Text>Olá, {name}.</Text>

            <Text>
              Recebemos uma solicitação para redefinir sua senha. Clique link
              abaixo para redefinir:
            </Text>

            <Button href={url}>Redefinir senha</Button>

            <Text>Este link expira em 30 minutos.</Text>

            <Text>Se você não solicitou essa ação, ignore este e-mail.</Text>

            <Text>Atenciosamente, Equipe {applicationName}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

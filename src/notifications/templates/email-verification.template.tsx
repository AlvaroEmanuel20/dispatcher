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

export type EmailVerificationVariables = {
  name: string;
  url: string;
};

export async function getEmailVerificationTemplate(
  variables: EmailVerificationVariables,
): Promise<TemplateReturn> {
  const html = await render(<EmailVerificationTemplate {...variables} />);

  return {
    subject: 'Confirme seu cadastro no Jusmetrica',
    html,
    text: toPlainText(html),
  };
}

function EmailVerificationTemplate({ name, url }: EmailVerificationVariables) {
  return (
    <Html lang="pt-BR">
      <Head />

      <Preview>Confirme seu cadastro</Preview>

      <Body>
        <Container>
          <Section>
            <Text>Olá, {name}.</Text>

            <Text>Confirme seu cadastro clicando no link abaixo:</Text>

            <Button href={url}>Confirmar cadastro</Button>

            <Text>Este link expira em 30 minutos.</Text>

            <Text>Atenciosamente, Equipe Jusmetrica</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

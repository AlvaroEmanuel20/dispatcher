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

export type WelcomeVariables = {
  applicationName: string;
  name: string;
  url: string;
};

export async function getWelcomeTemplate(
  variables: WelcomeVariables,
): Promise<TemplateReturn> {
  const html = await render(<WelcomeTemplate {...variables} />);

  return {
    subject: `Boas-vindas ao ${variables.applicationName}`,
    html,
    text: toPlainText(html),
  };
}

function WelcomeTemplate({ name, url, applicationName }: WelcomeVariables) {
  return (
    <Html lang="pt-BR">
      <Head />

      <Preview>Boas-vindas ao {applicationName}</Preview>

      <Body>
        <Container>
          <Section>
            <Text>Olá, {name}!</Text>

            <Text>
              Que bom ter você com a gente. Sua conta está pronta para começar.
            </Text>

            <Text>Acesse a {applicationName} pelo link abaixo:</Text>

            <Button href={url}>Acessar minha conta</Button>

            <Text>Esperamos que sua experiência seja ótima.</Text>

            <Text>Atenciosamente, Equipe {applicationName}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

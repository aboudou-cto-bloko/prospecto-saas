import { Button, Preview, Section, Text } from "@react-email/components";
import { EmailWrapper, styles } from "./base-layout";

type Props = { url: string; email: string };

export function MagicLinkEmail({ url, email }: Props) {
  return (
    <EmailWrapper>
      <Preview>Ton lien de connexion Prospecto — valable 5 minutes</Preview>
      <Section style={styles.body}>
        <Text style={styles.heading}>Connexion sans mot de passe</Text>
        <Text style={styles.text}>
          Clique sur le bouton ci-dessous pour te connecter à Prospecto avec{" "}
          <strong>{email}</strong>. Ce lien expire dans{" "}
          <strong>5 minutes</strong>.
        </Text>
        <Button href={url} style={styles.button}>
          Se connecter
        </Button>
        <Text style={styles.textMuted}>
          Si tu n&apos;as pas demandé ce lien, ignore cet email. Ton compte est
          en sécurité.
        </Text>
      </Section>
    </EmailWrapper>
  );
}

MagicLinkEmail.PreviewProps = {
  url: "http://localhost:3000/verify-magic-link?token=abc123",
  email: "franckzinsou24@gmail.com",
} as Props;

export default MagicLinkEmail;

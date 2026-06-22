import { Button, Preview, Section, Text } from "@react-email/components";
import { EmailWrapper, styles } from "./base-layout";

type Props = { url: string; name: string };

export function ResetPasswordEmail({ url, name }: Props) {
  return (
    <EmailWrapper>
      <Preview>Réinitialise ton mot de passe Prospecto</Preview>
      <Section style={styles.body}>
        <Text style={styles.heading}>Réinitialisation du mot de passe</Text>
        <Text style={styles.text}>
          Bonjour {name}, tu as demandé à réinitialiser ton mot de passe
          Prospecto. Clique sur le bouton ci-dessous — ce lien expire dans{" "}
          <strong>1 heure</strong>.
        </Text>
        <Button href={url} style={styles.button}>
          Réinitialiser mon mot de passe
        </Button>
        <Text style={styles.textMuted}>
          Si tu n&apos;as pas demandé cette réinitialisation, ignore cet email.
          Ton mot de passe actuel reste inchangé.
        </Text>
      </Section>
    </EmailWrapper>
  );
}

ResetPasswordEmail.PreviewProps = {
  url: "http://localhost:3000/reset-password?token=abc123",
  name: "François",
} as Props;

export default ResetPasswordEmail;

import { Button, Preview, Section, Text } from "@react-email/components";
import { EmailWrapper, styles } from "./base-layout";

type Props = { orgName: string; inviterName: string; url: string };

export function InvitationEmail({ orgName, inviterName, url }: Props) {
  return (
    <EmailWrapper>
      <Preview>
        {inviterName} t&apos;invite à rejoindre {orgName} sur Prospecto
      </Preview>
      <Section style={styles.body}>
        <Text style={styles.heading}>Invitation à rejoindre {orgName}</Text>
        <Text style={styles.text}>
          <strong>{inviterName}</strong> t&apos;invite à rejoindre{" "}
          <strong>{orgName}</strong> sur Prospecto. Accepte l&apos;invitation
          pour commencer à collaborer.
        </Text>
        <Button href={url} style={styles.button}>
          Accepter l&apos;invitation
        </Button>
        <Text style={styles.textMuted}>
          Si tu ne connais pas cette personne, ignore cet email.
        </Text>
      </Section>
    </EmailWrapper>
  );
}

InvitationEmail.PreviewProps = {
  orgName: "Mon Entreprise",
  inviterName: "François",
  url: "http://localhost:3000/accept-invitation/abc123",
} as Props;

export default InvitationEmail;

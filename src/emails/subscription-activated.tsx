import { Preview, Section, Text } from "@react-email/components";
import { EmailWrapper, styles } from "./base-layout";

type Props = {
  orgName: string;
  planName: string;
  expiresAt: string;
};

export function SubscriptionActivatedEmail({
  orgName,
  planName,
  expiresAt,
}: Props) {
  return (
    <EmailWrapper>
      <Preview>
        Abonnement {planName} activé pour {orgName}
      </Preview>
      <Section style={styles.body}>
        <Text style={styles.heading}>Abonnement activé</Text>
        <Text style={styles.text}>
          L&apos;abonnement <strong>{planName}</strong> pour{" "}
          <strong>{orgName}</strong> est maintenant actif. Tu as accès à toutes
          les fonctionnalités du plan jusqu&apos;au{" "}
          <strong>{expiresAt}</strong>.
        </Text>
        <Section
          style={{
            backgroundColor: "#f8f8f7",
            borderRadius: "8px",
            padding: "16px 24px",
            margin: "20px 0",
          }}
        >
          <Text style={{ ...styles.text, margin: "0", fontWeight: "600" }}>
            Plan : {planName}
          </Text>
          <Text style={{ ...styles.textMuted, margin: "4px 0 0" }}>
            Valable jusqu&apos;au {expiresAt}
          </Text>
        </Section>
        <Text style={styles.textMuted}>
          Le renouvellement est automatique. Tu peux gérer ton abonnement dans
          les paramètres.
        </Text>
      </Section>
    </EmailWrapper>
  );
}

SubscriptionActivatedEmail.PreviewProps = {
  orgName: "Mon Entreprise",
  planName: "Pro",
  expiresAt: "22 juillet 2026",
} as Props;

export default SubscriptionActivatedEmail;

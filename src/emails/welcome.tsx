import { Button, Column, Preview, Row, Section, Text } from "@react-email/components";
import { EmailWrapper, styles } from "./base-layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://prospecto.app";

type Props = {
  name: string;
};

export function WelcomeEmail({ name }: Props) {
  return (
    <EmailWrapper>
      <Preview>Bienvenue sur Prospecto, {name}</Preview>

      <Section style={styles.body}>
        <Text style={styles.heading}>Bienvenue, {name}</Text>

        <Text style={styles.text}>
          Ton compte Prospecto est prêt. Tu peux maintenant collecter des
          prospects, créer des campagnes WhatsApp et suivre tes conversions — le
          tout depuis un seul endroit.
        </Text>

        <Section
          style={{
            backgroundColor: "#f8f8f7",
            borderRadius: "8px",
            padding: "20px 24px",
            margin: "20px 0",
          }}
        >
          {[
            ["1", "Crée ton organisation", "Espace de travail pour ton équipe"],
            ["2", "Importe des prospects", "Via GoAfricaOnline ou CSV"],
            ["3", "Lance une campagne", "Crée un template et envoie via WhatsApp"],
          ].map(([num, title, desc]) => (
            <Row key={num} style={{ marginBottom: "14px" }}>
              <Column
                style={{
                  width: "28px",
                  verticalAlign: "top",
                  paddingTop: "2px",
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#5e6ad2",
                    borderRadius: "50%",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "700",
                    lineHeight: "22px",
                    margin: "0",
                    textAlign: "center",
                    width: "22px",
                    height: "22px",
                  }}
                >
                  {num}
                </Text>
              </Column>
              <Column style={{ paddingLeft: "10px", verticalAlign: "top" }}>
                <Text
                  style={{ ...styles.text, margin: "0 0 2px", fontWeight: "600" }}
                >
                  {title}
                </Text>
                <Text style={{ ...styles.textMuted, margin: "0" }}>{desc}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Button href={APP_URL} style={styles.button}>
          Accéder à Prospecto
        </Button>

        <Text style={styles.textMuted}>
          Des questions ? Réponds directement à cet email.
        </Text>
      </Section>
    </EmailWrapper>
  );
}

WelcomeEmail.PreviewProps = { name: "François" } as Props;
export default WelcomeEmail;

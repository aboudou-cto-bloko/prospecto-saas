import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

const BRAND = "#5e6ad2";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://prospecto.app";

export const styles = {
  main: {
    backgroundColor: "#f5f5f5",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    borderRadius: "8px",
    overflow: "hidden" as const,
    maxWidth: "560px",
  },
  header: {
    backgroundColor: "#010102",
    padding: "24px 40px",
  },
  logoText: {
    color: "#f6f5f4",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
  },
  body: {
    padding: "36px 40px 24px",
  },
  heading: {
    color: "#0a0a09",
    fontSize: "22px",
    fontWeight: "600",
    margin: "0 0 16px",
    lineHeight: "1.3",
  },
  text: {
    color: "#444",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  textMuted: {
    color: "#888",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 12px",
  },
  button: {
    backgroundColor: BRAND,
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    margin: "24px 0",
  },
  codeBlock: {
    backgroundColor: "#f8f8f7",
    border: "1px solid #e8e8e8",
    borderRadius: "6px",
    color: "#0a0a09",
    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
    fontSize: "24px",
    fontWeight: "600",
    letterSpacing: "0.15em",
    padding: "16px",
    textAlign: "center" as const,
    margin: "20px 0",
  },
  hr: {
    borderColor: "#f0f0f0",
    margin: "24px 0",
  },
  footer: {
    padding: "16px 40px 32px",
  },
  footerText: {
    color: "#aaa",
    fontSize: "12px",
    lineHeight: "20px",
    margin: "0",
  },
};

export function EmailFooter() {
  return (
    <Section style={styles.footer}>
      <Hr style={styles.hr} />
      <Text style={styles.footerText}>
        <Link href={APP_URL} style={{ color: "#888", textDecoration: "none" }}>
          Prospecto
        </Link>{" "}
        · Mini CRM WhatsApp · Bénin
        <br />
        Tu reçois cet email car tu as un compte Prospecto.
      </Text>
    </Section>
  );
}

export function EmailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logoText}>◆ Prospecto</Text>
          </Section>
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}

// file: src/emails/auths/password-changed.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
} from "@react-email/components";

interface PasswordChangedProps {
  name?: string;
  changeTime: string;
  companyName?: string;
  supportEmail?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: "20px",
};

const container = {
  backgroundColor: "#f9f9f9",
  margin: "0 auto",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  maxWidth: "600px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333333",
  marginBottom: "20px",
  paddingBottom: "8px",
  borderBottom: "1px solid #e2e8f0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333333",
  margin: "16px 0",
};

const alertBox = {
  backgroundColor: "#fef3f2",
  padding: "16px",
  borderRadius: "4px",
  borderLeft: "4px solid #dc2626",
  margin: "20px 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: "600",
  margin: "16px 0",
};

const footer = {
  fontSize: "14px",
  color: "#718096",
  marginTop: "24px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "16px",
};

export const PasswordChangedEmail = ({
  name = "User",
  changeTime,
  companyName = process.env.EMAIL_FROM_NAME || "Jubilee Care ICT Innovations and Consult",
  supportEmail = process.env.SUPPORT_EMAIL || "support@jubileecare.com",
  ipAddress = "Unknown",
  deviceInfo = "Unknown device",
}: PasswordChangedProps) => (
  <Html>
    <Head />
    <Preview>Your password has been updated</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Password Change Confirmation</Text>

        <Text style={paragraph}>Hello {name},</Text>

        <Text style={paragraph}>
          Your {companyName} account password was successfully changed on:
        </Text>

        <Text style={{ ...paragraph, fontWeight: "bold" }}>{changeTime}</Text>

        <Section style={alertBox}>
          <Text style={{ ...paragraph, margin: "0 0 8px 0" }}>
            <strong>Change details:</strong>
          </Text>
          <Text style={paragraph}>• IP Address: {ipAddress}</Text>
          <Text style={paragraph}>• Device: {deviceInfo}</Text>
        </Section>

        <Text style={paragraph}>
          If you initiated this change, no further action is required.
        </Text>

        <Text style={paragraph}>
          <strong>If you didn&#39;t make this change:</strong>
        </Text>

        <Button
          style={button}
          href={`https://${companyName.toLowerCase()}.com/account/security`}
        >
          Secure Your Account Now
        </Button>

        <Text style={paragraph}>
          Contact our{" "}
          <Link style={link} href={`mailto:${supportEmail}`}>
            support team
          </Link>{" "}
          immediately if you suspect unauthorized access.
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
          <br />
          This email was sent to you as part of our security notifications.
        </Text>
      </Container>
    </Body>
  </Html>
);

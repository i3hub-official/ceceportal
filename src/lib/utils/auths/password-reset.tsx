// File: src/emails/auths/forgot-password.tsx
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

interface PasswordResetEmailProps {
  name?: string;
  resetLink: string;
  expiryHours?: number;
  companyName?: string;
  supportEmail?: string;
  ipAddress?: string;
}

const main = {
  backgroundColor: "#f9f9f9",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: "20px",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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

const alertText = {
  ...paragraph,
  color: "#d97706",
  fontWeight: "500",
};

const buttonContainer = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "600",
  display: "inline-block",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  fontSize: "14px",
  color: "#718096",
  marginTop: "24px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "16px",
};

export const PasswordResetEmail = ({
  name = "User",
  resetLink,
  expiryHours = 1,
  companyName = process.env.EMAIL_FROM_NAME || "Jubilee Care ICT Innovations and Consult",
  supportEmail = process.env.SUPPORT_EMAIL || "support@jubileecare.com",
  ipAddress = "Not available",
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Password Reset Request</Text>

        <Text style={paragraph}>Hello {name},</Text>

        <Text style={paragraph}>
          We received a request to reset your password for your {companyName}{" "}
          account.
        </Text>

        <Text style={paragraph}>
          <strong>Request originated from:</strong> {ipAddress}
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>

        <Text style={alertText}>
          This link will expire in {expiryHours} hour
          {expiryHours !== 1 ? "s" : ""}.
        </Text>

        <Text style={paragraph}>
          If you didn&#39;t request this password reset, please{" "}
          <Link style={link} href={`mailto:${supportEmail}`}>
            contact our support team
          </Link>{" "}
          immediately.
        </Text>

        <Text style={paragraph}>
          For your security, this link can only be used once and will expire
          after use.
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
          <br />
          This email was sent to you as part of our account security system.
        </Text>
      </Container>
    </Body>
  </Html>
);

// File: src/emails/auths/verify-email.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
} from "@react-email/components";

interface VerifyEmailProps {
  name?: string;
  verificationLink: string;
  companyName?: string;
  supportEmail?: string;
  expiryHours?: number;
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

export const VerifyEmailEmail = ({
  name = "User",
  verificationLink,
  companyName = process.env.EMAIL_FROM_NAME ||
    "Jubilee Care ICT Innovations and Consult",
  supportEmail = process.env.SUPPORT_EMAIL || "support@jubileecare.com",
  expiryHours = 24,
}: VerifyEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Verify Your Email Address</Text>

        <Text style={paragraph}>Hello {name},</Text>

        <Text style={paragraph}>
          Thank you for loging up with {companyName}! To complete your
          registration, please verify your email address by clicking the button
          below:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={verificationLink}>
            Verify Email Address
          </Button>
        </Section>

        <Text style={alertText}>
          This verification link will expire in {expiryHours} hour
          {expiryHours !== 1 ? "s" : ""}.
        </Text>

        <Text style={paragraph}>
          If you didn&#39;t create an account with {companyName}, please{" "}
          <Link style={link} href={`mailto:${supportEmail}`}>
            contact our support team
          </Link>{" "}
          immediately.
        </Text>

        <Text style={paragraph}>
          Having trouble with the button? Copy and paste this link into your
          browser:
        </Text>

        <Text style={{ ...paragraph, wordBreak: "break-all" }}>
          {verificationLink}
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
          <br />
          This email was sent as part of our account verification process.
        </Text>
      </Container>
    </Body>
  </Html>
);

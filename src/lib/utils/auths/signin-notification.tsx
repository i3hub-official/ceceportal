// file: src/emails/login-notification.tsx
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

interface SignInNotificationProps {
  name?: string;
  loginTime: string;
  deviceInfo: {
    ip?: string;
    browser?: string;
    os?: string;
    location?: string;
  };
  companyName?: string;
  supportLink?: string;
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
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333333",
  margin: "16px 0",
};

const details = {
  backgroundColor: "#f5f5f5",
  padding: "16px",
  borderRadius: "4px",
  margin: "24px 0",
  borderLeft: "4px solid #e53e3e",
};

const detailText = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#4a5568",
  margin: "8px 0",
};

const link = {
  color: "#3182ce",
  textDecoration: "underline",
  marginLeft: "4px",
};

const button = {
  backgroundColor: "#e53e3e",
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

export const SignInNotificationEmail = ({
  name = "User",
  loginTime,
  deviceInfo,
  companyName = process.env.EMAIL_FROM_NAME,
  supportLink = process.env.SUPPORT_LINK,
}: SignInNotificationProps) => (
  <Html>
    <Head />
    <Preview>Security Alert: New login detected</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Security Alert: New Login Detected</Text>

        <Text style={paragraph}>Hello {name},</Text>

        <Text style={paragraph}>
          We detected a new login to your {companyName} account on{" "}
          <strong>{loginTime}</strong>.
        </Text>

        <Section style={details}>
          <Text style={detailText}>
            <strong>📍 Location:</strong> {deviceInfo.location || "Unknown"}
          </Text>
          <Text style={detailText}>
            <strong>📱 Device:</strong> {deviceInfo.browser || "Unknown"} on{" "}
            {deviceInfo.os || "Unknown"}
          </Text>
          <Text style={detailText}>
            <strong>🌐 IP Address:</strong> {deviceInfo.ip || "Not available"}
          </Text>
        </Section>

        <Text style={paragraph}>
          If this was you, no action is required. If you don&#39;t recognize
          this activity:
        </Text>

        <Button style={button} href={`${supportLink}/security`}>
          Secure Your Account
        </Button>

        <Text style={paragraph}>
          For your security, we recommend changing your password immediately if
          you didn&#39;t authorize this login.
        </Text>

        <Text style={paragraph}>
          Need help? Contact our{" "}
          <Link style={link} href={supportLink}>
            support team
          </Link>
          .
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

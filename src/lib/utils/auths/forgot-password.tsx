// // File: src/emails/auths/forgot-password.tsx
import { Html, Head, Preview, Body, Container, Section, Text, Link, Button } from '@react-email/components';

interface ForgotPasswordProps {
  name?: string;
  resetLink: string;
  expiryHours?: number;
  companyName?: string;
  supportEmail?: string;
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const heading = {
  fontSize: '24px',
  lineHeight: 1.3,
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: 1.4,
  color: '#484848',
  margin: '0 0 15px',
};

const buttonContainer = {
  padding: '20px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '0 auto',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  fontSize: '14px',
  color: '#9ca3af',
  marginTop: '30px',
  textAlign: 'center' as const,
};

export const ForgotPasswordEmail = ({ 
  name = 'User',
  resetLink,
  expiryHours = 1,
  companyName = process.env.EMAIL_FROM_NAME || 'Jubilee Care ICT Innovations and Consult',
  supportEmail = process.env.SUPPORT_EMAIL || 'support@jubileecare.com',
}: ForgotPasswordProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Password Reset Request</Text>
        
        <Text style={paragraph}>Hello {name},</Text>
        
        <Text style={paragraph}>
          We received a request to reset your {companyName} account password. 
          Click the button below to proceed:
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>

        <Text style={paragraph}>
          <strong>This link expires in {expiryHours} hour{expiryHours !== 1 ? 's' : ''}.</strong> 
          If you didn&#39;t request this, please ignore this email.
        </Text>

        <Text style={paragraph}>
          For security reasons, this link will expire after use or when the time limit is reached.
        </Text>

        <Text style={paragraph}>
          Need help? Contact our <Link style={link} href={`mailto:${supportEmail}`}>
            support team
          </Link>.
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);
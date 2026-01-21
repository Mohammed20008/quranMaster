import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  actionUrl: string;
}

export const NewMessageEmail = ({
  recipientName = 'User',
  senderName = 'Ahmad',
  messagePreview = 'Assalamu Alaykum, are we still on for today?',
  actionUrl = 'https://quranmaster.com/dashboard',
}: NewMessageEmailProps) => (
  <Html>
    <Head />
    <Preview>New message from {senderName} on QuranMaster</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <div style={gradientHeader}>
            <Heading style={headerTitle}>QuranMaster</Heading>
          </div>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>New Message Received</Heading>
          
          <Text style={text}>
            Hello {recipientName},
          </Text>

          <Text style={text}>
            You have received a new message from <strong style={goldText}>{senderName}</strong>.
          </Text>

          <Section style={messageBox}>
             <Text style={messageText}>"{messagePreview}"</Text>
          </Section>

          <Section style={buttonSection}>
             <Button style={primaryButton} href={actionUrl}>
               View Message
             </Button>
          </Section>
          
          <Text style={subText}>
            Or reply directly by logging into your dashboard.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} QuranMaster. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewMessageEmail;

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const headerSection = { marginBottom: '0' };
const gradientHeader = {
  background: 'linear-gradient(135deg, #d4af37 0%, #b4941f 100%)',
  padding: '30px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
};
const headerTitle = { color: '#fff', fontSize: '24px', margin: 0 };

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '0 0 12px 12px',
};

const h1 = { color: '#1f2937', fontSize: '24px', marginBottom: '24px', textAlign: 'center' as const };
const text = { color: '#374151', fontSize: '16px', lineHeight: '24px', margin: '16px 0' };
const goldText = { color: '#d4af37' };

const messageBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #d4af37',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
};
const messageText = { 
  color: '#4b5563', 
  fontStyle: 'italic' as const,
  margin: 0
};

const buttonSection = { textAlign: 'center' as const, marginTop: '32px' };
const primaryButton = {
  backgroundColor: '#d4af37',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const subText = { color: '#9ca3af', fontSize: '14px', textAlign: 'center' as const, marginTop: '24px' };

const footer = { padding: '24px', textAlign: 'center' as const };
const footerText = { color: '#9ca3af', fontSize: '12px' };

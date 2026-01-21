import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface TeacherApprovedEmailProps {
  teacherName: string;
  loginUrl: string;
  profileUrl: string;
}

export const TeacherApprovedEmail = ({
  teacherName = 'Ahmad',
  loginUrl = 'https://quranmaster.com/login',
  profileUrl = 'https://quranmaster.com/teacher/profile',
}: TeacherApprovedEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Congratulations! Your QuranMaster teacher application has been approved</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Gold Gradient */}
        <Section style={headerSection}>
          <div style={gradientHeader}>
            <Heading style={headerTitle}>QuranMaster</Heading>
            <Text style={headerSubtitle}>Premium Learning Platform</Text>
          </div>
        </Section>

        {/* Success Icon */}
        <Section style={iconSection}>
          <div style={successIcon}>✓</div>
        </Section>

        {/* Main Content */}
        <Section style={contentSection}>
          <Heading style={h1}>Congratulations, {teacherName}!</Heading>
          
          <Text style={text}>
            We're excited to inform you that your application to become a Quran teacher on QuranMaster has been <strong style={goldText}>approved</strong>! 🎉
          </Text>

          <Text style={text}>
            You are now part of our elite community of certified Quran educators helping students around the world master the Quran.
          </Text>

          {/* What's Next Section */}
          <Section style={nextStepsSection}>
            <Heading style={h2}>What's Next?</Heading>
            
            <div style={stepContainer}>
              <div style={stepNumber}>1</div>
              <div style={stepContent}>
                <Text style={stepTitle}>Complete Your Profile</Text>
                <Text style={stepText}>
                  Add your availability, teaching preferences, and introduction video to attract students.
                </Text>
              </div>
            </div>

            <div style={stepContainer}>
              <div style={stepNumber}>2</div>
              <div style={stepContent}>
                <Text style={stepTitle}>Set Your Schedule</Text>
                <Text style={stepText}>
                  Configure your weekly availability so students can book sessions that work for you.
                </Text>
              </div>
            </div>

            <div style={stepContainer}>
              <div style={stepNumber}>3</div>
              <div style={stepContent}>
                <Text style={stepTitle}>Start Teaching</Text>
                <Text style={stepText}>
                  Accept booking requests and begin your rewarding journey teaching the Quran.
                </Text>
              </div>
            </div>
          </Section>

          {/* CTA Buttons */}
          <Section style={buttonSection}>
            <Button style={primaryButton} href={profileUrl}>
              View Your Profile
            </Button>
            <Button style={secondaryButton} href={loginUrl}>
              Login to Dashboard
            </Button>
          </Section>

          {/* Benefits Section */}
          <Section style={benefitsSection}>
            <Heading style={h3}>Your Teacher Benefits</Heading>
            <ul style={benefitsList}>
              <li style={benefitItem}>✨ Featured teacher spotlight opportunities</li>
              <li style={benefitItem}>📊 Real-time analytics and student feedback</li>
              <li style={benefitItem}>💰 Flexible pricing - set your own rates</li>
              <li style={benefitItem}>🌍 Global student reach</li>
              <li style={benefitItem}>🛡️ Secure payment processing</li>
              <li style={benefitItem}>📚 Access to teaching resources</li>
            </ul>
          </Section>

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportText}>
              Need help getting started? Our support team is here for you!
            </Text>
            <Link href="mailto:support@quranmaster.com" style={supportLink}>
              support@quranmaster.com
            </Link>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} QuranMaster. All rights reserved.
          </Text>
          <Text style={footerText}>
            Building the future of Quran education, one lesson at a time.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default TeacherApprovedEmail;

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const headerSection = {
  marginBottom: '32px',
};

const gradientHeader = {
  background: 'linear-gradient(135deg, #d4af37 0%, #b4941f 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '16px 16px 0 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '-0.5px',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  margin: '8px 0 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const iconSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#ffffff',
};

const successIcon = {
  display: 'inline-block',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '48px',
  lineHeight: '80px',
  fontWeight: 'bold',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '0 40px 40px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const goldText = {
  color: '#d4af37',
  fontWeight: 'bold',
};

const nextStepsSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  border: '2px solid #e5e7eb',
};

const stepContainer = {
  display: 'flex',
  margin: '16px 0',
  alignItems: 'flex-start',
};

const stepNumber = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#d4af37',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px',
  flexShrink: 0,
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const stepText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
};

const buttonSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const primaryButton = {
  backgroundColor: '#d4af37',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '8px 4px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '8px 4px',
  border: '2px solid #d4af37',
};

const benefitsSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  borderLeft: '4px solid #d4af37',
};

const benefitsList = {
  margin: '16px 0',
  padding: '0 0 0 20px',
};

const benefitItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '8px 0',
};

const supportSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f3f4f6',
  borderRadius: '12px',
  textAlign: 'center' as const,
};

const supportText = {
  color: '#4b5563',
  fontSize: '15px',
  margin: '0 0 12px 0',
};

const supportLink = {
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
};

const footer = {
  backgroundColor: '#1f2937',
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderRadius: '0 0 16px 16px',
  marginTop: '32px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '8px 0',
};

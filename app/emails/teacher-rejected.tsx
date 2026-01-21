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

interface TeacherRejectedEmailProps {
  teacherName: string;
  reapplyUrl: string;
  supportEmail: string;
  feedback?: string;
}

export const TeacherRejectedEmail = ({
  teacherName = 'Ahmad',
  reapplyUrl = 'https://quranmaster.com/learn/join-teacher',
  supportEmail = 'support@quranmaster.com',
  feedback,
}: TeacherRejectedEmailProps) => (
  <Html>
    <Head />
    <Preview>Update on your QuranMaster teacher application</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Gold Gradient */}
        <Section style={headerSection}>
          <div style={gradientHeader}>
            <Heading style={headerTitle}>QuranMaster</Heading>
            <Text style={headerSubtitle}>Premium Learning Platform</Text>
          </div>
        </Section>

        {/* Main Content */}
        <Section style={contentSection}>
          <Heading style={h1}>Dear {teacherName},</Heading>
          
          <Text style={text}>
            Thank you for your interest in becoming a Quran teacher on QuranMaster. We truly appreciate the time and effort you put into your application.
          </Text>

          <Text style={text}>
            After careful review, we regret to inform you that we are unable to approve your application at this time.
          </Text>

          {/* Feedback Section (if provided) */}
          {feedback && (
            <Section style={feedbackSection}>
              <Heading style={h3}>Feedback from Our Team</Heading>
              <Text style={feedbackText}>{feedback}</Text>
            </Section>
          )}

          {/* Encouragement Section */}
          <Section style={encouragementSection}>
            <Heading style={h2}>This is Not the End</Heading>
            
            <Text style={text}>
              We encourage you to continue developing your teaching skills and expertise. Many successful teachers on our platform were not accepted on their first application.
            </Text>

            <div style={tipContainer}>
              <div style={tipIcon}>💡</div>
              <div style={tipContent}>
                <Text style={tipTitle}>Tips for Reapplying:</Text>
                <ul style={tipsList}>
                  <li style={tipItem}>Enhance your qualifications and certifications</li>
                  <li style={tipItem}>Gain more teaching experience</li>
                  <li style={tipItem}>Improve your demo recitation and lecture</li>
                  <li style={tipItem}>Provide more detailed teaching methodology</li>
                  <li style={tipItem}>Obtain Ijazah certification if you haven't already</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Reapply Section */}
          <Section style={reapplySection}>
            <Heading style={h3}>Ready to Try Again?</Heading>
            <Text style={text}>
              We welcome you to reapply in the future once you've had the opportunity to strengthen your application.
            </Text>
            <div style={buttonContainer}>
              <Button style={primaryButton} href={reapplyUrl}>
                Reapply as Teacher
              </Button>
            </div>
          </Section>

          {/* Alternative Options */}
          <Section style={alternativeSection}>
            <Heading style={h3}>Other Ways to Contribute</Heading>
            <Text style={text}>
              While you work on your teacher application, you can still be part of our community:
            </Text>
            <ul style={optionsList}>
              <li style={optionItem}>📚 Join as a student to learn advanced Tajweed</li>
              <li style={optionItem}>✍️ Contribute to our blog and resources</li>
              <li style={optionItem}>🤝 Participate in our community forums</li>
              <li style={optionItem}>💬 Share feedback to help us improve</li>
            </ul>
          </Section>

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportTitle}>Questions or Need Guidance?</Text>
            <Text style={supportText}>
              Our team is here to help you understand the requirements and prepare for a future application.
            </Text>
            <Link href={`mailto:${supportEmail}`} style={supportLink}>
              {supportEmail}
            </Link>
          </Section>

          {/* Closing */}
          <Section style={closingSection}>
            <Text style={text}>
              Thank you again for your interest in QuranMaster. We wish you all the best in your Quranic journey and hope to see your application again in the future, insha'Allah.
            </Text>
            <Text style={signature}>
              With respect and best wishes,<br />
              <strong style={goldText}>The QuranMaster Team</strong>
            </Text>
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

export default TeacherRejectedEmail;

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

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '40px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
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
};

const feedbackSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  borderLeft: '4px solid #f59e0b',
};

const feedbackText = {
  color: '#78350f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '12px 0 0 0',
  fontStyle: 'italic' as const,
};

const encouragementSection = {
  margin: '32px 0',
};

const tipContainer = {
  display: 'flex',
  margin: '24px 0',
  padding: '24px',
  backgroundColor: '#f0f9ff',
  borderRadius: '12px',
  border: '2px solid #bfdbfe',
};

const tipIcon = {
  fontSize: '32px',
  marginRight: '16px',
  flexShrink: 0,
};

const tipContent = {
  flex: 1,
};

const tipTitle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const tipsList = {
  margin: '0',
  padding: '0 0 0 20px',
};

const tipItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '6px 0',
};

const reapplySection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  textAlign: 'center' as const,
};

const buttonContainer = {
  margin: '24px 0 0 0',
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
};

const alternativeSection = {
  margin: '32px 0',
};

const optionsList = {
  margin: '16px 0',
  padding: '0 0 0 20px',
};

const optionItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '8px 0',
};

const supportSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  textAlign: 'center' as const,
  border: '2px solid #a7f3d0',
};

const supportTitle = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const supportText = {
  color: '#047857',
  fontSize: '15px',
  margin: '0 0 12px 0',
};

const supportLink = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
};

const closingSection = {
  margin: '32px 0 0 0',
  padding: '32px 0 0 0',
  borderTop: '2px solid #e5e7eb',
};

const signature = {
  color: '#4b5563',
  fontSize: '16px',
  margin: '24px 0 0 0',
  lineHeight: '24px',
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

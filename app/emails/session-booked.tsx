import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
  Button,
} from '@react-email/components';

interface SessionBookedEmailProps {
  teacherName: string;
  studentName: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  duration: number;
}

export const SessionBookedEmail = ({
  teacherName = 'Teacher Name',
  studentName = 'Student Name',
  sessionDate = 'January 15, 2026',
  sessionTime = '10:00 AM',
  subject = 'Quran Recitation',
  duration = 60,
}: SessionBookedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Session Confirmed: {subject} with {teacherName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] shadow-lg">
            <Section className="mt-[32px]">
              <div className="mx-auto w-[60px] h-[60px] bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                ✓
              </div>
            </Section>
            <Heading className="text-[#1a1a1a] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Session <strong className="text-[#10b981]">Confirmed!</strong>
            </Heading>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Dear <strong>{studentName}</strong>,
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Great news! Your session with <strong>{teacherName}</strong> has been confirmed.
            </Text>
            
            <Section className="bg-[#f9fafb] p-[20px] rounded-lg my-[24px] border border-[#e5e7eb]">
              <Text className="text-[#6b7280] text-[12px] font-bold uppercase tracking-wider mb-[12px] mt-0">
                Session Details
              </Text>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a] text-[14px]">📚 Subject:</span>
                  <strong className="text-[#1a1a1a] text-[14px]">{subject}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a] text-[14px]">📅 Date:</span>
                  <strong className="text-[#1a1a1a] text-[14px]">{sessionDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a] text-[14px]">🕐 Time:</span>
                  <strong className="text-[#1a1a1a] text-[14px]">{sessionTime}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a] text-[14px]">⏱️ Duration:</span>
                  <strong className="text-[#1a1a1a] text-[14px]">{duration} minutes</strong>
                </div>
              </div>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#10b981] rounded text-white text-[12px] font-bold no-underline text-center px-6 py-4 shadow-sm"
                href="#"
              >
                Add to Calendar
              </Button>
            </Section>

            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Please be ready 5 minutes before the session starts. A meeting link will be sent to you shortly.
            </Text>

            <Hr className="border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#888888] text-[12px] leading-[20px]">
              Need to reschedule? Contact your teacher or visit your dashboard.
              <br />
              <br />
              Looking forward to the session,
              <br />
              <strong>The QuranMaster Team</strong>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SessionBookedEmail;

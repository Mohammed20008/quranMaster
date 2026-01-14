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
} from '@react-email/components';

interface TeacherRejectionEmailProps {
  teacherName: string;
  reason: string;
}

export const TeacherRejectionEmail = ({
  teacherName = 'Teacher',
  reason = 'Credentials not verified.',
}: TeacherRejectionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Update regarding your QuranMaster application</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] shadow-lg">
            <Section className="mt-[32px]">
              <div className="mx-auto w-[60px] h-[60px] bg-gradient-to-br from-[#d4af37] to-[#b4941f] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                QM
              </div>
            </Section>
            <Heading className="text-[#1a1a1a] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Update Regarding Your Application
            </Heading>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Dear <strong>{teacherName}</strong>,
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              We truly appreciate the time and effort you put into applying to join <strong>QuranMaster</strong>. It was a privilege to review your qualifications.
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              We adhere to specific guidelines to ensure consistency across our platform. Regrettably, we are unable to proceed with your application at this current time due to the following reason:
            </Text>
            <Hr className="border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#d4af37] text-[12px] font-bold uppercase tracking-wider">
              Feedback
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px] bg-[#fffbf0] p-4 rounded border border-[#fcefc7] italic">
              "{reason}"
            </Text>
            <Hr className="border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Please accept our sincere apologies for any disappointment this may cause. We encourage you to address these points and would welcome a future application from you.
            </Text>
            <Text className="text-[#888888] text-[14px] leading-[24px]">
              With respect and best wishes,
              <br />
              <strong>The QuranMaster Team</strong>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeacherRejectionEmail;

import * as React from 'react';
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
  Tailwind,
  Hr,
} from '@react-email/components';

interface TeacherApprovalEmailProps {
  teacherName: string;
  profileUrl: string;
}

export const TeacherApprovalEmail = ({
  teacherName = 'Teacher',
  profileUrl = 'https://quranmaster.com/teachers/123',
}: TeacherApprovalEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to QuranMaster! Your application has been approved.</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] shadow-lg">
            <Section className="mt-[32px]">
              <div className="mx-auto w-[60px] h-[60px] bg-gradient-to-br from-[#d4af37] to-[#b4941f] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                QM
              </div>
            </Section>
            <Heading className="text-[#1a1a1a] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to the <strong className="text-[#d4af37]">QuranMaster</strong> Family
            </Heading>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Dear <strong>{teacherName}</strong>,
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              We are delighted to welcome you to our distinguished community of educators. Your expertise and dedication to teaching the Quran have impressed us, and we are honored to have you join us in our mission.
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Your application has been formally <strong>approved</strong>. You may now access your profile, manage your schedule, and begin connecting with students who are eager to learn.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#d4af37] rounded text-white text-[12px] font-bold no-underline text-center px-6 py-4 shadow-sm"
                href={profileUrl}
              >
                Access Your Dashboard
              </Button>
            </Section>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              or access directly via this link:
              <br />
              <Link href={profileUrl} className="text-[#d4af37] no-underline">
                {profileUrl}
              </Link>
            </Text>
            <Hr className="border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#888888] text-[12px] leading-[20px]">
              We look forward to the knowledge and inspiration you will bring to our students.
              <br />
              <br />
              Warm regards,
              <br />
              <strong>The QuranMaster Team</strong>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeacherApprovalEmail;

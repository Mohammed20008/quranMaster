import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from '@react-email/components';

interface TeacherWelcomeEmailProps {
  teacherName: string;
}

export const TeacherWelcomeEmail = ({
  teacherName = 'Teacher',
}: TeacherWelcomeEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quranmaster.com';
  
  return (
    <Html>
      <Head />
      <Preview>Thank you for applying to join QuranMaster!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] shadow-lg">
            <Section className="mt-[32px]">
              <div className="mx-auto w-[60px] h-[60px] bg-gradient-to-br from-[#d4af37] to-[#b4941f] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                ✨
              </div>
            </Section>
            <Heading className="text-[#1a1a1a] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Application <strong className="text-[#d4af37]">Received!</strong>
            </Heading>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Dear <strong>{teacherName}</strong>,
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Thank you for your interest in joining the QuranMaster teaching community! We're excited to review your application.
            </Text>
            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              Our team will carefully review your qualifications and experience. You can expect to hear back from us within <strong>2-3 business days</strong>.
            </Text>
            
            <Section className="bg-[#fff9db] p-[20px] rounded-lg my-[24px] border border-[#fcefc7]">
              <Text className="text-[#d4af37] text-[12px] font-bold uppercase tracking-wider mb-[12px] mt-0">
                What Happens Next?
              </Text>
              <ol className="text-[#4a4a4a] text-[14px] leading-[24px] pl-[20px] my-0">
                <li>Our team reviews your application materials</li>
                <li>We verify your qualifications and experience</li>
                <li>You receive a decision via email</li>
                <li>If approved, you'll gain access to your teacher dashboard</li>
              </ol>
            </Section>

            <Text className="text-[#4a4a4a] text-[14px] leading-[24px]">
              In the meantime, feel free to explore our platform and see how we're helping students connect with qualified teachers.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                className="text-[#d4af37] no-underline font-bold"
                href={appUrl}
              >
                Visit QuranMaster →
              </Link>
            </Section>

            <Hr className="border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#888888] text-[12px] leading-[20px]">
              If you have any questions, please don't hesitate to reach out.
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

export default TeacherWelcomeEmail;

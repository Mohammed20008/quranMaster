import React from 'react';
import LearnPage from '../page';

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const resolvedParams = await params;
  return <LearnPage subject={resolvedParams.subject} />;
}

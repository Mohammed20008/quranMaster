'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeacherApplication, Teacher } from '@/types/teacher';

interface TeacherContextType {
  applications: TeacherApplication[];
  teachers: Teacher[];
  submitApplication: (application: Omit<TeacherApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveApplication: (applicationId: string, adminNotes?: string) => void;
  rejectApplication: (applicationId: string, adminNotes: string) => void;
  getApplication: (id: string) => TeacherApplication | undefined;
  getTeacher: (id: string) => Teacher | undefined;
  getTeacherByEmail: (email: string) => Teacher | undefined;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load from localStorage
  useEffect(() => {
    const storedApplications = localStorage.getItem('teacher_applications');
    const storedTeachers = localStorage.getItem('teachers');
    
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    
    if (storedTeachers) {
      setTeachers(JSON.parse(storedTeachers));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('teacher_applications', JSON.stringify(applications));
    }
  }, [applications]);

  useEffect(() => {
    if (teachers.length > 0) {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
  }, [teachers]);

  const submitApplication = (applicationData: Omit<TeacherApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApplication: TeacherApplication = {
      ...applicationData,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setApplications(prev => [newApplication, ...prev]);
  };

  const approveApplication = (applicationId: string, adminNotes?: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    // Update application status
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status: 'approved' as const, reviewedAt: new Date().toISOString(), adminNotes }
        : app
    ));

    // Create teacher profile
    const newTeacher: Teacher = {
      id: `teacher_${Date.now()}`,
      name: application.personalInfo.name,
      email: application.personalInfo.email,
      phone: application.personalInfo.phone,
      photo: application.personalInfo.photo || '/default-avatar.png',
      bio: application.bio,
      qualifications: [...application.qualifications.degrees, ...application.qualifications.certifications],
      subjects: application.teachingInfo.subjects,
      levels: application.teachingInfo.levels,
      rating: 5.0,
      reviewCount: 0,
      profileUrl: `/teachers/${application.personalInfo.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      hourlyRate: application.teachingInfo.hourlyRate,
      availability: application.teachingInfo.availability,
      ijazah: application.qualifications.ijazah,
      joinedAt: new Date().toISOString(),
    };

    setTeachers(prev => [newTeacher, ...prev]);
  };

  const rejectApplication = (applicationId: string, adminNotes: string) => {
    // 1. Update application status
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status: 'rejected' as const, reviewedAt: new Date().toISOString(), adminNotes }
        : app
    ));

    // 2. Remove from teachers list if exists (Effectively "Delete Teacher")
    const application = applications.find(app => app.id === applicationId);
    if (application) {
       setTeachers(prev => prev.filter(t => t.email !== application.personalInfo.email));
    }
  };

  const getApplication = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getTeacher = (idOrSlug: string) => {
    return teachers.find(teacher => 
      teacher.id === idOrSlug || 
      teacher.profileUrl.endsWith(`/${idOrSlug}`)
    );
  };

  const getTeacherByEmail = (email: string) => {
    return teachers.find(teacher => teacher.email === email);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === id ? { ...teacher, ...updates } : teacher
    ));
  };

  return (
    <TeacherContext.Provider
      value={{
        applications,
        teachers,
        submitApplication,
        approveApplication,
        rejectApplication,
        getApplication,
        getTeacher,
        getTeacherByEmail,
        updateTeacher,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeachers() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeachers must be used within a TeacherProvider');
  }
  return context;
}

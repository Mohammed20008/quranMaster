export interface TeacherApplication {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    photo?: string;
  };
  qualifications: {
    degrees: string[];
    certifications: string[];
    experience: string;
    ijazah: boolean;
  };
  teachingInfo: {
    subjects: string[];
    levels: string[];
    availability: string;
    hourlyRate?: number;
  };
  credentials: string[]; // File URLs/paths
  demoRecitation: string; // Link to Surah Maryam recitation
  demoLecture: string; // Link to Iqlab rule video
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  qualifications: string[];
  subjects: string[];
  levels: string[];
  rating: number;
  reviewCount: number;
  profileUrl: string;
  hourlyRate?: number;
  availability: string;
  ijazah: boolean;
  joinedAt: string;
}

export interface TeacherSession {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

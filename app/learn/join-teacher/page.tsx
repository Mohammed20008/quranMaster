'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import styles from './join-teacher.module.css';
import { TeacherApplication } from '@/types/teacher';

const SUBJECTS = ['Quran Recitation', 'Tajweed', 'Arabic Language', 'Islamic Studies', 'Hadith', 'Fiqh', 'Tafsir'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Children', 'Adults'];

export default function JoinTeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { submitApplication } = useTeachers();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<TeacherApplication, 'id' | 'status' | 'submittedAt' | 'reviewedAt' | 'adminNotes'>>({
    personalInfo: { name: '', email: '', phone: '', photo: '' },
    qualifications: { degrees: [''], certifications: [''], experience: '', ijazah: false },
    teachingInfo: { subjects: [], levels: [], availability: '', hourlyRate: undefined },
    credentials: [],
    demoRecitation: '',
    demoLecture: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: user.name || '',
          email: user.email || '',
          photo: user.avatar || ''
        }
      }));
    }
  }, [user]);

  const updateField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev as any)[section], [field]: value }
    }));
  };

  const handleSubmit = () => {
    submitApplication(formData);
    alert('Application submitted successfully! You will be notified via email once reviewed.');
    router.push('/learn');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Join as a Teacher</h1>
        <p>Share your knowledge and inspire others</p>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`${styles.step} ${s <= step ? styles.activeStep : ''}`}>
            <div className={styles.stepNumber}>{s}</div>
            <div className={styles.stepLabel}>
              {s === 1 ? 'Personal' : s === 2 ? 'Qualifications' : s === 3 ? 'Teaching' : 'Review'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formContainer}>
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.formSection}>
            <h2>Personal Information</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.personalInfo.name}
              onChange={e => updateField('personalInfo', 'name', e.target.value)}
              className={styles.input}
            />
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.personalInfo.email}
                readOnly
                className={`${styles.input} ${styles.readOnlyInput}`}
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#10b981' }}>
                ✓ Verified
              </span>
            </div>
            <input
              type="tel"
              placeholder="Phone"
              value={formData.personalInfo.phone}
              onChange={e => updateField('personalInfo', 'phone', e.target.value)}
              className={styles.input}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.formSection}>
            <h2>Qualifications</h2>
            <textarea
              placeholder="Degrees & Education"
              value={formData.qualifications.degrees.join('\n')}
              onChange={e => updateField('qualifications', 'degrees', e.target.value.split('\n'))}
              className={styles.textarea}
              rows={3}
            />
            <textarea
              placeholder="Certifications"
              value={formData.qualifications.certifications.join('\n')}
              onChange={e => updateField('qualifications', 'certifications', e.target.value.split('\n'))}
              className={styles.textarea}
              rows={3}
            />
            <textarea
              placeholder="Teaching Experience"
              value={formData.qualifications.experience}
              onChange={e => updateField('qualifications', 'experience', e.target.value)}
              className={styles.textarea}
              rows={4}
            />
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.qualifications.ijazah}
                onChange={e => updateField('qualifications', 'ijazah', e.target.checked)}
              />
              I have Ijazah in Quran recitation
            </label>

            <div style={{marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem'}}>
               <h3 style={{fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)'}}>Demo Content (Required)</h3>
               <p style={{fontSize: '0.9rem', color: 'var(--foreground-secondary)', marginBottom: '1rem'}}>
                 Please upload these files to Google Drive (make sure they are public/shareable) and paste the links below.
               </p>
               <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Recitation: Surah Maryam (Page 1)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.demoRecitation || ''}
                    onChange={e => setFormData(prev => ({...prev, demoRecitation: e.target.value}))}
                    className={styles.input}
                    required
                  />
               </div>
               <div>
                  <label style={{display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600}}>Explanation: Iqlab Rule (Video)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.demoLecture || ''}
                    onChange={e => setFormData(prev => ({...prev, demoLecture: e.target.value}))}
                    className={styles.input}
                    required
                  />
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.formSection}>
            <h2>Teaching Information</h2>
            <div className={styles.checkGroup}>
              <label>Subjects you can teach:</label>
              {SUBJECTS.map(subject => (
                <label key={subject} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.teachingInfo.subjects.includes(subject)}
                    onChange={e => {
                      const checked = e.target.checked;
                      updateField('teachingInfo', 'subjects', checked
                        ? [...formData.teachingInfo.subjects, subject]
                        : formData.teachingInfo.subjects.filter(s => s !== subject)
                      );
                    }}
                  />
                  {subject}
                </label>
              ))}
            </div>
            <div className={styles.checkGroup}>
              <label>Student levels:</label>
              {LEVELS.map(level => (
                <label key={level} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.teachingInfo.levels.includes(level)}
                    onChange={e => {
                      const checked = e.target.checked;
                      updateField('teachingInfo', 'levels', checked
                        ? [...formData.teachingInfo.levels, level]
                        : formData.teachingInfo.levels.filter(l => l !== level)
                      );
                    }}
                  />
                  {level}
                </label>
              ))}
            </div>
            <input
              type="number"
              placeholder="Hourly Rate (optional, in USD)"
              value={formData.teachingInfo.hourlyRate || ''}
              onChange={e => updateField('teachingInfo', 'hourlyRate', parseInt(e.target.value) || undefined)}
              className={styles.input}
            />
            <textarea
              placeholder="Your availability (e.g., Weekdays 6-9 PM EST)"
              value={formData.teachingInfo.availability}
              onChange={e => updateField('teachingInfo', 'availability', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.formSection}>
            <h2>Bio & Review</h2>
            <textarea
              placeholder="Tell us about yourself and your teaching philosophy..."
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className={styles.textarea}
              rows={6}
            />
            <div className={styles.summary}>
              <h3>Application Summary</h3>
              <p><strong>Name:</strong> {formData.personalInfo.name}</p>
              <p><strong>Email:</strong> {formData.personalInfo.email}</p>
              <p><strong>Subjects:</strong> {formData.teachingInfo.subjects.join(', ')}</p>
              <p><strong>Levels:</strong> {formData.teachingInfo.levels.join(', ')}</p>
              {formData.qualifications.ijazah && <p><strong>✓</strong> Has Ijazah</p>}
            </div>
          </motion.div>
        )}

        <div className={styles.buttons}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className={styles.backBtn}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className={styles.nextBtn}>
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className={styles.submitBtn}>
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

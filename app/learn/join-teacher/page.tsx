'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import styles from './join-teacher.module.css';
import { TeacherApplication } from '@/types/teacher';

const SUBJECTS = ['Quran Recitation', 'Tajweed', 'Arabic Language', 'Islamic Studies', 'Hadith', 'Fiqh', 'Tafsir'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Children', 'Adults'];

interface ValidationErrors {
  [key: string]: string;
}

export default function JoinTeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { submitApplication, getTeacherByEmail } = useTeachers();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  
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
    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.personalInfo.name.trim()) {
      newErrors['personalInfo.name'] = 'Full name is required';
    }
    
    if (!formData.personalInfo.email.trim()) {
      newErrors['personalInfo.email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
      newErrors['personalInfo.email'] = 'Please enter a valid email';
    }
    
    if (!formData.personalInfo.phone.trim()) {
      newErrors['personalInfo.phone'] = 'Phone number is required';
    }
    
    if (!formData.personalInfo.photo) {
      newErrors['personalInfo.photo'] = 'Profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const validDegrees = formData.qualifications.degrees.filter(d => d.trim());
    if (validDegrees.length === 0) {
      newErrors['qualifications.degrees'] = 'At least one degree/education is required';
    }
    
    if (!formData.qualifications.experience.trim()) {
      newErrors['qualifications.experience'] = 'Teaching experience is required';
    } else if (formData.qualifications.experience.trim().length < 20) {
      newErrors['qualifications.experience'] = 'Please provide more detail (minimum 20 characters)';
    }
    
    if (!formData.demoRecitation.trim()) {
      newErrors['demoRecitation'] = 'Recitation demo link is required';
    } else if (!isValidUrl(formData.demoRecitation)) {
      newErrors['demoRecitation'] = 'Please enter a valid URL';
    }
    
    if (!formData.demoLecture.trim()) {
      newErrors['demoLecture'] = 'Lecture demo link is required';
    } else if (!isValidUrl(formData.demoLecture)) {
      newErrors['demoLecture'] = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (formData.teachingInfo.subjects.length === 0) {
      newErrors['teachingInfo.subjects'] = 'Please select at least one subject';
    }
    
    if (formData.teachingInfo.levels.length === 0) {
      newErrors['teachingInfo.levels'] = 'Please select at least one student level';
    }
    
    if (!formData.teachingInfo.availability.trim()) {
      newErrors['teachingInfo.availability'] = 'Availability information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.bio.trim()) {
      newErrors['bio'] = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      newErrors['bio'] = 'Bio must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setIsSubmitting(true);

    // Check if email already exists
    const existingTeacher = getTeacherByEmail(formData.personalInfo.email);
    if (existingTeacher) {
      if (existingTeacher.status === 'pending') {
        setErrors({ submit: 'Application already submitted with this email. Please wait for review.' });
        setIsSubmitting(false);
        return;
      } else if (existingTeacher.status === 'approved') {
        setErrors({ submit: 'You are already a registered teacher. Please login.' });
        setIsSubmitting(false);
        return;
      } else if (existingTeacher.status === 'rejected') {
        setErrors({ submit: 'Previous application was rejected. Please contact support for more information.' });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await submitApplication(formData);
      // Success - show success message and redirect
      router.push('/learn?application=success');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to submit application. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ 'personalInfo.photo': 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ 'personalInfo.photo': 'Image must be less than 5MB' });
      return;
    }

    // Read file and convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      updateField('personalInfo', 'photo', result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Join as a Teacher</h1>
        <p>Share your knowledge and inspire others</p>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`${styles.step} ${s <= step ? styles.activeStep : ''} ${s < step ? styles.completedStep : ''}`}>
            <div className={styles.stepNumber}>
              {s < step ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              ) : s}
            </div>
            <div className={styles.stepLabel}>
              {s === 1 ? 'Personal' : s === 2 ? 'Qualifications' : s === 3 ? 'Teaching' : 'Review'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formContainer}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.formSection}
            >
              <h2>Personal Information</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Profile Image <span className={styles.required}>*</span>
                </label>
                <div className={styles.imageUploadSection}>
                  {(imagePreview || formData.personalInfo.photo) ? (
                    <div className={styles.imagePreviewContainer}>
                      <img 
                        src={imagePreview || formData.personalInfo.photo} 
                        alt="Profile preview" 
                        className={styles.imagePreview} 
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setImagePreview('');
                          updateField('personalInfo', 'photo', '');
                        }}
                        className={styles.removeImageBtn}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p>Upload your photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id="photoUpload"
                  />
                  <label htmlFor="photoUpload" className={styles.uploadBtn}>
                    {imagePreview || formData.personalInfo.photo ? 'Change Photo' : 'Choose Photo'}
                  </label>
                </div>
                <div className={styles.inputHint}>
                  JPG, PNG or GIF • Max 5MB • Recommended: 500x500px
                </div>
                {errors['personalInfo.photo'] && <div className={styles.error}>{errors['personalInfo.photo']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.personalInfo.name}
                  onChange={e => updateField('personalInfo', 'name', e.target.value)}
                  className={`${styles.input} ${errors['personalInfo.name'] ? styles.inputError : ''}`}
                />
                {errors['personalInfo.name'] && <div className={styles.error}>{errors['personalInfo.name']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.personalInfo.email}
                  onChange={e => updateField('personalInfo', 'email', e.target.value)}
                  className={`${styles.input} ${errors['personalInfo.email'] ? styles.inputError : ''}`}
                />
                {errors['personalInfo.email'] && <div className={styles.error}>{errors['personalInfo.email']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Phone Number <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.personalInfo.phone}
                  onChange={e => updateField('personalInfo', 'phone', e.target.value)}
                  className={`${styles.input} ${errors['personalInfo.phone'] ? styles.inputError : ''}`}
                />
                {errors['personalInfo.phone'] && <div className={styles.error}>{errors['personalInfo.phone']}</div>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.formSection}
            >
              <h2>Qualifications</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Degrees & Education <span className={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="List your degrees, certifications, and educational background (one per line)"
                  value={formData.qualifications.degrees.join('\n')}
                  onChange={e => updateField('qualifications', 'degrees', e.target.value.split('\n'))}
                  className={`${styles.textarea} ${errors['qualifications.degrees'] ? styles.inputError : ''}`}
                  rows={3}
                />
                {errors['qualifications.degrees'] && <div className={styles.error}>{errors['qualifications.degrees']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Certifications (Optional)
                </label>
                <textarea
                  placeholder="List any additional certifications (one per line)"
                  value={formData.qualifications.certifications.join('\n')}
                  onChange={e => updateField('qualifications', 'certifications', e.target.value.split('\n'))}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Teaching Experience <span className={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="Describe your teaching experience, methodologies, and achievements (minimum 20 characters)"
                  value={formData.qualifications.experience}
                  onChange={e => updateField('qualifications', 'experience', e.target.value)}
                  className={`${styles.textarea} ${errors['qualifications.experience'] ? styles.inputError : ''}`}
                  rows={4}
                />
                <div className={styles.charCount}>{formData.qualifications.experience.length} characters</div>
                {errors['qualifications.experience'] && <div className={styles.error}>{errors['qualifications.experience']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.qualifications.ijazah}
                    onChange={e => updateField('qualifications', 'ijazah', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>I have Ijazah in Quran recitation</span>
                </label>
              </div>

              <div className={styles.demoSection}>
                <h3>Demo Content (Required)</h3>
                <p className={styles.demoHint}>
                  Upload these files to Google Drive (set to public/shareable) and paste the links below.
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Recitation: Surah Maryam (Page 1) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.demoRecitation}
                    onChange={e => setFormData(prev => ({ ...prev, demoRecitation: e.target.value }))}
                    className={`${styles.input} ${errors['demoRecitation'] ? styles.inputError : ''}`}
                  />
                  {errors['demoRecitation'] && <div className={styles.error}>{errors['demoRecitation']}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Explanation: Iqlab Rule (Video) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.demoLecture}
                    onChange={e => setFormData(prev => ({ ...prev, demoLecture: e.target.value }))}
                    className={`${styles.input} ${errors['demoLecture'] ? styles.inputError : ''}`}
                  />
                  {errors['demoLecture'] && <div className={styles.error}>{errors['demoLecture']}</div>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.formSection}
            >
              <h2>Teaching Information</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Subjects you can teach <span className={styles.required}>*</span>
                </label>
                <div className={styles.checkGroup}>
                  {SUBJECTS.map(subject => (
                    <label key={subject} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.teachingInfo.subjects.includes(subject)}
                        onChange={e => {
                          const checked = e.target.checked;
                          updateField(
                            'teachingInfo',
                            'subjects',
                            checked
                              ? [...formData.teachingInfo.subjects, subject]
                              : formData.teachingInfo.subjects.filter(s => s !== subject)
                          );
                        }}
                        className={styles.checkbox}
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
                {errors['teachingInfo.subjects'] && <div className={styles.error}>{errors['teachingInfo.subjects']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Student levels <span className={styles.required}>*</span>
                </label>
                <div className={styles.checkGroup}>
                  {LEVELS.map(level => (
                    <label key={level} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.teachingInfo.levels.includes(level)}
                        onChange={e => {
                          const checked = e.target.checked;
                          updateField(
                            'teachingInfo',
                            'levels',
                            checked
                              ? [...formData.teachingInfo.levels, level]
                              : formData.teachingInfo.levels.filter(l => l !== level)
                          );
                        }}
                        className={styles.checkbox}
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
                {errors['teachingInfo.levels'] && <div className={styles.error}>{errors['teachingInfo.levels']}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Hourly Rate (USD) (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.teachingInfo.hourlyRate || ''}
                  onChange={e => updateField('teachingInfo', 'hourlyRate', parseInt(e.target.value) || undefined)}
                  className={styles.input}
                  min="0"
                  max="200"
                />
                <div className={styles.inputHint}>Leave blank to be set later</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Availability <span className={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="e.g., Weekdays 6-9 PM EST, Weekends 10 AM - 2 PM"
                  value={formData.teachingInfo.availability}
                  onChange={e => updateField('teachingInfo', 'availability', e.target.value)}
                  className={`${styles.textarea} ${errors['teachingInfo.availability'] ? styles.inputError : ''}`}
                  rows={3}
                />
                {errors['teachingInfo.availability'] && <div className={styles.error}>{errors['teachingInfo.availability']}</div>}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.formSection}
            >
              <h2>Bio & Review</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tell us about yourself <span className={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="Share your teaching philosophy, approach, and what makes you a great Quran teacher... (minimum 50 characters)"
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className={`${styles.textarea} ${errors['bio'] ? styles.inputError : ''}`}
                  rows={6}
                />
                <div className={styles.charCount}>{formData.bio.length} / 50 characters minimum</div>
                {errors['bio'] && <div className={styles.error}>{errors['bio']}</div>}
              </div>

              <div className={styles.summary}>
                <h3>Application Summary</h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <strong>Name:</strong>
                    <span>{formData.personalInfo.name}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Email:</strong>
                    <span>{formData.personalInfo.email}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Phone:</strong>
                    <span>{formData.personalInfo.phone}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Subjects:</strong>
                    <span>{formData.teachingInfo.subjects.join(', ') || 'None selected'}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Levels:</strong>
                    <span>{formData.teachingInfo.levels.join(', ') || 'None selected'}</span>
                  </div>
                  {formData.qualifications.ijazah && (
                    <div className={styles.summaryItem}>
                      <strong>✓</strong>
                      <span>Has Ijazah</span>
                    </div>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div className={styles.submitError}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.submit}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.buttons}>
          {step > 1 && (
            <button onClick={handleBack} className={styles.backBtn} disabled={isSubmitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={handleNext} className={styles.nextBtn}>
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          ) : (
            <button onClick={handleSubmit} className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

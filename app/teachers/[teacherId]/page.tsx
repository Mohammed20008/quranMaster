'use client';

import { use, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useChat } from '@/app/context/chat-context';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BookingCalendar from '@/app/components/teacher/booking-calendar';
import TestimonialsCarousel from '@/app/components/teacher/testimonials-carousel';
import { getAvatarPreset, renderAvatar } from '@/app/components/avatar/avatar-utils';
import { Settings, Edit, Heart, Share2, MessageCircle } from 'lucide-react';
import TeachingJourney from '@/app/components/teacher/teaching-journey';
import styles from './teacher-profile.module.css';

// Simple wrapper for using the renderAvatar util in JSX
const AvatarDisplay = ({ avatarId, name, size }: { avatarId: string, name: string, size: number }) => {
  const preset = getAvatarPreset(avatarId);
  return renderAvatar(preset, name, size);
};

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { user, teacherId: loggedInTeacherId } = useAuth();
  const { getTeacher } = useTeachers();
  const { openChat, unreadTotal } = useChat();
  const { teacherId } = use(params);
  const teacher = getTeacher(teacherId);

  const isOwner = loggedInTeacherId === teacher?.id; // Check if current user owns this profile
  const [showVideo, setShowVideo] = useState(false);

  if (!teacher) {
    return (
      <div className={styles.notFound}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h1 className={styles.notFoundTitle}>
            Teacher Not Found
          </h1>
          <p className={styles.notFoundText}>
            The teacher profile you are looking for does not exist or has been removed.
          </p>
          <Link href="/learn" className={styles.primaryBtn} style={{ display: 'inline-block' }}>
            Browse All Teachers
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Enhanced Hero Header with Parallax Effect */}
      <div className={styles.heroWrapper}>
        {/* Animated Background */}
        <div className={styles.heroBackground}>
          {/* Animated Shapes */}
          <motion.div
            className={styles.heroShape1}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className={styles.heroShape2}
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Islamic Pattern Overlay */}
          <div className={styles.patternOverlay} />
        </div>

        {/* Back Button */}
        <Link href="/learn" className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        
        {/* Actions Group */}
        <div className={styles.actionsGroup}>
          {isOwner && (
             <Link href="/teacher/settings" className={styles.editButton}>
               <Settings size={18} /> Edit Profile
             </Link>
          )}

          <button className={styles.actionIconBtn} onClick={() => {}}>
            <Heart size={20} />
          </button>

          <button
            className={styles.actionIconBtn}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${teacher.name} - QuranMaster Teacher`,
                  text: `Check out ${teacher.name}'s profile on QuranMaster!`,
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className={styles.mainWrapper}>
        {/* Profile Card - Overlapping Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.profileCard}
        >
          <div className={styles.profileHeaderGrid}>
            {/* Avatar */}
            <div className={styles.avatarSection}>
              {teacher.photo && !teacher.avatarId ? (
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className={styles.profileAvatar}
                />
              ) : teacher.avatarId ? (
                 <div className={styles.profileAvatar} style={{ overflow: 'hidden', padding: 0 }}>
                  <AvatarDisplay avatarId={teacher.avatarId} name={teacher.name} size={150} />
                 </div>
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {teacher.name[0]}
                </div>
              )}
              {/* Online Status */}
              <div className={styles.onlineBadge} />
            </div>

            {/* Teacher Info */}
            <div className={styles.infoSection}>
              <div className={styles.nameRow}>
                <h1 className={styles.teacherName}>
                  {teacher.name}
                </h1>
                {teacher.ijazah && (
                  <div className={styles.ijazahTag}>
                    ✓ IJAZAH CERTIFIED
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.floor(teacher.rating) ? '#fbbf24' : 'var(--border)' }}>
                      ★
                    </span>
                  ))}
                </div>
                <span className={styles.ratingValue}>
                  {teacher.rating.toFixed(1)}
                </span>
                <span className={styles.reviewCount}>
                  ({teacher.reviewCount} reviews)
                </span>
              </div>

              {/* Teaching Style & Subjects */}
              <div className={styles.tagsRow}>
                 {teacher.teachingStyle?.map(style => (
                   <span key={style} className={styles.styleTag}>
                     ✨ {style}
                   </span>
                 ))}
                 {teacher.subjects.map(subject => (
                   <span key={subject} className={styles.subjectTag}>
                     {subject}
                   </span>
                 ))}
              </div>

              {/* Quick Stats */}
              <div className={styles.statsRow}>
                <div>
                  <div className={styles.statLabel}>
                    Hourly Rate
                  </div>
                  <div className={styles.statValue}>
                    ${teacher.hourlyRate || 15}/hr
                  </div>
                </div>
                <div>
                  <div className={styles.statLabel}>
                    Availability
                  </div>
                  <div className={styles.availabilityValue}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                    {teacher.availability}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.ctaSection}>
              {isOwner ? (
                <>
                <Link href="/teacher/settings" className={styles.primaryBtn}>
                  <Edit size={20} /> Manage Profile
                </Link>
                <button
                  onClick={() => openChat()}
                  className={styles.secondaryBtn}
                  style={{ position: 'relative' }}
                >
                  <MessageCircle size={20} /> Messages
                  {unreadTotal > 0 && (
                    <span className={styles.badge}>{unreadTotal}</span>
                  )}
                </button>
                </>
              ) : (
                <>
                  <button className={styles.primaryBtn}>
                    📅 Book Trial Lesson
                  </button>
                  <button 
                    onClick={() => openChat(teacher.email)}
                    className={styles.secondaryBtn}>
                    <MessageCircle size={20} /> Send Message
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.sectionCard}
            >
              <h2 className={styles.sectionTitle}>
                <span className={styles.goldBar} />
                About Me
              </h2>
              <p className={styles.bioText}>
                {teacher.bio}
              </p>
            </motion.div>

            {/* Teaching Journey */}
            <TeachingJourney joinedAt={teacher.joinedAt} />

            {/* Video Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={styles.sectionCard}
              style={{ overflow: 'hidden', padding: 0 }}
            >
              <div className={styles.videoWrapper}>
                {!showVideo ? (
                  <div
                    onClick={() => setShowVideo(true)}
                    className={styles.videoOverlay}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={styles.playButton}
                    >
                      <div className={styles.playIcon} />
                    </motion.div>
                    <div className={styles.videoText}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Watch Introduction Video
                      </h3>
                      <p style={{ opacity: 0.9 }}>
                        Get to know {teacher.name} in 2 minutes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>Video player would be here</p>
                    <p style={{ fontSize: '0.85rem' }}>(Demo mode - no video URL provided)</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Qualifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={styles.sectionCard}
            >
              <h2 className={styles.sectionTitle}>
                <span className={styles.goldBar} />
                Qualifications & Experience
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {teacher.qualifications.map((qual, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={styles.qualificationItem}
                  >
                    <div className={styles.qualIcon}>🎓</div>
                    <div>
                      <div className={styles.qualText}>
                        {qual}
                      </div>
                      <div className={styles.qualSub}>
                        Verified Credential
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <TestimonialsCarousel teacherId={teacher.id} />
            </motion.div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div>
            <div className={styles.stickySidebar}>
              {!isOwner ? (
                <>
                  {/* Booking Calendar */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <BookingCalendar
                      teacherId={teacher.id}
                      teacherName={teacher.name}
                      hourlyRate={teacher.hourlyRate}
                      availability={teacher.availability}
                    />
                  </motion.div>

                  {/* Contact Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={styles.contactCard}
                  >
                    <h3 className={styles.contactTitle}>Need Help?</h3>
                    <p className={styles.contactText}>
                      Have questions? Our support team is here to assist you.
                    </p>
                    <button className={styles.contactBtn}>
                      Contact Support
                    </button>
                  </motion.div>
                </>
              ) : (
                /* Owner View - Stats Placeholder */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={styles.contactCard}
                >
                   <h3 className={styles.contactTitle}>Your Stats</h3>
                   <div style={{ display: 'grid', gap: '1rem' }}>
                     <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '1rem' }}>
                       <div style={{ fontSize: '0.85rem', color: 'var(--foreground-secondary)' }}>Total Earnings</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>$0.00</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'var(--background-secondary)', borderRadius: '1rem' }}>
                       <div style={{ fontSize: '0.85rem', color: 'var(--foreground-secondary)' }}>Sessions Taught</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>0</div>
                     </div>
                   </div>
                   <p style={{ fontSize: '0.85rem', color: 'var(--foreground-secondary)', marginTop: '1rem', fontStyle: 'italic' }}>
                      Detailed dashboard coming soon...
                   </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { use, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BookingCalendar from '@/app/components/teacher/booking-calendar';
import TestimonialsCarousel from '@/app/components/teacher/testimonials-carousel';
import { getAvatarPreset, renderAvatar } from '@/app/components/avatar/avatar-utils';
import { Settings, Edit, Heart, Share2, MessageCircle } from 'lucide-react';
import TeachingJourney from '@/app/components/teacher/teaching-journey';

// Simple wrapper for using the renderAvatar util in JSX
const AvatarDisplay = ({ avatarId, name, size }: { avatarId: string, name: string, size: number }) => {
  const preset = getAvatarPreset(avatarId);
  return renderAvatar(preset, name, size);
};

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { user, teacherId: loggedInTeacherId } = useAuth();
  const { getTeacher } = useTeachers();
  const { teacherId } = use(params);
  const teacher = getTeacher(teacherId);

  const isOwner = loggedInTeacherId === teacher?.id; // Check if current user owns this profile

  const [showVideo, setShowVideo] = useState(false);

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '1rem' }}>
            Teacher Not Found
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px' }}>
            The teacher profile you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/learn"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #d4af37, #b4941f)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s'
            }}
          >
            Browse All Teachers
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Enhanced Hero Header with Parallax Effect */}
      <div style={{ position: 'relative', height: '350px', overflow: 'hidden' }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        }}>
          {/* Animated Shapes */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
            }}
          />
          <motion.div
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
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '15%',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            }}
          />

          {/* Islamic Pattern Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L34 26L60 30L34 34L30 60L26 34L0 30L26 26z' fill='rgba(212,175,55,0.03)'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Back Button */}
        <Link
          href="/learn"
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            color: 'white',
            fontWeight: '600',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        
        {/* Actions Group */}
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 20, display: 'flex', gap: '0.75rem' }}>
          {isOwner && (
             <Link
               href="/teacher/settings"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(10px)',
                 padding: '0.75rem 1rem',
                 borderRadius: '9999px',
                 color: '#d4af37',
                 fontWeight: '700',
                 border: 'none',
                 cursor: 'pointer',
                 textDecoration: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}
             >
               <Settings size={18} /> Edit Profile
             </Link>
          )}

          <button
             style={{
               background: 'rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(10px)',
               width: '42px', 
               height: '42px',
               borderRadius: '50%',
               color: 'white',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}
             onClick={() => {
                // Toggle favorite logic here
             }}
          >
            <Heart size={20} />
          </button>

          <button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
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

        {/* Old buttons removed - replaced by Action Group above */}
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Profile Card - Overlapping Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: '-120px',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                {teacher.photo && !teacher.avatarId ? (
                  <img
                    src={teacher.photo}
                    alt={teacher.name}
                    style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '5px solid white',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                ) : teacher.avatarId ? (
                   <div style={{
                      border: '5px solid white',
                      borderRadius: '50%',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                   }}>
                    <AvatarDisplay avatarId={teacher.avatarId} name={teacher.name} size={160} />
                   </div>
                ) : (
                  <div style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4af37, #b4941f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '4rem',
                    fontWeight: '700',
                    border: '5px solid white',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    {teacher.name[0]}
                  </div>
                )}
                {/* Online Status */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '24px',
                  height: '24px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </div>

              {/* Teacher Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827' }}>
                    {teacher.name}
                  </h1>
                  {teacher.ijazah && (
                    <div style={{
                      background: 'linear-gradient(135deg, #d4af37, #b4941f)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                    }}>
                      ✓ IJAZAH CERTIFIED
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < Math.floor(teacher.rating) ? '#fbbf24' : '#e5e7eb',
                          fontSize: '1.5rem'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {teacher.rating.toFixed(1)}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    ({teacher.reviewCount} reviews)
                  </span>
                </div>

                {/* Teaching Style & Subjects */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   {teacher.teachingStyle?.map(style => (
                     <span
                       key={style}
                       style={{
                         background: '#ecfdf5',
                         color: '#047857',
                         padding: '0.4rem 0.8rem',
                         borderRadius: '8px',
                         fontSize: '0.85rem',
                         fontWeight: '600',
                         border: '1px solid #a7f3d0'
                       }}
                     >
                       ✨ {style}
                     </span>
                   ))}
                   {teacher.subjects.map(subject => (
                     <span
                       key={subject}
                       style={{
                         background: '#f3f4f6',
                         color: '#374151',
                         padding: '0.4rem 0.8rem',
                         borderRadius: '8px',
                         fontSize: '0.85rem',
                         fontWeight: '600'
                       }}
                     >
                       {subject}
                     </span>
                   ))}
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                      Hourly Rate
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>
                      ${teacher.hourlyRate || 15}/hr
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                      Availability
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                      {teacher.availability}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                {isOwner ? (
                  <Link
                    href="/teacher/settings"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Edit size={20} /> Manage Profile
                  </Link>
                ) : (
                  <>
                    <button style={{
                      background: 'linear-gradient(135deg, #d4af37, #b4941f)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                      transition: 'all 0.3s'
                    }}>
                      📅 Book Trial Lesson
                    </button>
                    <button style={{
                      background: 'white',
                      color: '#374151',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}>
                      💬 Send Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '6px', height: '32px', background: 'linear-gradient(180deg, #d4af37, #b4941f)', borderRadius: '3px' }} />
                About Me
              </h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151', whiteSpace: 'pre-wrap' }}>
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
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111827' }}>
                {!showVideo ? (
                  <div
                    onClick={() => setShowVideo(true)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.9))'
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      <div style={{
                        width: 0,
                        height: 0,
                        borderTop: '15px solid transparent',
                        borderBottom: '15px solid transparent',
                        borderLeft: '25px solid white',
                        marginLeft: '5px'
                      }} />
                    </motion.div>
                    <div style={{
                      position: 'absolute',
                      bottom: '2rem',
                      left: '2rem',
                      right: '2rem',
                      color: 'white'
                    }}>
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
              style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '6px', height: '32px', background: 'linear-gradient(180deg, #d4af37, #b4941f)', borderRadius: '3px' }} />
                Qualifications & Experience
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {teacher.qualifications.map((qual, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: '#f9fafb',
                      borderRadius: '1rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #fff9db, #fef3c7)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      🎓
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#111827', marginBottom: '0.25rem' }}>
                        {qual}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
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
            <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
                    style={{
                      background: 'white',
                      borderRadius: '1.5rem',
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Need Help?</h3>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Have questions? Our support team is here to assist you.
                    </p>
                    <button style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
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
                  style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                   <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Your Stats</h3>
                   <div style={{ display: 'grid', gap: '1rem' }}>
                     <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '1rem' }}>
                       <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Earnings</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>$0.00</div>
                     </div>
                     <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '1rem' }}>
                       <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sessions Taught</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>0</div>
                     </div>
                   </div>
                   <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '1rem', fontStyle: 'italic' }}>
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

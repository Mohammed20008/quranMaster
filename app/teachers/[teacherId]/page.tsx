'use client';

import { use } from 'react';
import { useTeachers } from '@/app/context/teacher-context';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './teacher-profile.module.css';

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { getTeacher } = useTeachers();
  
  const { teacherId } = use(params);
  
  // Ideally getTeacher would support slug lookup
  const teacher = getTeacher(teacherId);

  if (!teacher) {
    // In a real app we'd redirect or show not found
    // customizable 404
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Teacher Not Found</h1>
          <p>The teacher profile you are looking for does not exist.</p>
          <Link href="/learn" className={styles.backBtn}>Back to Learn</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.coverImage}></div>
        <div className={styles.headerContent}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
               {/* Using a placeholder if no photo, in real app use Next Image properly */}
               {teacher.photo && teacher.photo.startsWith('http') ? (
                  <img src={teacher.photo} alt={teacher.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{teacher.name[0]}</div>
                )}
            </div>
            {teacher.ijazah && <div className={styles.ijazahBadge} title="Has Ijazah">✓</div>}
          </div>
          <div className={styles.teacherIdentity}>
            <h1>{teacher.name}</h1>
            <div className={styles.rating}>
              <span className={styles.star}>★</span>
              <span>{teacher.rating.toFixed(1)}</span>
              <span className={styles.reviewCount}>({teacher.reviewCount} reviews)</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.bookBtn}>Book a Session</button>
            <button className={styles.messageBtn}>Message</button>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2>About</h2>
            <p className={styles.bio}>{teacher.bio}</p>
          </section>

          <section className={styles.section}>
            <h2>Qualifications</h2>
            <ul className={styles.list}>
              {teacher.qualifications.map((qual, i) => (
                <li key={i}>{qual}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3>Teaching Info</h3>
            <div className={styles.infoItem}>
              <span className={styles.label}>Subjects</span>
              <div className={styles.tags}>
                {teacher.subjects.map(s => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Levels</span>
              <div className={styles.tags}>
                {teacher.levels.map(l => <span key={l} className={styles.tag}>{l}</span>)}
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Availability</span>
              <p>{teacher.availability}</p>
            </div>
            {teacher.hourlyRate && (
               <div className={styles.infoItem}>
                 <span className={styles.label}>Rate</span>
                 <p className={styles.price}>${teacher.hourlyRate}/hr</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

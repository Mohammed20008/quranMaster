'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Trash2, Shield, User as UserIcon, BadgeCheck, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './users.module.css';

interface RegisteredUser {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'teacher';
  avatar?: string;
  joinedAt?: string;
}

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
      return;
    }

    // Load users from registry
    try {
      const storedUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
      const processedUsers = storedUsers.map((u: any) => ({
        ...u,
        joinedAt: u.joinedAt || new Date().toISOString()
      }));
      setUsers(processedUsers);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleDeleteUser = (email: string) => {
    if (confirm(`Are you sure you want to remove ${email}? This action cannot be undone.`)) {
      const updatedUsers = users.filter(u => u.email !== email);
      setUsers(updatedUsers);
      localStorage.setItem('all_users', JSON.stringify(updatedUsers));
      // In a real app we would call an API
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
            <Link href="/admin" className={styles.backButton}>
              <ChevronLeft size={20} />
            </Link>
            <h1 className={styles.title}>User Management</h1>
            <div className={styles.statsBadge}>
               <span>Total Users:</span>
               <span>{users.length}</span>
            </div>
        </div>
      </header>

      <main className={styles.main}>
        
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr>
                     <td colSpan={4}>
                       <div className={styles.stateContainer}>
                         <div className={styles.spinner} />
                         Loading users...
                       </div>
                     </td>
                   </tr>
                ) : filteredUsers.length === 0 ? (
                   <tr>
                     <td colSpan={4}>
                        <div className={styles.stateContainer}>
                          No users match "{searchTerm}"
                        </div>
                     </td>
                   </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={styles.row}
                    >
                      <td className={styles.cell}>
                        <div className={styles.userInfo}>
                          {user.avatar ? (
                             <img src={user.avatar} className={styles.avatar} alt="" />
                          ) : (
                             <div className={styles.avatarPlaceholder}>
                               {user.name[0].toUpperCase()}
                             </div>
                          )}
                          <div>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.cell}>
                        {user.role === 'admin' && (
                          <span className={`${styles.badge} ${styles.roleAdmin}`}>
                            <Shield size={12} /> Admin
                          </span>
                        )}
                        {user.role === 'teacher' && (
                          <span className={`${styles.badge} ${styles.roleTeacher}`}>
                            <BadgeCheck size={12} /> Teacher
                          </span>
                        )}
                        {user.role === 'user' && (
                          <span className={`${styles.badge} ${styles.roleUser}`}>
                            <UserIcon size={12} /> Student
                          </span>
                        )}
                      </td>
                      <td className={styles.cell}>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           Active
                        </span>
                      </td>
                      <td className={styles.cell} style={{textAlign: 'right'}}>
                        <button 
                          onClick={() => handleDeleteUser(user.email)}
                          className={styles.deleteButton}
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

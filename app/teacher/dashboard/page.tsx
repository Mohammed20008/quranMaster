'use client';

import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate check
    setTimeout(() => {
        setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.role !== 'teacher' && user?.role !== 'admin') {
         // If user is not teacher or admin, redirect (optional)
         // For now we allow access if they somehow got here, or show a message
         console.log('User role:', user?.role);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="font-bold text-2xl text-[#d4af37]">QM</Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <h1 className="text-lg font-semibold text-gray-900">Teacher Workspace</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b4941f] flex items-center justify-center text-white font-bold">
                        {user?.name?.[0]}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Salam, {user?.name}</h2>
            <p className="text-gray-500 mt-1">Here is what's happening with your students today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Total Earnings</div>
                <div className="text-3xl font-bold text-gray-900">$1,250</div>
                <div className="text-sm text-green-600 mt-2 font-medium">+15% this month</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Active Students</div>
                <div className="text-3xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-400 mt-2">4 pending requests</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Rating</div>
                <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    5.0 <span className="text-yellow-400 text-2xl">★</span>
                </div>
                <div className="text-sm text-gray-400 mt-2">Based on 28 reviews</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Next Session */}
                 <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Next Session</h3>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Upcoming</span>
                    </div>
                    <div className="p-6 flex items-center gap-6">
                        <div className="text-center min-w-[80px]">
                            <div className="text-xl font-bold text-gray-900">Today</div>
                            <div className="text-blue-600 font-bold">2:30 PM</div>
                        </div>
                        <div className="h-10 w-px bg-gray-100"></div>
                        <div>
                            <div className="font-semibold text-gray-900">Advanced Tajweed Rule #4</div>
                            <div className="text-sm text-gray-500">Student: Ahmed Ali • 45 mins</div>
                        </div>
                        <div className="ml-auto">
                            <button className="bg-[#d4af37] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#b4941f]">
                                Join Class
                            </button>
                        </div>
                    </div>
                 </section>

                 {/* Requests */}
                 <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-lg">Student Requests</h3>
                    </div>
                    <div>
                        {[1, 2].map((i) => (
                           <div key={i} className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                              <div className="flex gap-4 items-center">
                                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">S{i}</div>
                                  <div className="flex-1">
                                      <div className="font-semibold text-gray-900">Sarah M.</div>
                                      <div className="text-sm text-gray-500">Wants to learn Surah Al-Baqarah • Beginner Level</div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button className="px-4 py-2 text-sm font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100">Accept</button>
                                      <button className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Decline</button>
                                  </div>
                              </div>
                           </div>
                        ))}
                    </div>
                 </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/teacher/profile" className="block p-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                <span>👤</span> Edit Profile
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="block p-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                <span>📅</span> Manage Schedule
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="block p-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                <span>📚</span> Resources
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="block p-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                <span>⚙️</span> Account Settings
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 rounded-xl text-white">
                    <h3 className="font-bold mb-2">Pro Tip</h3>
                    <p className="text-sm text-gray-300 mb-4">Complete your profile to increase visibility by 40%. Add a new demo video today.</p>
                    <Link href="/teacher/profile" className="text-sm font-bold text-[#d4af37] hover:underline">Go to Profile →</Link>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

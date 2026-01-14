'use client';

import { use } from 'react';
import { useTeachers } from '@/app/context/teacher-context';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { getTeacher } = useTeachers();
  const { teacherId } = use(params);
  const teacher = getTeacher(teacherId);

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Teacher Not Found</h1>
        <p className="text-gray-500 mb-8">The teacher profile you are looking for does not exist or has been removed.</p>
        <Link href="/learn" className="bg-[#d4af37] text-white px-8 py-3 rounded-full font-bold hover:bg-[#b4941f] transition-all">
          Browse All Teachers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative h-[300px] w-full bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
         {/* Abstract Golden Pattern Background */}
         <div className="absolute inset-0 opacity-20" style={{
             backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(212, 175, 55) 0%, rgb(25, 25, 25) 90%)'
         }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-[100px]">
         <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
             {/* Profile Card */}
             <div className="bg-white p-2 rounded-2xl shadow-xl">
                 <div className="w-[180px] h-[180px] relative rounded-xl overflow-hidden bg-gray-200 border-4 border-white">
                     {teacher.photo ? (
                         <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full bg-gradient-to-br from-[#d4af37] to-[#b4941f] flex items-center justify-center text-white text-6xl font-bold">
                             {teacher.name[0]}
                         </div>
                     )}
                 </div>
             </div>

             {/* Header Info */}
             <div className="flex-1 pb-4 md:pt-[110px] text-center md:text-left">
                 <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
                     <div>
                         <h1 className="text-4xl font-bold text-gray-900 mb-2">{teacher.name}</h1>
                         <div className="flex items-center gap-3 justify-center md:justify-start text-gray-600 mb-4">
                             {teacher.ijazah && (
                                 <span className="bg-[#d4af37] text-white text-xs px-2 py-1 rounded font-bold tracking-wider uppercase">
                                     ✓ Certified Ijazah
                                 </span>
                             )}
                             <span className="flex items-center gap-1 font-semibold">
                                 <span className="text-yellow-400">★</span> {teacher.rating.toFixed(1)}
                                 <span className="text-gray-400 font-normal">({teacher.reviewCount} students)</span>
                             </span>
                         </div>
                         <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                             {teacher.subjects.map(subject => (
                                 <span key={subject} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                     {subject}
                                 </span>
                             ))}
                         </div>
                     </div>
                     
                     <div className="flex flex-col gap-3 min-w-[200px]">
                         <button className="bg-[#d4af37] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#b4941f] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                             Book Trial (${teacher.hourlyRate || 10})
                         </button>
                         <button className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all">
                             Message Teacher
                         </button>
                     </div>
                 </div>
             </div>
         </div>

         {/* Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
             {/* Left Column */}
             <div className="lg:col-span-2 space-y-12">
                 {/* About */}
                 <section>
                     <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                         <span className="w-8 h-1 bg-[#d4af37] rounded-full"></span>
                         About Me
                     </h2>
                     <div className="prose prose-lg text-gray-600 leading-relaxed">
                         <p>{teacher.bio}</p>
                     </div>
                 </section>

                 {/* Video Intro Placeholder */}
                 <section className="bg-gray-900 rounded-2xl overflow-hidden relative aspect-video shadow-2xl group cursor-pointer">
                     <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all flex items-center justify-center">
                         <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
                             <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent"></div>
                         </div>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                         <p className="text-white font-bold">Watch Introduction Video</p>
                         <p className="text-gray-300 text-sm">Get to know {teacher.name} in 2 minutes</p>
                     </div>
                 </section>

                 {/* Qualifications */}
                 <section>
                     <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                         <span className="w-8 h-1 bg-[#d4af37] rounded-full"></span>
                         Qualifications & Experience
                     </h2>
                     <div className="grid md:grid-cols-2 gap-4">
                         {teacher.qualifications.map((qual, i) => (
                             <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37]/30 transition-colors">
                                 <div className="w-10 h-10 bg-[#fff9db] text-[#d4af37] rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                                     🎓
                                 </div>
                                 <div>
                                     <p className="font-semibold text-gray-900">{qual}</p>
                                     <p className="text-sm text-gray-500">Verified Credential</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </section>

                 {/* Reviews Preview (Mock) */}
                 <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                         <span className="w-8 h-1 bg-[#d4af37] rounded-full"></span>
                         Student Reviews
                     </h2>
                     <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            S
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Student Name</p>
                                            <p className="text-xs text-gray-400">2 weeks ago</p>
                                        </div>
                                    </div>
                                    <div className="text-[#d4af37] font-bold">★★★★★</div>
                                </div>
                                <p className="text-gray-600 italic">"An amazing teacher! Very patient and knowledgeable. I highly recommend for anyone wanting to master Tajweed."</p>
                            </div>
                        ))}
                        <button className="w-full py-4 text-[#d4af37] font-bold hover:bg-[#fff9db] rounded-xl transition-colors">
                            View All {teacher.reviewCount} Reviews
                        </button>
                     </div>
                 </section>
             </div>

             {/* Sidebar */}
             <div className="space-y-6">
                 {/* Availability Card */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg top-24 sticky">
                     <h3 className="font-bold text-gray-900 text-lg mb-6">Teaching Details</h3>
                     
                     <div className="space-y-6">
                         <div>
                             <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Availability</p>
                             <div className="flex items-center gap-3 text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                 {teacher.availability}
                             </div>
                         </div>

                         <div>
                             <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Teaches Levels</p>
                             <div className="flex flex-wrap gap-2">
                                 {teacher.levels.map(level => (
                                     <span key={level} className="text-sm border border-gray-200 px-3 py-1 rounded bg-gray-50 text-gray-600">
                                         {level}
                                     </span>
                                 ))}
                             </div>
                         </div>

                         <div>
                             <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Languages</p>
                             <p className="text-gray-700 font-medium">English (Native), Arabic (Fluent)</p>
                         </div>

                         <div className="pt-6 border-t border-gray-100">
                             <div className="flex justify-between items-center mb-4">
                                 <span className="text-gray-600">Hourly Rate</span>
                                 <span className="text-2xl font-bold text-gray-900">${teacher.hourlyRate || 10}</span>
                             </div>
                             <button className="w-full bg-[#d4af37] text-white py-4 rounded-xl font-bold hover:bg-[#b4941f] transition-all shadow-lg hover:shadow-xl active:scale-95">
                                 Book a Session Now
                             </button>
                             <p className="text-center text-xs text-gray-400 mt-4">Safe & Secure Payment via QuranMaster</p>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}

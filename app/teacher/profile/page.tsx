'use client';

import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Teacher } from '@/types/teacher';

// Note: Ensure @/components/ui/avatar-picker is removed if unused elsewhere or keep the import if used in other files

export default function TeacherProfileSettings() {
  const { user, isAuthenticated } = useAuth();
  const { getTeacherByEmail, updateTeacher } = useTeachers();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [avatar, setAvatar] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [name, setName] = useState('');
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/');
        return;
    }

    if (isAuthenticated && user?.email) {
       const teacher = getTeacherByEmail(user.email);
       if (teacher) {
           setProfile(teacher);
           setBio(teacher.bio);
           setHourlyRate(teacher.hourlyRate || 0);
           setAvatar(teacher.photo);
           setName(teacher.name);
           setVideoUrl(teacher.videoUrl || '');
       }
    }
  }, [isAuthenticated, user, getTeacherByEmail, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    // Update context
    updateTeacher(profile.id, { 
      bio, 
      hourlyRate,
      photo: avatar,
      videoUrl,
      // In a real app we would update subjects too if they changed
    });
    
    setIsSaving(false);
    
    // Simple feedback
    alert('Profile updated successfully!');
  };

  if (!isAuthenticated || !profile) return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"/>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link 
                  href="/teacher/dashboard" 
                  className="group flex items-center gap-2 text-gray-500 hover:text-[#d4af37] font-medium transition-colors"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> 
                  Back to Dashboard
                </Link>
            </div>
             <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
             <div className="w-32 flex justify-end">
                <Link href={profile.profileUrl} className="text-sm text-[#d4af37] font-medium hover:underline" target="_blank">
                  View Public Profile ↗
                </Link>
             </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
         <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
               {['general', 'media', 'availability'].map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-5 text-sm font-bold text-center border-b-2 transition-all duration-200
                    ${activeTab === tab 
                      ? 'border-[#d4af37] text-[#d4af37] bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                 >
                     {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
                 </button>
               ))}
            </div>
            
            <div className="p-8 md:p-12">
               {/* General Tab */}
               {activeTab === 'general' && (
                  <div className="space-y-10 max-w-3xl mx-auto">
                      
                      {/* Photo Section */}
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-10 border-b border-gray-100">
                        <div className="relative group shrink-0">
                          <img 
                            src={imagePreview || avatar || profile.photo} 
                            alt={profile.name} 
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg transition-all"
                          />
                          <label 
                            htmlFor="photo-upload"
                            className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-2.5 rounded-full shadow-lg hover:bg-[#b4941f] transition-all cursor-pointer hover:scale-110 active:scale-95"
                            title="Upload New Photo"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                              <circle cx="12" cy="13" r="4"/>
                            </svg>
                          </label>
                          <input 
                            id="photo-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                          />
                        </div>
                        <div className="text-center md:text-left">
                           <h3 className="font-bold text-xl text-gray-900 mb-2">Profile Photo</h3>
                           <p className="text-gray-500 mb-4 max-w-sm leading-relaxed">
                             Upload a professional photo of yourself. Clear, well-lit photos help build trust with students.
                           </p>
                           <label 
                              htmlFor="photo-upload"
                              className="inline-block text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg text-sm font-bold hovering cursor-pointer hover:bg-[#d4af37]/20 transition-colors"
                           >
                              Choose New Image
                           </label>
                        </div>
                      </div>

                      {/* Display Name */}
                      <div className="group">
                          <label className="block text-sm font-bold text-gray-800 mb-2 ml-1">Display Name</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={name} 
                              disabled 
                              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium" 
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Locked</div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 ml-1 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            Contact support to change your display name
                          </p>
                      </div>

                      {/* Bio */}
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2 ml-1">Bio / Introduction</label>
                          <div className="relative">
                            <textarea 
                              value={bio}
                              onChange={e => setBio(e.target.value)}
                              rows={6} 
                              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all resize-y text-gray-700 leading-relaxed"
                              placeholder="Tell students about your teaching style, experience, and what makes you unique..."
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md border border-gray-100">
                              {bio.length} chars
                            </div>
                          </div>
                      </div>

                      {/* Hourly Rate */}
                       <div className="max-w-xs">
                          <label className="block text-sm font-bold text-gray-800 mb-2 ml-1">Hourly Rate (USD)</label>
                          <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                             <input 
                                type="number" 
                                value={hourlyRate}
                                onChange={e => setHourlyRate(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all font-bold text-gray-800"
                              />
                          </div>
                      </div>

                      {/* Video URL */}
                      <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2 ml-1">Introduction Video URL</label>
                          <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                             </div>
                             <input 
                                  type="url"
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] outline-none transition-all"
                                  value={videoUrl}
                                  onChange={(e) => setVideoUrl(e.target.value)}
                              />
                          </div>
                          <p className="text-xs text-gray-400 mt-2 ml-1">Paste a link to your YouTube or Vimeo introduction video.</p>
                      </div>

                      {/* Subjects */}
                       <div>
                          <label className="block text-sm font-bold text-gray-800 mb-3 ml-1">Subjects Tags</label>
                          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                             {profile.subjects.map(s => (
                                <span key={s} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm inline-flex items-center gap-2">
                                  {s}
                                </span>
                             ))}
                             <button className="text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d4af37]/20 transition-colors inline-flex items-center gap-1">
                               <span>+</span> Add Tag
                             </button>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 ml-1">Tags determine which searches you appear in.</p>
                      </div>
                  </div>
               )}

               {activeTab === 'media' && (
                   <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">🎥</div>
                       <h3 className="text-lg font-bold text-gray-900 mb-2">Media Settings</h3>
                       <p className="max-w-md">Manage your demos, gallery photos, and other media assets here. This section is currently under development.</p>
                   </div>
               )}

               {activeTab === 'availability' && (
                   <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">📅</div>
                       <h3 className="text-lg font-bold text-gray-900 mb-2">Calendar Settings</h3>
                       <p className="max-w-md">Set your weekly availability, time zone, and booking preferences. This section is currently under development.</p>
                   </div>
               )}

               <div className="mt-12 flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
                   <button 
                     onClick={() => router.back()}
                     className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="bg-gradient-to-r from-[#d4af37] to-[#b4941f] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
                   >
                       {isSaving ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                           Saving Changes...
                         </>
                       ) : (
                         'Save Changes'
                       )}
                   </button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}

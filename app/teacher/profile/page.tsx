'use client';

import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Teacher } from '@/types/teacher';

import AvatarPicker from '@/app/components/ui/avatar-picker';

export default function TeacherProfileSettings() {
  const { user, isAuthenticated } = useAuth();
  const { teachers, getTeacherByEmail, updateTeacher } = useTeachers();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // Form states (simplified for this demo)
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [avatar, setAvatar] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.email) {
       const teacher = getTeacherByEmail(user.email);
       if (teacher) {
           setProfile(teacher);
           setBio(teacher.bio);
           setHourlyRate(teacher.hourlyRate || 0);
           setAvatar(teacher.photo);
           setVideoUrl(teacher.videoUrl || '');
       }
    }
  }, [isAuthenticated, user, getTeacherByEmail]);

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
    
    // Refresh local profile state from the updated context (optional, or just trust the state)
    // For now, we update the profile state locally to reflect changes immediately if needed, 
    // but context update will trigger re-render of components using 'teachers'
    
    setIsSaving(false);
    
    // Use sonner toast if available, otherwise alert
    // import { toast } from 'sonner'; (need to check if imported)
    // Falling back to alert for simplicity if import not added, or try/catch 
    alert('Profile updated successfully!');
  };

  if (!isAuthenticated || !profile) return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"/>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href="/teacher/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">← Back to Dashboard</Link>
            </div>
             <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
             <div className="w-24"></div> 
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
               <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 ${activeTab === 'general' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                   General Info
               </button>
               <button 
                onClick={() => setActiveTab('media')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 ${activeTab === 'media' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                   Media & Demos
               </button>
               <button 
                onClick={() => setActiveTab('availability')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 ${activeTab === 'availability' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                   Availability
               </button>
            </div>
            
            <div className="p-8">
               {activeTab === 'general' && (
                  <div className="space-y-6">
                      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <div className="relative group">
                          <img 
                            src={avatar || profile.photo} 
                            alt={profile.name} 
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 group-hover:border-[#d4af37] transition-colors"
                          />
                          <button 
                            onClick={() => setIsAvatarPickerOpen(true)}
                            className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-2 rounded-full shadow-lg hover:bg-[#b4941f] transition-colors"
                            title="Change Avatar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                              <circle cx="12" cy="13" r="4"/>
                            </svg>
                          </button>
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-gray-900">Profile Photo</h3>
                           <p className="text-sm text-gray-500 mb-2">Click the camera icon to choose a new look.</p>
                           <button onClick={() => setIsAvatarPickerOpen(true)} className="text-[#d4af37] hover:underline text-sm font-semibold">Choose Avatar</button>
                        </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                          <input type="text" value={profile.name} disabled className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                          <p className="text-xs text-gray-400 mt-1">Contact admin to change name</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Bio / Introduction</label>
                          <textarea 
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={6} 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Introduction Video URL (YouTube/Vimeo)</label>
                          <input 
                              type="url"
                              placeholder="https://youtube.com/..."
                              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                          />
                          <p className="text-xs text-gray-400 mt-1">Add a link to your introduction video to attract more students.</p>
                      </div>

                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate ($)</label>
                          <input 
                            type="number" 
                            value={hourlyRate}
                            onChange={e => setHourlyRate(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none max-w-[200px]"
                          />
                      </div>

                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Subjects Tags</label>
                          <div className="flex flex-wrap gap-2">
                             {profile.subjects.map(s => (
                                <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{s}</span>
                             ))}
                             <button className="text-[#d4af37] text-sm font-bold px-2 py-1 hover:underline">+ Add Tag</button>
                          </div>
                      </div>
                  </div>
               )}

               {activeTab === 'media' && (
                   <div className="text-center py-12 text-gray-500">
                       <div className="text-4xl mb-4">🎥</div>
                       <p>Media settings coming soon...</p>
                   </div>
               )}

               {activeTab === 'availability' && (
                   <div className="text-center py-12 text-gray-500">
                       <div className="text-4xl mb-4">📅</div>
                       <p>Calendar settings coming soon...</p>
                   </div>
               )}

               <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="bg-[#d4af37] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#b4941f] transition-colors disabled:opacity-50"
                   >
                       {isSaving ? 'Saving...' : 'Save Changes'}
                   </button>
               </div>
            </div>
         </div>
      </main>
      <AvatarPicker 
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatar={avatar}
        onSelect={(newAvatar) => setAvatar(newAvatar)}
      />
    </div>
  );
}

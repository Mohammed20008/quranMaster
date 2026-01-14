'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useRouter } from 'next/navigation';
import AvatarPicker from '@/app/components/avatar/avatar-picker';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsSidebar from './sidebar';
import { Save, User, DollarSign, Tag, CheckCircle } from 'lucide-react';

type TabId = 'profile' | 'style' | 'account';

const TEACHING_STYLES = [
  'Patient', 'Structured', 'Conversational', 'Academic', 
  'Memorization-Focused', 'Tajweed-Focused', 'Fun & Engaging', 
  'Strict', 'Detailed', 'Beginner-Friendly'
];

export default function TeacherSettingsPage() {
  const { user, isTeacher, teacherId } = useAuth();
  const { getTeacher, updateTeacher } = useTeachers();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    hourlyRate: 15,
    avatarId: '',
    photo: '',
    teachingStyle: [] as string[],
  });

  useEffect(() => {
    if (!isTeacher || !teacherId) {
      if (!user) router.push('/login');
      else router.push('/');
      return;
    }

    const teacher = getTeacher(teacherId);
    if (teacher) {
      setFormData({
        name: teacher.name,
        bio: teacher.bio,
        hourlyRate: teacher.hourlyRate || 15,
        avatarId: teacher.avatarId || '',
        photo: teacher.photo,
        teachingStyle: teacher.teachingStyle || [],
      });
    }
    setIsLoading(false);
  }, [isTeacher, teacherId, getTeacher, router, user]);

  const handleAvatarSelect = (avatarId: string) => {
    setFormData(prev => ({ ...prev, avatarId, photo: '' }));
  };

  const handlePhotoUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, photo: objectUrl, avatarId: '' }));
  };

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      teachingStyle: prev.teachingStyle.includes(style)
        ? prev.teachingStyle.filter(s => s !== style)
        : [...prev.teachingStyle, style]
    }));
  };

  const handleSubmit = async () => {
    if (!teacherId) return;
    setIsSaving(true);

    // Simulate network delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    updateTeacher(teacherId, {
      name: formData.name,
      bio: formData.bio,
      hourlyRate: formData.hourlyRate,
      avatarId: formData.avatarId,
      photo: formData.photo,
      teachingStyle: formData.teachingStyle,
    });

    setIsSaving(false);
    // Show success feedback if needed, but the button state might be enough
    router.push(`/teachers/${teacherId}`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* Note: Sidebar is strictly nav, title is separate */}
            <span className="hidden">Settings</span>
            Teacher Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/teachers/${teacherId}`)}
              className="text-gray-500 hover:text-gray-900 font-medium text-sm"
            >
              View Profile
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-white shadow-lg shadow-amber-500/20 transition-all ${
                isSaving ? 'bg-[#e5c567] cursor-wait' : 'bg-gradient-to-r from-[#d4af37] to-[#b4941f] hover:from-[#b4941f] hover:to-[#967d1c] transform hover:-translate-y-0.5'
              }`}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
             <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 sticky top-24">
                <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
             </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Avatar Section */}
                  <div className="bg-white rounded-2xl p-10 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                       <div className="p-3 bg-amber-50 rounded-xl">
                          <User className="text-[#d4af37]" size={28} /> 
                       </div>
                       Public Profile
                    </h2>
                    <div className="flex flex-col items-center py-4">
                      <AvatarPicker 
                        userName={formData.name || 'User'} 
                        currentAvatar={formData.avatarId}
                        onSelect={handleAvatarSelect}
                        onUpload={handlePhotoUpload}
                      />
                      <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
                        This is the first thing students see. Choose a friendly photo or one of our custom avatars.
                      </p>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="bg-white rounded-2xl p-10 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="space-y-8">
                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-3">Display Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full max-w-md px-5 py-4 rounded-xl border border-gray-200 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all outline-none text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-3">Bio & Introduction</label>
                        <textarea
                          value={formData.bio}
                          rows={6}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all outline-none resize-none text-base leading-relaxed"
                          placeholder="Tell students about your experience, teaching method, and goals..."
                        />
                        <p className="mt-2 text-xs text-right text-gray-400">
                          {formData.bio.length} characters
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'style' && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-10 shadow-lg shadow-gray-100/50 border border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <Tag className="text-[#d4af37]" size={28} />
                    </div>
                    Teaching Style
                  </h2>
                  <p className="text-gray-600 mb-10 text-lg">
                    Select tags that best describe your teaching approach. This helps match you with the right students.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    {TEACHING_STYLES.map(style => {
                      const isSelected = formData.teachingStyle.includes(style);
                      return (
                        <button
                          key={style}
                          onClick={() => toggleStyle(style)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#d4af37] text-white shadow-md shadow-amber-500/20'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected && <CheckCircle size={14} />}
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                   key="account"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="bg-white rounded-2xl p-10 shadow-lg shadow-gray-100/50 border border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <DollarSign className="text-[#d4af37]" size={28} />
                    </div>
                    Rates & Availability
                  </h2>
                  
                  <div className="max-w-sm">
                    <label className="block text-base font-bold text-gray-900 mb-3">Hourly Rate (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-xl">$</span>
                      </div>
                      <input
                        type="number"
                        min="5"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                        className="w-full pl-10 pr-5 py-4 rounded-xl border border-gray-200 focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all outline-none font-mono text-2xl"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Platform fee: 10%. You will receive ${(formData.hourlyRate * 0.9).toFixed(2)}/hr.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

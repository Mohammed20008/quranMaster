'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/auth-context';
import { X, Camera, User, BadgeCheck, Upload, Save, Check } from 'lucide-react';
import { renderAvatar, AVATAR_PRESETS } from '@/app/components/avatar/avatar-utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser, isTeacher } = useAuth();
  const [name, setName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      const isPreset = AVATAR_PRESETS.some(p => p.id === user.avatar);
      if (isPreset) {
        setSelectedPreset(user.avatar || null);
        setCustomImage(null);
      } else if (user.avatar) {
        setCustomImage(user.avatar);
        setSelectedPreset(null);
      } else {
         setSelectedPreset(AVATAR_PRESETS[0].id);
      }
    }
  }, [user, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedPreset(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateUser({
      name,
      avatar: customImage || selectedPreset || undefined
    });
    
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#d4af37] to-[#b4941f] px-8 py-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-10 -translate-y-5">
               <User size={200} />
             </div>
             
             <div className="relative z-10 flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    Profile Settings
                    {isTeacher && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/30 backdrop-blur-sm shadow-sm">
                        <BadgeCheck size={14} className="text-white" /> 
                        VERIFIED TEACHER
                      </span>
                    )}
                  </h2>
                  <p className="text-white/80 mt-2 text-lg font-medium">Update your profile information and visibility</p>
               </div>
               
               <button 
                 onClick={onClose}
                 className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
               >
                 <X size={24} />
               </button>
             </div>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 transition-colors">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Left Col: Avatar */}
              <div className="flex flex-col items-center">
                 <div className="relative group cursor-pointer mb-6">
                   <div className="w-40 h-40 rounded-full ring-4 ring-offset-4 ring-[#d4af37] dark:ring-offset-slate-900 overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                      {customImage ? (
                        <img src={customImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        renderAvatar(AVATAR_PRESETS.find(p => p.id === selectedPreset) || AVATAR_PRESETS[0], name, 160, "w-full h-full")
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                         <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">Change</span>
                      </div>
                   </div>
                   
                   <div 
                     className="absolute bottom-2 right-2 bg-[#d4af37] text-white p-3 rounded-full shadow-lg border-2 border-white dark:border-slate-800 hover:bg-[#b4941f] transition-all transform hover:scale-110 cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}
                   >
                     <Camera size={20} />
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*"
                     onChange={handleFileChange}
                   />
                </div>
                
                <div className="w-full">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">Presets</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {AVATAR_PRESETS.slice(0, 8).map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => { setSelectedPreset(preset.id); setCustomImage(null); }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200 ${selectedPreset === preset.id && !customImage ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-110' : 'border-transparent hover:scale-110 hover:border-gray-200 dark:hover:border-gray-700'}`}
                        title={preset.name}
                      >
                        {renderAvatar(preset, name, 40, "w-full h-full")}
                      </button>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-[#d4af37] text-gray-400 hover:text-[#d4af37] transition-all"
                      title="Upload custom image"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: Form */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Display Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#d4af37] transition-colors">
                        <User size={20} />
                      </div>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-[#d4af37]/10 focus:border-[#d4af37] transition-all outline-none font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {isTeacher && (
                      <p className="text-xs text-[#d4af37] mt-2 font-medium flex items-center gap-1">
                         <BadgeCheck size={12} /> Syncs with your Teacher Profile
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Email Address</label>
                    <div className="relative">
                       <input 
                        type="email" 
                        value={user?.email || ''}
                        readOnly
                        className="w-full px-5 py-3.5 bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 font-medium cursor-not-allowed select-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-200/50 dark:bg-slate-700 px-2 py-1 rounded text-transform uppercase">
                        Verified
                      </div>
                    </div>
                  </div>
                </div>

                {isTeacher && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-5 flex gap-4 text-sm text-amber-900/80 dark:text-amber-100/80 shadow-sm">
                    <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                       <BadgeCheck size={20} />
                    </div>
                    <div>
                      <strong className="block mb-1 text-base font-bold text-amber-900 dark:text-amber-100">Teacher Account Status</strong>
                      <p className="leading-relaxed">
                        Your profile is verified and active on the teaching platform. Any changes to your name or avatar here will automatically reflect on your public profile page for students to see.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl">
             <button 
               onClick={onClose}
               className="px-6 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:shadow-sm"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave}
               disabled={isLoading}
               className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#b4941f] text-white font-bold rounded-xl shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
             >
               {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
               Save Changes
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

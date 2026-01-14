'use client';

import { User, Settings, Layout, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'profile' | 'style' | 'account';

interface SettingsSidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const TABS = [
  { id: 'profile', label: 'Profile & Bio', icon: User },
  { id: 'style', label: 'Teaching Style', icon: Layout },
  { id: 'account', label: 'Rate & Account', icon: DollarSign },
];

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <div className="space-y-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
              isActive 
                ? 'text-[#d4af37] bg-amber-50 font-bold shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37] rounded-r-full"
              />
            )}
            <Icon size={20} className={isActive ? 'text-[#d4af37]' : 'text-gray-400'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

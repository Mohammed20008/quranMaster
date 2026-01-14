'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, Users, Star } from 'lucide-react';

interface TimelineItemProps {
  icon: any;
  date: string;
  title: string;
  description: string;
  delay: number;
}

function TimelineItem({ icon: Icon, date, title, description, delay }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex gap-4 group"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-[#d4af37] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon size={18} className="text-[#d4af37]" />
        </div>
        <div className="flex-1 w-0.5 bg-gray-100 my-2 group-last:hidden" />
      </div>
      <div className="pb-8">
        <div className="text-sm font-semibold text-[#d4af37] mb-1">{date}</div>
        <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function TeachingJourney({ joinedAt }: { joinedAt: string }) {
  // Mock timeline data - in real app would come from props/DB
  const events = [
    {
      icon: Calendar,
      date: new Date(joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Joined QuranMaster',
      description: 'Started the journey to share knowledge with students worldwide.'
    },
    {
      icon: Award,
      date: 'Earned Verification',
      title: 'Verified Teacher',
      description: 'Passed the rigorous verification process including recitation and Tajweed assessment.'
    },
    {
      icon: Users,
      date: 'Milestone',
      title: 'First 10 Students',
      description: 'Successfully guided the first group of students towards their goals.'
    },
    {
      icon: Star,
      date: 'Achievement',
      title: 'Top Rated',
      description: 'Maintained a 5-star rating for over 3 months continuously.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#d4af37] rounded-full" />
        Teaching Journey
      </h3>
      <div>
        {events.map((event, i) => (
          <TimelineItem key={i} {...event} delay={0.2 + i * 0.1} />
        ))}
      </div>
    </div>
  );
}

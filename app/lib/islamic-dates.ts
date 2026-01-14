import moment from 'moment-hijri';

export interface IslamicEvent {
  name: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
  color: string;
}

// Islamic events throughout the year
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    name: 'Ramadan Begins',
    hijriMonth: 9,
    hijriDay: 1,
    description: 'The blessed month of fasting',
    color: '#667eea',
  },
  {
    name: 'Eid al-Fitr',
    hijriMonth: 10,
    hijriDay: 1,
    description: 'Festival of Breaking the Fast',
    color: '#10b981',
  },
  {
    name: 'Eid al-Adha',
    hijriMonth: 12,
    hijriDay: 10,
    description: 'Festival of Sacrifice',
    color: '#f59e0b',
  },
  {
    name: 'Day of Arafah',
    hijriMonth: 12,
    hijriDay: 9,
    description: 'The best day of the year',
    color: '#8b5cf6',
  },
  {
    name: 'Ashura',
    hijriMonth: 1,
    hijriDay: 10,
    description: 'Day of remembrance and fasting',
    color: '#ef4444',
  },
  {
    name: 'Mawlid an-Nabi',
    hijriMonth: 3,
    hijriDay: 12,
    description: 'Birth of Prophet Muhammad (PBUH)',
    color: '#06b6d4',
  },
  {
    name: 'Isra and Mi\'raj',
    hijriMonth: 7,
    hijriDay: 27,
    description: 'The Night Journey',
    color: '#a855f7',
  },
  {
    name: 'Laylat al-Qadr',
    hijriMonth: 9,
    hijriDay: 27,
    description: 'The Night of Power (estimated)',
    color: '#f97316',
  },
];

// Get current Hijri date
export function getCurrentHijriDate(): { year: number; month: number; day: number; monthName: string } {
  const now = moment();
  return {
    year: now.iYear(),
    month: now.iMonth() + 1, // moment-hijri months are 0-indexed
    day: now.iDate(),
    monthName: now.format('iMMMM'),
  };
}

// Calculate days until a specific Hijri date
export function daysUntilHijriDate(month: number, day: number): number {
  const now = moment();
  const currentYear = now.iYear();
  
  // Create target date in current Hijri year
  let targetDate = moment(`${currentYear}/${month}/${day}`, 'iYYYY/iM/iD');
  
  // If the date has passed this year, use next year
  if (targetDate.isBefore(now)) {
    targetDate = moment(`${currentYear + 1}/${month}/${day}`, 'iYYYY/iM/iD');
  }
  
  return targetDate.diff(now, 'days');
}

// Get days until Ramadan
export function daysUntilRamadan(): number {
  return daysUntilHijriDate(9, 1);
}

// Get days until Eid al-Fitr
export function daysUntilEidAlFitr(): number {
  return daysUntilHijriDate(10, 1);
}

// Get days until Eid al-Adha
export function daysUntilEidAlAdha(): number {
  return daysUntilHijriDate(12, 10);
}

// Get all upcoming events in the next 365 days
export function getUpcomingEvents(): Array<IslamicEvent & { daysUntil: number; date: string }> {
  return ISLAMIC_EVENTS.map(event => {
    const days = daysUntilHijriDate(event.hijriMonth, event.hijriDay);
    const now = moment();
    const currentYear = now.iYear();
    let eventDate = moment(`${currentYear}/${event.hijriMonth}/${event.hijriDay}`, 'iYYYY/iM/iD');
    
    if (eventDate.isBefore(now)) {
      eventDate = moment(`${currentYear + 1}/${event.hijriMonth}/${event.hijriDay}`, 'iYYYY/iM/iD');
    }
    
    return {
      ...event,
      daysUntil: days,
      date: eventDate.format('MMMM D, YYYY'),
    };
  }).sort((a, b) => a.daysUntil - b.daysUntil);
}

// Convert Gregorian to Hijri
export function gregorianToHijri(date: Date): { year: number; month: number; day: number; monthName: string } {
  const hijriDate = moment(date);
  return {
    year: hijriDate.iYear(),
    month: hijriDate.iMonth() + 1,
    day: hijriDate.iDate(),
    monthName: hijriDate.format('iMMMM'),
  };
}

// Convert Hijri to Gregorian
export function hijriToGregorian(year: number, month: number, day: number): Date {
  const date = moment(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
  return date.toDate();
}

// Get Hijri month names
export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi\' al-Awwal',
  'Rabi\' ath-Thani',
  'Jumada al-Ula',
  'Jumada ath-Thaniyah',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah',
];

export interface IslamicEvent {
  name: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
  color: string;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface UserEvent {
  id: string;
  name: string;
  description: string;
  color: string;
  hijriMonth?: number; // 1-12
  hijriDay?: number;   // 1-30
  gregorianMonth?: number; // 1-12
  gregorianDay?: number;   // 1-31
  type: 'hijri' | 'gregorian';
}

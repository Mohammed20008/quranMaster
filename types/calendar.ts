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

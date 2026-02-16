declare module 'moment-hijri' {
  export interface Moment {
    format(format?: string): string;
    
    // Hijri specific methods
    iDate(): number;
    iDate(value: number): Moment;
    iMonth(): number;
    iMonth(value: number): Moment;
    iYear(): number;
    iYear(value: number): Moment;
    iDaysInMonth(): number;
    
    // Standard Moment methods
    startOf(unit: string): Moment;
    endOf(unit: string): Moment;
    add(amount: number, unit: string): Moment;
    subtract(amount: number, unit: string): Moment;
    
    isSame(date: Moment | string | Date, unit?: string): boolean;
    isBefore(date: Moment | string | Date, unit?: string): boolean;
    isAfter(date: Moment | string | Date, unit?: string): boolean;
    
    day(): number;
    day(value: number | string): Moment;
    date(): number;
    date(value: number): Moment;
    month(): number;
    month(value: number | string): Moment;
    year(): number;
    year(value: number): Moment;
    
    daysInMonth(): number;
    diff(date: Moment | string | Date, unit?: string, precise?: boolean): number;
    toDate(): Date;
    clone(): Moment;
  }
  
  const moment: {
    (): Moment;
    (date: string | number | Date | Moment, format?: string, strict?: boolean): Moment;
    (date: string | number | Date | Moment, format?: string, language?: string, strict?: boolean): Moment;
  };
  
  export = moment;
}

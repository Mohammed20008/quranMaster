export interface Reciter {
  id: number;
  name: string;
  subtext: string;
  baseUrl: string; // Base URL for surah-level files
  everyAyahKey?: string; // Key for everyayah.com (verse-level)
  serverKey?: string; // Key for mp3quran.net if different
  isSurahBySurah: boolean;
  imageUrl?: string;
}

export const reciters: Reciter[] = [
  {
    id: 1,
    name: 'Mishary Rashid Alafasy',
    subtext: 'Murattal',
    baseUrl: 'https://server8.mp3quran.net/afs/',
    everyAyahKey: 'Alafasy_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Мишари_Рашид.jpg',
    isSurahBySurah: true,
  },
  {
    id: 2,
    name: 'Abdur-Rahman as-Sudais',
    subtext: 'Murattal',
    baseUrl: 'https://server11.mp3quran.net/sds/',
    everyAyahKey: 'Abdurrahmaan_As-Sudais_192kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Sheikh_Abdur_Rahman_Al-Sudais.jpg',
    isSurahBySurah: true,
  },
  {
    id: 3,
    name: 'Muhammad Siddiq al-Minshawi',
    subtext: 'Murattal',
    baseUrl: 'https://server10.mp3quran.net/minsh/',
    everyAyahKey: 'Minshawy_Murattal_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Mohamed_Siddiq_El-Minshawi.jpg',
    isSurahBySurah: true,
  },
  {
    id: 4,
    name: 'Ali Abdur-Rahman al-Huthaify',
    subtext: 'Murattal',
    baseUrl: 'https://server9.mp3quran.net/hthf/',
    everyAyahKey: 'Hudhaify_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Ali_Bin_Abdur_Rahman_Al_Hudhaify.png',
    isSurahBySurah: true,
  },
  {
    id: 5,
    name: 'Saad al-Ghamdi',
    subtext: 'Murattal',
    baseUrl: 'https://server7.mp3quran.net/s_gmd/',
    everyAyahKey: 'Ghamadi_40kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Saad_al_Ghamdi.jpg',
    isSurahBySurah: true,
  },
  {
    id: 6,
    name: 'Abdul Basit Abdul Samad',
    subtext: 'Mujawwad',
    baseUrl: 'https://server7.mp3quran.net/basit_mjwd/',
    everyAyahKey: 'AbdulSamad_64kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Abdul_Basit_Abdul_Samad.jpg',
    isSurahBySurah: true,
  },
  {
    id: 7,
    name: 'Mahmoud Khalil Al-Hussary',
    subtext: 'Murattal',
    baseUrl: 'https://server13.mp3quran.net/husr/',
    everyAyahKey: 'Husary_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Mahmoud_Khalil_Al-Hussary.jpg',
    isSurahBySurah: true,
  },
  {
    id: 8,
    name: 'Yasser Al-Dosari',
    subtext: 'Murattal',
    baseUrl: 'https://server11.mp3quran.net/yasser/',
    everyAyahKey: 'Yasser_Ad-Dussary_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Yasser_Al-Dosari.jpg',
    isSurahBySurah: true,
  },
  {
    id: 9,
    name: 'Saud al-Shuraim',
    subtext: 'Murattal',
    baseUrl: 'https://server7.mp3quran.net/shur/',
    everyAyahKey: 'Saood_ash-Shuraym_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Saud_Shuraim_doing_the_Khutbah.png',
    isSurahBySurah: true,
  },
  {
    id: 10,
    name: 'Maher al-Muaiqly',
    subtext: 'Murattal',
    baseUrl: 'https://server12.mp3quran.net/maher/',
    everyAyahKey: 'MaherAlMuaiqly128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Maher_Al_Mueaqly.png',
    isSurahBySurah: true,
  },
  {
    id: 11,
    name: 'Ahmed al-Ajmi',
    subtext: 'Murattal',
    baseUrl: 'https://server10.mp3quran.net/ajm/',
    everyAyahKey: 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Ahmad_bin_Ali_Al-Ajmi.png',
    isSurahBySurah: true,
  },
  {
    id: 12,
    name: 'Abu Bakr al-Shatri',
    subtext: 'Murattal',
    baseUrl: 'https://server11.mp3quran.net/shatri/',
    everyAyahKey: 'Abu_Bakr_Ash-Shaatree_128kbps',
    imageUrl: undefined,
    isSurahBySurah: true,
  },
  {
    id: 13,
    name: 'Fares Abbad',
    subtext: 'Murattal',
    baseUrl: 'https://server8.mp3quran.net/frs_a/',
    everyAyahKey: 'Fares_Abbad_64kbps',
    imageUrl: undefined,
    isSurahBySurah: true,
  },
  {
    id: 14,
    name: 'Raad al-Kurdi',
    subtext: 'Murattal',
    baseUrl: 'https://server6.mp3quran.net/kurdi/',
    everyAyahKey: 'Raad_Al_Kurdi_128kbps',
    imageUrl: undefined,
    isSurahBySurah: true,
  },
  {
    id: 15,
    name: 'Hazza Al Balushi',
    subtext: 'Murattal',
    baseUrl: 'https://server11.mp3quran.net/hazza/',
    everyAyahKey: 'Hazza_Al_Balushi_128kbps',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/22/A._Al-Balooshi.jpg',
    isSurahBySurah: true,
  }
];

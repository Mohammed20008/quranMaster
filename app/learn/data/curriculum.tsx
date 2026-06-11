import React from 'react';
import { SectionData } from '../types';
import { alphabetLessons } from './alphabet';

export const INITIAL_LEARNING_SECTIONS: SectionData[] = [
  {
    id: 'arabic',
    title: 'Arabic Language',
    arabicTitle: 'اللغة العربية',
    description: 'Master the tongue of the Quran. Learn shapes, connections, short vowels, and joining rules.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9M3 20l7-14 7 14M5.5 15h9" />
      </svg>
    ),
    themeColor: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    levels: {
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Beginner foundations: Master all 28 Arabic letters — their shapes, connection forms, and short vowels.',
        lessons: alphabetLessons
      },
      adventure: {
        id: 'adventure',
        title: 'Adventure',
        description: 'Intermediate: Master the Shaddah (doubling mark) and Tanween (nunation) — two of the most important diacritics in the Quran.',
        lessons: [
          {
            id: 'ar_adv_shaddah',
            title: 'Shaddah: The Doubling Mark',
            description: 'Learn how the Shaddah (◌ّ) doubles any consonant, transforms words, and appears throughout the Quran.',
            points: 120,
            slides: [
              {
                title: 'What Is the Shaddah? ◌ّ',
                arabic: 'الشَّدَّة',
                transliteration: 'Ash-Shaddah',
                content: 'The Shaddah (ّ) is a small "W"-shaped diacritic written above a letter. It is one of the most powerful marks in Arabic — it doubles the consonant completely. Think of it as two letters squeezed into one: the first is silent (sukoon), the second carries a vowel and is spoken strongly.'
              },
              {
                title: 'How to Pronounce a Shaddah',
                arabic: 'مَدْدَ → مَدَّ',
                transliteration: 'Madda = Mad + da',
                content: 'When you see a Shaddah, hold the sound for double the time of a normal letter. Your mouth tenses and releases:\n\n• بَبَّا → bab-ba (the Ba is doubled)\n• مَدَّ → mad-da (the Dal is doubled)\n• حَجَّ → haj-ja (the Jeem is doubled)\n\nThe "squeeze then release" feeling in your mouth is the key to correct Shaddah pronunciation.'
              },
              {
                title: 'Shaddah with Fathah: ◌َّ',
                arabic: 'مَكَّةُ • رَبَّنَا • شَدَّ',
                transliteration: 'Makkah • Rabbanā • Shadda',
                content: 'Shaddah + Fathah (◌َّ) → makes a tense "a" sound from a doubled letter.\n\n🕌 مَكَّةُ (Makkah) — the letter Kaf is doubled: "Mak-ka"\n🤲 رَبَّنَا (Rabbanā) — Ba is doubled: "Rab-ba-naa" — from Surah Al-Fatihah!\n📌 شَدَّ (Shadda) — Dal is doubled: "Shad-da"'
              },
              {
                title: 'Shaddah with Kasrah: ◌ِّ',
                arabic: 'النَّبِيِّ • مِنِّي • الجِنِّ',
                transliteration: "An-Nabiyy • Minnī • Al-Jinn",
                content: 'Shaddah + Kasrah (◌ِّ) → doubled letter with an "i" sound.\n\n📖 النَّبِيِّ (An-Nabiyy) — Ya is doubled with kasrah: "An-Na-biy-yi"\n💬 مِنِّي (Minnī) — Noon is doubled: "Min-ni" (meaning "from me")\n👁️ الجِنِّ (Al-Jinn) — Noon is doubled: "Al-Jin-ni" — Surah 72 in the Quran!'
              },
              {
                title: 'Shaddah with Dammah: ◌ُّ',
                arabic: 'الحَقُّ • رَبُّكَ • عَدُوٌّ',
                transliteration: 'Al-Haqq • Rabbuka • Aduww',
                content: 'Shaddah + Dammah (◌ُّ) → doubled letter with a "u" sound.\n\n✅ الحَقُّ (Al-Haqq) — Qaf is doubled: "Al-Haq-qu" (The Truth — one of Allah\'s names!)\n🌟 رَبُّكَ (Rabbuka) — Ba is doubled: "Rab-bu-ka" (Your Lord)\n⚔️ عَدُوٌّ (Aduww) — Waw is doubled: "A-duw-wun" (enemy)'
              },
              {
                title: 'The Shaddah on Noon: نّ',
                arabic: 'إِنَّ • مِنَّا • لَكِنَّ',
                transliteration: "Inna • Minnā • Lakinna",
                content: 'The Noon Shaddah (نّ) appears constantly in the Quran. It is NOT like the Noon Ghunnah — it is a clean, tense doubled "n".\n\n📖 إِنَّ (Inna) — "Indeed / Verily" — appears over 300 times in the Quran!\n🤲 مِنَّا (Minnā) — "From us"\n📌 لَكِنَّ (Lakinna) — "But / However"\n\nTip: When you see نّ, feel your tongue tap firmly against the roof of your mouth twice.'
              },
              {
                title: 'The Shaddah on Lam: لّ',
                arabic: 'اللَّه • الضَّالِّين • كُلٌّ',
                transliteration: 'Allāh • Ad-Dāllīn • Kullun',
                content: 'The most sacred Shaddah! The Shaddah on Lam appears in the word اللَّه (Allah).\n\n🌟 اللَّه — The Lam is doubled before a powerful "ah": "Al-LAAH". The tongue lifts firmly twice.\n📖 الضَّالِّين — Lam is doubled with kasrah in Surah Al-Fatihah (the misguided).\n📿 كُلٌّ (Kullun) — Lam is doubled: "Kul-lun" (every / all)'
              },
              {
                title: 'Shaddah in Surah Al-Fatihah',
                arabic: 'الرَّحْمَٰنِ • الرَّحِيمِ • الضَّالِّين',
                transliteration: 'Ar-Rahmān • Ar-Rahīm • Ad-Dāllīn',
                content: 'Surah Al-Fatihah — which you recite in every prayer — contains 5 Shaddahs!\n\n1️⃣ الرَّحْمَٰنِ — Raa doubled: "Ar-Rah-maan"\n2️⃣ الرَّحِيمِ — Raa doubled: "Ar-Ra-heem"\n3️⃣ رَبِّ — Ba doubled: "Rab-bi" (My Lord)\n4️⃣ الضَّالِّين — Both Dal & Lam have Shaddah!\n\nNow that you understand Shaddah, your Fatihah recitation will be more correct and more beautiful. 🌟'
              }
            ],
            quiz: [
              {
                id: 'q_shaddah_1',
                question: 'What does the Shaddah (◌ّ) do to a letter?',
                options: [
                  'It doubles the consonant sound',
                  'It silences the letter completely',
                  'It adds a nasal "n" at the end',
                  'It stretches the vowel to 2 counts'
                ],
                correctAnswer: 0,
                explanation: 'The Shaddah doubles the consonant — the first occurrence is silent (sukoon) and the second carries a vowel and is pronounced strongly.'
              },
              {
                id: 'q_shaddah_2',
                question: 'How many Shaddahs appear in Surah Al-Fatihah?',
                options: ['5', '3', '7', '2'],
                correctAnswer: 0,
                explanation: 'Al-Fatihah contains 5 Shaddahs: الرَّحْمَٰنِ، الرَّحِيمِ، رَبِّ، الضَّالِّين (Dal & Lam both have Shaddah).'
              },
              {
                id: 'q_shaddah_3',
                question: 'How do you pronounce مَكَّةُ (Makkah)?',
                options: ['Mak-ka', 'Ma-ka', 'Mak-ah', 'Ma-kkah'],
                correctAnswer: 0,
                explanation: 'The Kaf has a Shaddah, so it is doubled: Mak-ka. Your mouth tenses on the K then releases into -ka.'
              },
              {
                id: 'q_shaddah_4',
                question: 'Which Arabic word means "Indeed / Verily" and contains a Shaddah on Noon?',
                options: ['إِنَّ (Inna)', 'أَنَّ (Anna)', 'لَكِنَّ (Lakinna)', 'مِنَّا (Minnā)'],
                correctAnswer: 0,
                explanation: 'إِنَّ (Inna) means "Indeed / Verily" and appears over 300 times in the Quran with a Shaddah on the Noon.'
              },
              {
                id: 'q_shaddah_5',
                question: 'In the word رَبَّنَا (Rabbanā), which letter has the Shaddah?',
                options: ['Ba (ب)', 'Ra (ر)', 'Noon (ن)', 'Alif (ا)'],
                correctAnswer: 0,
                explanation: 'The Ba (ب) has the Shaddah in رَبَّنَا, making it "Rab-ba-naa". It appears in Surah Al-Fatihah.'
              },
              {
                id: 'q_shaddah_6',
                question: 'الحَقُّ (Al-Haqq) means "The Truth" — which letter is doubled?',
                options: ['Qaf (ق)', 'Ha (ح)', 'Alif (ا)', 'Lam (ل)'],
                correctAnswer: 0,
                explanation: 'The Qaf (ق) carries the Shaddah in الحَقُّ, pronounced "Al-Haq-qu". It is one of the 99 Names of Allah.'
              },
              {
                id: 'q_shaddah_7',
                question: 'What is the correct way to describe the pronunciation of a letter with Shaddah?',
                options: [
                  'Tense and hold the sound double the time',
                  'Skip the letter entirely',
                  'Whisper the letter softly',
                  'Add a nasal "n" after it'
                ],
                correctAnswer: 0,
                explanation: 'A Shaddah requires tensing your mouth and holding the sound for double the normal time — like pressing two letters of the same kind back-to-back.'
              },
              {
                id: 'q_shaddah_8',
                question: 'What word in Surah Al-Fatihah has TWO Shaddahs at once?',
                options: ['الضَّالِّين', 'الرَّحْمَٰنِ', 'رَبِّ', 'الرَّحِيمِ'],
                correctAnswer: 0,
                explanation: 'الضَّالِّين contains a Shaddah on both the Dal (ض) and the Lam (ل), making it one of the most complex words to pronounce correctly in Al-Fatihah.'
              }
            ]
          },
          {
            id: 'ar_adv_tanween',
            title: 'Tanween: The Nunation Endings',
            description: 'Learn the three Tanween marks (◌ً ◌ٍ ◌ٌ) that add a final "n" sound to indefinite nouns in Arabic.',
            points: 100,
            slides: [
              {
                title: 'What Is Tanween? التَّنْوِين',
                arabic: 'التَّنْوِين',
                transliteration: 'At-Tanween',
                content: 'Tanween (التنوين) literally means "nunation" — adding a "n" sound at the end of a word. It is written as a double vowel mark and signals that the noun is indefinite (like "a" in English — "a house", "a book").\n\nThere are 3 types:\n• ◌ً = Tanween Fath (an)\n• ◌ٍ = Tanween Kasr (in)\n• ◌ٌ = Tanween Damm (un)'
              },
              {
                title: 'Tanween Fath: ◌ً → "-an"',
                arabic: 'كِتَاباً • شُكْراً • أَحَداً',
                transliteration: 'Kitāban • Shukran • Ahadan',
                content: 'Tanween Fath (double fathah ◌ً) adds the sound "-an" at the end of a word.\n\n📖 كِتَاباً (Kitāban) — "a book"\n🙏 شُكْراً (Shukran) — "thanks" — you use this every day!\n☝️ أَحَداً (Ahadan) — "anyone / one" — from Surah Al-Ikhlas!\n\nNote: Tanween Fath is usually written on an Alif at the end of the word.'
              },
              {
                title: 'Tanween Kasr: ◌ٍ → "-in"',
                arabic: 'مُسْلِمٍ • رَجُلٍ • بَيْتٍ',
                transliteration: 'Muslimin • Rajulin • Baytin',
                content: 'Tanween Kasr (double kasrah ◌ٍ) adds the sound "-in" at the end of a word.\n\n🕌 مُسْلِمٍ (Muslimin) — "a Muslim (man)"\n👨 رَجُلٍ (Rajulin) — "a man"\n🏠 بَيْتٍ (Baytin) — "a house"\n\nThis form is often used in genitive (possession) sentences: "I came from a house" — مِنْ بَيْتٍ'
              },
              {
                title: 'Tanween Damm: ◌ٌ → "-un"',
                arabic: 'كِتَابٌ • مُسْلِمٌ • قَمَرٌ',
                transliteration: 'Kitābun • Muslimun • Qamarun',
                content: 'Tanween Damm (double dammah ◌ٌ) adds the sound "-un" at the end of a word.\n\n📖 كِتَابٌ (Kitābun) — "a book" (subject form)\n☪️ مُسْلِمٌ (Muslimun) — "a Muslim"\n🌙 قَمَرٌ (Qamarun) — "a moon"\n\nThis is the default "subject" form of indefinite nouns. When you first learn a word in Arabic, it\'s often given in this form.'
              },
              {
                title: 'Tanween in the Quran',
                arabic: 'صِرَاطاً • قَوْلاً • عَلِيماً',
                transliteration: 'Sirātan • Qawlan • Alīman',
                content: 'Tanween appears throughout the Quran, especially at the end of divine attributes and descriptions.\n\n📿 عَلِيماً (Alīman) — "All-Knowing" (one of Allah\'s names in Tanween form)\n🌿 رَحِيماً (Rahīman) — "Most Merciful"\n🗣️ قَوْلاً (Qawlan) — "a word / saying"\n\nIn Surah Al-Fatihah: أَنْعَمْتَ عَلَيْهِمْ — the pattern here follows similar nunation grammar.'
              },
              {
                title: 'Tanween vs. Regular Vowels',
                arabic: 'كِتَابٌ ≠ كِتَابُ',
                transliteration: 'Kitābun (indefinite) vs. Kitābu (definite context)',
                content: 'A single vowel mark = definite or grammatical context\nA double vowel mark (Tanween) = indefinite ("a ___")\n\n🔹 كِتَابٌ = "a book" (Tanween = indefinite)\n🔸 الْكِتَابُ = "THE book" (no Tanween, has "Al-")\n\nRule: If a word has "Al-" (الـ) at the beginning, it CANNOT have Tanween at the end. They are opposites — definite vs. indefinite.'
              }
            ],
            quiz: [
              {
                id: 'q_tanween_1',
                question: 'What does Tanween add to the end of a word?',
                options: ['A final "n" sound', 'A long vowel', 'Silence', 'A double consonant'],
                correctAnswer: 0,
                explanation: 'Tanween adds a final "n" sound (-an, -in, or -un) to the end of indefinite nouns.'
              },
              {
                id: 'q_tanween_2',
                question: 'Which mark represents Tanween Fath?',
                options: ['◌ً (double fathah)', '◌ٍ (double kasrah)', '◌ٌ (double dammah)', '◌ّ (shaddah)'],
                correctAnswer: 0,
                explanation: 'Tanween Fath is written as a double fathah (◌ً) and adds "-an" to the end of the word.'
              },
              {
                id: 'q_tanween_3',
                question: 'How do you pronounce كِتَابٌ?',
                options: ['Kitābun', 'Kitābu', 'Kitāb', 'Kitāban'],
                correctAnswer: 0,
                explanation: 'كِتَابٌ has Tanween Damm (double dammah ◌ٌ), pronounced "Kitābun" — "a book".'
              },
              {
                id: 'q_tanween_4',
                question: 'Which word means "Thanks" and uses Tanween Fath?',
                options: ['شُكْراً (Shukran)', 'شُكْرٌ (Shukrun)', 'شُكْرٍ (Shukrin)', 'الشُّكْرُ (Ash-Shukru)'],
                correctAnswer: 0,
                explanation: 'شُكْراً (Shukran) uses Tanween Fath (◌ً), ending with "-an". It is one of the most commonly used Arabic words!'
              },
              {
                id: 'q_tanween_5',
                question: 'Can a word have both "Al-" (الـ) AND Tanween at the same time?',
                options: ['No — they are opposites', 'Yes, always', 'Only with Fath', 'Only at the end of a sentence'],
                correctAnswer: 0,
                explanation: 'A word with "Al-" (الـ) is definite ("the book"), while Tanween makes it indefinite ("a book"). They cannot appear together.'
              },
              {
                id: 'q_tanween_6',
                question: 'What is the Tanween form of مُسْلِم meaning "a Muslim" (subject form)?',
                options: ['مُسْلِمٌ (Muslimun)', 'مُسْلِمً (Musliman)', 'مُسْلِمٍ (Muslimin)', 'الْمُسْلِمُ (Al-Muslimu)'],
                correctAnswer: 0,
                explanation: 'The subject (nominative) indefinite form uses Tanween Damm: مُسْلِمٌ (Muslimun) — "a Muslim".'
              }
            ]
          }
        ]
      },
      master: {
        id: 'master',
        title: 'Master',
        description: 'Advanced mastery: Sukoon, Syllables, and Sun vs. Moon letter joining rules.',
        lessons: [
          {
            id: 'ar_mas_joining',
            title: 'Syllables & Sun/Moon Joining Rules',
            description: 'Learn how to combine individual vowelled letters, shaddah, sukoon, and the difference between Sun and Moon letters.',
            points: 100,
            slides: [
              {
                title: 'Sukoon: The Silent Mark',
                arabic: 'أَبْ',
                transliteration: 'ab',
                content: 'A Sukoon (◌ْ) represents the absence of a vowel. When placed over a letter, it causes that letter to be pronounced silently and merged with the preceding vowelled letter.'
              },
              {
                title: 'Shaddah: The Double Letter',
                arabic: 'أَبَّ',
                transliteration: 'abba',
                content: 'A Shaddah (◌ّ) indicates a double consonant. The first instance of the letter is silent (with a sukoon), and the second is vowelled. Example: ab-ba.'
              },
              {
                title: 'Sun vs. Moon Letters',
                arabic: 'الشَّمْس / الْقَمَر',
                transliteration: 'Ash-Shams / Al-Qamar',
                content: 'When adding "Al-" (الـ) to a word: with Sun letters, the "L" sound is completely absorbed into a double sound of the next letter. With Moon letters, the "L" is pronounced clearly.'
              }
            ],
            quiz: [
              {
                id: 'q_ar_mas_joining_1',
                question: 'What mark is placed over a letter to indicate it has no vowel and joins the preceding vowel?',
                options: ['Sukoon (◌ْ)', 'Shaddah (◌ّ)', 'Fathah (◌َ)', 'Tanween (◌ً)'],
                correctAnswer: 0,
                explanation: 'Sukoon (◌ْ) indicates a resting or silent letter that merges with the previous vowel.'
              },
              {
                id: 'q_ar_mas_joining_2',
                question: 'What is the function of the Shaddah (◌ّ) mark?',
                options: ['To double the consonant sound', 'To silence the letter completely', 'To add a nasal sound', 'To stretch the vowel length'],
                correctAnswer: 0,
                explanation: 'The Shaddah doubles the consonant, pronouncing the first part with a resting sukoon and the second with the vowel.'
              },
              {
                id: 'q_ar_mas_joining_3',
                question: 'In the word "Al-Qamar" (الْقَمَر), is the letter Qaf (ق) a Sun or Moon letter?',
                options: ['Moon letter (pronounced L)', 'Sun letter (absorbed L)', 'Neither', 'Both'],
                correctAnswer: 0,
                explanation: 'Qaf is a Moon letter, which means the "L" in "Al-" is clearly pronounced.'
              }
            ]
          }
        ]
      }
    }
  },

  {
    id: 'fiqh',
    title: 'Fiqh (Jurisprudence)',
    arabicTitle: 'الفقه',
    description: 'Learn the practical rulings of Islamic acts of worship (Ibadah). Ritual purity, Wudu, and Salah.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    themeColor: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    levels: {
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Learn the rules of purification and the obligatory steps of ablution.',
        lessons: [
          {
            id: 'fq_exp_l1',
            title: 'Pure Beginnings: Taharah & Water',
            description: 'Understand the concept of ritual purity and the types of water allowed for cleaning.',
            points: 50,
            slides: [
              {
                title: 'What is Fiqh and Taharah?',
                content: 'Fiqh literally means "deep understanding." In Islamic law, it refers to practical rulings. Taharah (ritual cleanliness) is the absolute key to prayer. Cleanliness is highly beloved to Allah.',
                arabic: 'الطَّهُارَة',
                transliteration: 'Taharah (Cleanliness)'
              },
              {
                title: 'Types of Water',
                content: 'For purification, water is categorized into:\n\n1. Tahir Mutahhir (Pure and Purifying) - Natural water from rain, seas, wells, and rivers that is unchanged in color, taste, or smell.\n2. Tahir Ghair Mutahhir (Pure but not Purifying) - Water mixed with pure things like juice or tea.\n3. Najis (Impure) - Water contaminated with impurities.',
                arabic: 'الْمَاء',
                transliteration: 'Al-Ma\''
              }
            ],
            quiz: [
              {
                id: 'q_fq_exp_l1_1',
                question: 'Which type of water is valid for Wudu?',
                options: ['Tahir Mutahhir (Pure and Purifying natural water)', 'Tea or Rosewater', 'Water mixed with impurities', 'Soda'],
                correctAnswer: 0,
                explanation: 'Only Tahir Mutahhir (unaltered natural water) is purifying and valid for performing Wudu.'
              },
              {
                id: 'q_fq_exp_l1_2',
                question: 'What is the meaning of Taharah in Islam?',
                options: ['Prayer', 'Ritual purity and cleanliness', 'Charity', 'Fasting'],
                correctAnswer: 1,
                explanation: 'Taharah translates directly to state of cleanliness and ritual purity.'
              }
            ]
          },
          {
            id: 'fq_exp_l2',
            title: 'Obligatory Steps of Wudu',
            description: 'Learn the exact sequential steps required to perform a valid Wudu.',
            points: 50,
            slides: [
              {
                title: 'The Essential Pillars of Wudu',
                content: 'Wudu has six obligatory pillars (Fara\'id) derived from Surah Al-Ma\'idah:\n\n1. Intention in the heart (Niyyah).\n2. Washing the face.\n3. Washing both arms up to and including the elbows.\n4. Wiping a portion of the head.\n5. Washing both feet up to the ankles.\n6. Adhering to the sequence (Tartib) without long pauses.',
                arabic: 'الْوُضُوء',
                transliteration: 'Al-Wudu'
              },
              {
                title: 'Recommended Sunnah Acts',
                content: 'These recommended acts add extra reward but do not break Wudu if omitted:\n\n- Saying "Bismillah" at the start.\n- Washing hands to the wrists first.\n- Rinsing the mouth (Madmadah) and nose (Istinshaq).\n- Wiping the inner and outer ears.',
                arabic: 'بِسْمِ اللَّهِ',
                transliteration: 'Bismillah'
              }
            ],
            quiz: [
              {
                id: 'q_fq_exp_l2_1',
                question: 'Which of these is an OBLIGATORY (Fard) act of Wudu?',
                options: ['Saying Bismillah', 'Washing the arms to the elbows', 'Wiping the ears', 'Washing the hands to the wrists at the start'],
                correctAnswer: 1,
                explanation: 'Washing the arms to the elbows is a mandatory pillar of Wudu.'
              },
              {
                id: 'q_fq_exp_l2_2',
                question: 'What is the ruling if you forgetfully miss a Sunnah act like wiping the ears?',
                options: ['Your Wudu is invalid', 'Your Wudu is still fully valid', 'You must repeat Wudu twice', 'You must pay charity'],
                correctAnswer: 1,
                explanation: 'Omitting a Sunnah act does not invalidate Wudu; it remains valid, though you miss out on extra reward.'
              }
            ]
          }
        ]
      },
      adventure: {
        id: 'adventure',
        title: 'Adventure',
        description: 'Explore the conditions, pillars, and invalidating factors of Salah.',
        lessons: [
          {
            id: 'fq_adv_l1',
            title: 'Salah: Conditions & Pillars',
            description: 'Examine factors that must exist before and within the daily prayers.',
            points: 80,
            slides: [
              {
                title: 'Conditions (Shurut) of Salah',
                content: 'Conditions are prerequisites that must be met BEFORE prayer starts for it to be valid:\n\n1. State of purity (Wudu).\n2. Covering the Awrah.\n3. Facing the Qiblah (direction of the Ka\'bah).\n4. Soundness of mind and age of discernment.\n5. Arrival of the specified prayer time.',
                arabic: 'شُرُوطُ الصَّلَاة',
                transliteration: 'Shurut us-Salah'
              },
              {
                title: 'Pillars (Arkan) of Salah',
                content: 'Pillars are components inside the prayer that cannot be omitted forgetfully or intentionally:\n\n- Standing if able.\n- Takbeerat-ul-Ihram (opening Takbeer).\n- Reciting Surah Al-Fatihah.\n- Ruku (bowing) and rising up.\n- Sujud (prostration) and sitting between them.\n- Final Tashahhud and Tasleem.',
                arabic: 'أَرْكَانُ الصَّلَاة',
                transliteration: 'Arkan us-Salah'
              }
            ],
            quiz: [
              {
                id: 'q_fq_adv_l1_1',
                question: 'Which of the following is a CONDITION (Shart) that must be met BEFORE prayer starts?',
                options: ['Reciting Surah Al-Fatihah', 'Facing the Qiblah', 'Performing Ruku', 'Saying Tasleem at the end'],
                correctAnswer: 1,
                explanation: 'Facing the Qiblah must be prepared and maintained before prayer begins, making it a condition.'
              },
              {
                id: 'q_fq_adv_l1_2',
                question: 'What is the ruling if a person forgetfully leaves out a Pillar (Rukn) like Ruku?',
                options: ['The prayer is fine', 'They must repeat that Rakah and perform Sujud Sahw', 'They must perform Sujud Sahw immediately while standing', 'They just pay Zakah'],
                correctAnswer: 1,
                explanation: 'If a pillar is missed, it must be performed or the entire unit (Rakah) is void. Sujud Sahw corrects the forgetfulness at the end.'
              }
            ]
          }
        ]
      },
      master: {
        id: 'master',
        title: 'Master',
        description: 'Study fasting, wealth purification, and the pilgrimage rites.',
        lessons: [
          {
            id: 'fq_mas_l1',
            title: 'Sawm: Fasting Ramadan',
            description: 'Understand the nullifiers, obligations, and rewards of the holy month of fasting.',
            points: 100,
            slides: [
              {
                title: 'Meaning and Nullifiers of Fasting',
                content: 'Sawm is to abstain from food, drink, and intimate relations from dawn (Fajr) to sunset (Maghrib) with intention. Nullifiers include eating/drinking intentionally and vomiting intentionally.',
                arabic: 'صَوْمُ رَمَضَان',
                transliteration: 'Sawmu Ramadan'
              }
            ],
            quiz: [
              {
                id: 'q_fq_mas_l1_1',
                question: 'What happens if a person eats or drinks genuinely forgetfully during fasting?',
                options: ['Their fast is broken and they must make it up', 'Their fast is fully valid and they should continue', 'They must pay charity immediately', 'Their fast is invalid'],
                correctAnswer: 1,
                explanation: 'The Prophet (SAW) said that if a person eats or drinks forgetfully, it is Allah who fed them, so their fast remains valid.'
              }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'aqidah',
    title: 'Aqidah (Creed)',
    arabicTitle: 'العقيدة',
    description: 'Explore the core beliefs of a Muslim. The Six Pillars of Iman and the Oneness of Allah (Tawhid).',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
        <path d="M12 2C6.48 2 2 6.48 2 12c0 3.06 1.38 5.8 3.5 7.65V12a6.5 6.5 0 0 1 13 0v7.65c2.12-1.85 3.5-4.59 3.5-7.65 0-5.52-4.48-10-10-10z" />
      </svg>
    ),
    themeColor: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    levels: {
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Understand the fundamental Six Pillars of Belief and differences from outer actions.',
        lessons: [
          {
            id: 'aq_exp_l1',
            title: 'The Six Pillars of Iman',
            description: 'Examine the inward articles of faith detailed in the Hadith of Angel Jibril.',
            points: 50,
            slides: [
              {
                title: 'The Inward Articles of Faith',
                content: 'Iman refers to belief in the heart, statement of the tongue, and actions of the limbs. The 6 pillars are:\n\n1. Belief in Allah.\n2. Belief in His Angels.\n3. Belief in His Divine Books.\n4. Belief in His Messengers.\n5. Belief in the Last Day.\n6. Belief in Al-Qadar (Divine Decree).',
                arabic: 'أَرْكَانُ الإِيمَان',
                transliteration: 'Arkanul-Iman'
              }
            ],
            quiz: [
              {
                id: 'q_aq_exp_l1_1',
                question: 'How many pillars of Iman (Faith) are there?',
                options: ['5 Pillars', '6 Pillars', '7 Pillars', '8 Pillars'],
                correctAnswer: 1,
                explanation: 'There are 6 pillars of Iman as defined by the Prophet (SAW).'
              }
            ]
          }
        ]
      },
      adventure: {
        id: 'adventure',
        title: 'Adventure',
        description: 'Explore the categories of Tawhid in depth.',
        lessons: [
          {
            id: 'aq_adv_l1',
            title: 'The Three Categories of Tawhid',
            description: 'Understand Lordship, Worship, and the Divine Names and Attributes.',
            points: 80,
            slides: [
              {
                title: 'Tawhid Division',
                content: 'Tawhid is divided into:\n\n1. Tawhid ar-Rububiyyah (Lordship) - Singling out Allah in His actions (creating, providing).\n2. Tawhid al-Uluhiyyah (Worship) - Singling out Allah in our actions of worship (prayer, Du\'a).\n3. Tawhid al-Asma was-Sifat (Names and Attributes) - Affirming Allah\'s perfect revealed names.',
                arabic: 'التَّوْحِيد',
                transliteration: 'Tawhid'
              }
            ],
            quiz: [
              {
                id: 'q_aq_adv_l1_1',
                question: 'Singling out Allah in our daily prayers, vows, and supplications is called:',
                options: ['Tawhid ar-Rububiyyah', 'Tawhid al-Uluhiyyah', 'Tawhid al-Asma was-Sifat', 'Shirk'],
                correctAnswer: 1,
                explanation: 'Singling out Allah in worship and devotion is Tawhid al-Uluhiyyah.'
              }
            ]
          }
        ]
      },
      master: {
        id: 'master',
        title: 'Master',
        description: 'Explore the dangers of Shirk and understanding Destiny (Al-Qadar).',
        lessons: [
          {
            id: 'aq_mas_l1',
            title: 'The Danger of Shirk',
            description: 'Analyze associating partners with Allah and the importance of pure monotheism.',
            points: 100,
            slides: [
              {
                title: 'Major and Minor Shirk',
                content: 'Shirk is the greatest injustice. Major Shirk removes a person from Islam (e.g. praying to graves or idols). Minor Shirk includes showing off in worship (Riyaa) or swearing by other than Allah.',
                arabic: 'الشرك',
                transliteration: 'Shirk'
              }
            ],
            quiz: [
              {
                id: 'q_aq_mas_l1_1',
                question: 'What is Riyaa (Minor Shirk)?',
                options: ['Lying', 'Showing off in acts of worship to earn praise', 'Stealing', 'Forgetfulness in Salah'],
                correctAnswer: 1,
                explanation: 'Riyaa is doing good deeds so people will see and praise you, which compromises sincerity.'
              }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'qasas',
    title: 'Qasas (Stories)',
    arabicTitle: 'قصص الأنبياء',
    description: 'Discover the inspiring stories of the Prophets. Draw timeless lessons from their struggles, patience, and victory.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    themeColor: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    levels: {
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Explore the stories of the Father of Humanity, Adam (AS), and the Friend of Allah, Ibrahim (AS).',
        lessons: [
          {
            id: 'qs_exp_l1',
            title: 'Prophet Adam (AS): The Beginning',
            description: 'Learn about the creation of the first human, Iblis\'s pride, and Adam\'s repentance.',
            points: 50,
            slides: [
              {
                title: 'The Clay Creation',
                content: 'Adam (AS) was shaped from clay by Allah. Iblis refused to prostrate to him out of pride, saying "I am better than him, created from fire." After slipping in Paradise, Adam repented immediately and was sent to establish life on Earth.',
                arabic: 'آدَم عَلَيْهِ السَّلَام',
                transliteration: 'Adam (AS)'
              }
            ],
            quiz: [
              {
                id: 'q_qs_exp_l1_1',
                question: 'Why did Iblis refuse to prostrate to Adam (AS)?',
                options: ['He did not hear the command', 'Arrogance, claiming fire is better than clay', 'He was not ordered to', 'He was afraid'],
                correctAnswer: 1,
                explanation: 'Iblis let pride consume him, arguing that fire is superior to clay.'
              }
            ]
          }
        ]
      },
      adventure: {
        id: 'adventure',
        title: 'Adventure',
        description: 'Discover the immense patience of Nuh (AS) and the parting of the sea by Musa (AS).',
        lessons: [
          {
            id: 'qs_adv_l1',
            title: 'Prophet Musa (AS): Confronting Pharaoh',
            description: 'Explore Musa\'s childhood in the palace, Mount Tur dialogue, and the Red Sea miracle.',
            points: 80,
            slides: [
              {
                title: 'The Red Sea Miracle',
                content: 'Trapped between Pharaoh\'s chasing army and the Red Sea, Musa (AS) struck the water with his staff. The sea parted immediately, creating dry paths. The believers crossed safely, while Pharaoh and his army drowned.',
                arabic: 'مُعْجِزَة',
                transliteration: 'Miracle'
              }
            ],
            quiz: [
              {
                id: 'q_qs_adv_l1_1',
                question: 'What occurred when Musa struck the Red Sea with his staff?',
                options: ['It turned into fire', 'It parted, leaving dry paths for crossing', 'It dried up completely forever', 'It became honey'],
                correctAnswer: 1,
                explanation: 'By Allah\'s command, the sea parted to save the believers and drown the oppressors.'
              }
            ]
          }
        ]
      },
      master: {
        id: 'master',
        title: 'Master',
        description: 'Study the rise of Yusuf (AS) and the miraculous nature of Isa (AS).',
        lessons: [
          {
            id: 'qs_mas_l1',
            title: 'Prophet Yusuf (AS): Patience to Victory',
            description: 'Track Yusuf\'s trials from the well, false prison sentence, to the treasury throne of Egypt.',
            points: 100,
            slides: [
              {
                title: 'The Treasury of Egypt',
                content: 'Envied by his brothers and thrown in a well, Yusuf (AS) remained patient. Falsely imprisoned, his gift of dream interpretation saved Egypt from a seven-year famine. He was made minister of treasury and reunited with his family.',
                arabic: 'يُوسُف الصِّدِّيق',
                transliteration: 'Yusuf the Truthful'
              }
            ],
            quiz: [
              {
                id: 'q_qs_mas_l1_1',
                question: 'What special gift did Allah give to Prophet Yusuf (AS)?',
                options: ['Interpreting dreams', 'Speaking to animals', 'A staff that turned into a snake', 'Parting the sea'],
                correctAnswer: 0,
                explanation: 'Yusuf (AS) was blessed with the wisdom of interpreting dreams, which led to his release from prison.'
              }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'sirah',
    title: 'Sirah (Prophetic Life)',
    arabicTitle: 'السيرة النبوية',
    description: 'Trace the life of the Prophet Muhammad (SAW). Birth, Revelation, Migration, and Farewell Sermon.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    themeColor: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    levels: {
      explorer: {
        id: 'explorer',
        title: 'Explorer',
        description: 'Study the birth, impeccable character, and first revelation of the Prophet (SAW).',
        lessons: [
          {
            id: 'sr_exp_l1',
            title: 'Prophetic Birth & Early Life',
            description: 'Learn about the Year of the Elephant, early orphan years, and marriage to Khadijah (RA).',
            points: 50,
            slides: [
              {
                title: 'Birth in Makkah',
                content: 'Prophet Muhammad (SAW) was born in Makkah in 570 CE (Year of the Elephant). Born an orphan, his father passed away before birth and his mother when he was six. Known in Makkah as "Al-Amin" (The Trustworthy) for his incredible honesty.',
                arabic: 'الأَمِين',
                transliteration: 'Al-Amin'
              }
            ],
            quiz: [
              {
                id: 'q_sr_exp_l1_1',
                question: 'What title was the Prophet (SAW) known by in Makkah due to his honesty?',
                options: ['Al-Faruq', 'Al-Amin (The Trustworthy)', 'Al-Siddiq', 'Abu Bakr'],
                correctAnswer: 1,
                explanation: 'He was beloved and widely known as Al-Amin for his truthfulness and integrity.'
              }
            ]
          }
        ]
      },
      adventure: {
        id: 'adventure',
        title: 'Adventure',
        description: 'Explore the migration (Hijrah) to Yathrib and building the first Islamic city.',
        lessons: [
          {
            id: 'sr_adv_l1',
            title: 'The Great Hijrah (622 CE)',
            description: 'Trace the dangerous escape with Abu Bakr and arrival at Yathrib (Madinah).',
            points: 80,
            slides: [
              {
                title: 'The Migration Yathrib Journey',
                content: 'Persecuted in Makkah, the Prophet (SAW) and Abu Bakr migrated to Yathrib in 622 CE. This journey, called the Hijrah, marks the historic beginning of the Islamic Hijri calendar.',
                arabic: 'الْهِجْرَة',
                transliteration: 'The Hijrah'
              }
            ],
            quiz: [
              {
                id: 'q_sr_adv_l1_1',
                question: 'Which companion migrated alongside the Prophet (SAW) during the Hijrah?',
                options: ['Ali ibn Abi Talib', 'Abu Bakr Al-Siddiq', 'Umar ibn Al-Khattab', 'Uthman ibn Affan'],
                correctAnswer: 1,
                explanation: 'Abu Bakr (RA) was chosen to accompany the Prophet on this dangerous journey.'
              }
            ]
          }
        ]
      },
      master: {
        id: 'master',
        title: 'Master',
        description: 'Learn the peaceful Conquest of Makkah and final Farewell Sermon message.',
        lessons: [
          {
            id: 'sr_mas_l1',
            title: 'The Peaceful Conquest of Makkah',
            description: 'Witness the absolute mercy of general amnesty and cleansing the Ka\'bah of idols.',
            points: 100,
            slides: [
              {
                title: 'Entering Makkah peacefully',
                content: 'In 630 CE, the Prophet (SAW) entered Makkah peacefully with 10,000 men. He cleansed the Ka\'bah of 360 idols and declared general amnesty, saying to his former persecutors: "Go, for you are free."',
                arabic: 'فَتْحُ مَكَّة',
                transliteration: 'Fath Makkah'
              }
            ],
            quiz: [
              {
                id: 'q_sr_mas_l1_1',
                question: 'How did the Prophet (SAW) treat his former Makkan enemies after the Conquest?',
                options: ['He imprisoned them', 'He declared general amnesty and forgave them', 'He banished them', 'He seized all their wealth'],
                correctAnswer: 1,
                explanation: 'The Prophet displayed unmatched mercy by forgiving his enemies and freeing them.'
              }
            ]
          }
        ]
      }
    }
  }
];

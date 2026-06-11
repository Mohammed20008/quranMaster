"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  SectionData,
  LevelData,
  LessonData,
  LessonSlide,
  QuizQuestion,
} from "../types";
import { INITIAL_LEARNING_SECTIONS } from "../data/curriculum";
import styles from "./edit.module.css";

export default function CurriculumEditorPage() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<
    "arabic" | "fiqh" | "aqidah" | "qasas" | "sirah"
  >("arabic");
  const [activeLevelId, setActiveLevelId] = useState<
    "explorer" | "adventure" | "master"
  >("explorer");

  // Selection/Editing states
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Workspace sub-tabs for easier organization
  const [editorTab, setEditorTab] = useState<"details" | "content" | "quiz">("details");

  // Alphabet lessons sub-state
  const [selectedEditLetter, setSelectedEditLetter] = useState<string>("");
  const [selectedEditVowelIdx, setSelectedEditVowelIdx] = useState<number>(0);
  const [selectedEditShapeType, setSelectedEditShapeType] = useState<"main" | "isolated" | "initial" | "medial" | "final">("isolated");

  // Sidebar and Search states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");

  // Form states for the currently selected/new lesson
  const [lessonForm, setLessonForm] = useState<Partial<LessonData>>({
    id: "",
    title: "",
    description: "",
    points: 50,
    isAlphabet: false,
    slides: [],
    quiz: [],
    alphabetData: { letters: [], letterDetails: {} }
  });

  useEffect(() => {
    const saved = localStorage.getItem("quranmaster_curriculum_v2");
    if (saved) {
      try {
        const parsed: SectionData[] = JSON.parse(saved);
        const merged = parsed.map((s) => {
          const original = INITIAL_LEARNING_SECTIONS.find((o) => o.id === s.id);
          
          if (s.id === 'arabic' && original) {
            (['explorer', 'adventure', 'master'] as const).forEach(lvlKey => {
              const origLvl = original.levels[lvlKey];
              const savedLvl = s.levels[lvlKey];
              if (savedLvl && origLvl) {
                savedLvl.lessons = savedLvl.lessons.map(savedLsn => {
                  if (savedLsn.isAlphabet) {
                    savedLsn.description = "";
                    const origLsn = origLvl.lessons.find(l => l.id === savedLsn.id);
                    if (origLsn && origLsn.alphabetData && savedLsn.alphabetData) {
                      const updatedDetails = { ...savedLsn.alphabetData.letterDetails };
                      
                      Object.keys(updatedDetails).forEach(letterChar => {
                        const savedDetail = updatedDetails[letterChar];
                        const origDetail = origLsn.alphabetData?.letterDetails[letterChar];
                        if (origDetail && savedDetail) {
                          savedDetail.shapes = {
                            ...origDetail.shapes,
                            ...savedDetail.shapes,
                            isNonConnecting: origDetail.shapes.isNonConnecting
                          };
                          
                          const fields = [
                            'isolatedWord', 'isolatedTranslation', 'isolatedArabic', 'isolatedEmoji',
                            'initialWord', 'initialTranslation', 'initialArabic', 'initialEmoji',
                            'medialWord', 'medialTranslation', 'medialArabic', 'medialEmoji',
                            'finalWord', 'finalTranslation', 'finalArabic', 'finalEmoji'
                          ] as const;
                          fields.forEach(f => {
                            if (!savedDetail.shapes[f]) {
                              (savedDetail.shapes as any)[f] = origDetail.shapes[f];
                            }
                          });
                        }
                      });
                      
                      return {
                        ...savedLsn,
                        alphabetData: {
                          ...savedLsn.alphabetData,
                          letterDetails: updatedDetails
                        }
                      };
                    }
                  }
                  return savedLsn;
                });
              }
            });
          }
          
          return {
            ...s,
            icon: original ? original.icon : null,
          };
        });
        setSections(merged);
      } catch (err) {
        console.error(
          "Failed to load custom curriculum, resetting to defaults",
          err,
        );
        setSections(INITIAL_LEARNING_SECTIONS);
      }
    } else {
      setSections(INITIAL_LEARNING_SECTIONS);
    }
  }, []);

  const saveCurriculum = (updatedSections: SectionData[]) => {
    try {
      const serialized = updatedSections.map(({ icon, ...rest }) => rest);
      localStorage.setItem(
        "quranmaster_curriculum_v2",
        JSON.stringify(serialized),
      );
      setSections(updatedSections);
      showStatus("Curriculum saved to local database successfully!", "success");
    } catch (err) {
      console.error(err);
      showStatus("Error saving curriculum.", "error");
    }
  };

  const showStatus = (text: string, type: "success" | "error") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Reset curriculum to factory defaults
  const handleResetToDefaults = () => {
    if (
      confirm(
        "Are you sure you want to reset the curriculum? This will erase all custom lessons, slides, and quizzes.",
      )
    ) {
      localStorage.removeItem("quranmaster_curriculum_v2");
      setSections(INITIAL_LEARNING_SECTIONS);
      setSelectedLessonId(null);
      setIsCreatingNew(false);
      showStatus("Curriculum restored to original defaults.", "success");
    }
  };

  // Export curriculum JSON Backup
  const handleExportBackup = () => {
    const serialized = sections.map(({ icon, ...rest }) => rest);
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(serialized, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "quranmaster-curriculum-backup.json");
    dlAnchorElem.click();
  };

  // Import curriculum JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const merged = parsed.map((s) => {
              const original = INITIAL_LEARNING_SECTIONS.find(
                (o) => o.id === s.id,
              );
              return {
                ...s,
                icon: original ? original.icon : null,
              };
            });
            saveCurriculum(merged);
            setSelectedLessonId(null);
            setIsCreatingNew(false);
            showStatus("Backup imported successfully!", "success");
          } else {
            showStatus("Invalid backup file format.", "error");
          }
        } catch (err) {
          showStatus("Error parsing JSON backup file.", "error");
        }
      };
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeLevel = activeSection?.levels[activeLevelId];

  // Template to generate default alphabet letter structures easily
  const createDefaultLetterData = (char: string) => ({
    name: "New Letter",
    shapes: {
      isolated: char,
      initial: `${char}ـ`,
      medial: `ـ${char}ـ`,
      final: `ـ${char}`,
      exampleWord: "Example",
      exampleTranslation: "Translation",
      exampleArabic: char,
      illustrationEmoji: "📖",
      letterExplanation: "This letter connects standardly."
    },
    vowels: [
      {
        vowelName: "Fathah",
        vowelMark: "◌َ",
        sound: "a",
        letterApplied: `${char}َ`,
        exampleWord: "Example",
        exampleTranslation: "Translation",
        exampleArabic: `${char}َ`,
        illustrationEmoji: "🦁"
      },
      {
        vowelName: "Kasrah",
        vowelMark: "◌ِ",
        sound: "i",
        letterApplied: `${char}ِ`,
        exampleWord: "Example",
        exampleTranslation: "Translation",
        exampleArabic: `${char}ِ`,
        illustrationEmoji: "🏺"
      },
      {
        vowelName: "Dammah",
        vowelMark: "◌ُ",
        sound: "u",
        letterApplied: `${char}ُ`,
        exampleWord: "Example",
        exampleTranslation: "Translation",
        exampleArabic: `${char}ُ`,
        illustrationEmoji: "👂"
      }
    ]
  });

  // Set form when editing lesson
  const handleEditLessonSelect = (lesson: LessonData) => {
    setIsCreatingNew(false);
    setSelectedLessonId(lesson.id);
    setLessonForm({
      ...lesson,
      slides: lesson.slides || [],
      quiz: lesson.quiz || [],
      alphabetData: lesson.alphabetData || { letters: [], letterDetails: {} }
    });
    setEditorTab("details");
    if (lesson.isAlphabet && lesson.alphabetData && lesson.alphabetData.letters.length > 0) {
      setSelectedEditLetter(lesson.alphabetData.letters[0]);
    } else {
      setSelectedEditLetter("");
    }
    setSelectedEditVowelIdx(0);
  };

  // Initialize new lesson form details
  const handleCreateNewSelect = () => {
    setIsCreatingNew(true);
    setSelectedLessonId(null);
    setLessonForm({
      id: `${activeSectionId}_${activeLevelId}_l${(activeLevel?.lessons.length || 0) + 1}`,
      title: "New Lesson",
      description: "Master this beautiful lesson topic.",
      points: 50,
      isAlphabet: false,
      slides: [{ title: "Slide 1 Title", content: "Slide content text here." }],
      quiz: [
        {
          id: `q_new_${Date.now()}_1`,
          question: "First Practice Question?",
          options: ["Correct Choice", "Choice B", "Choice C", "Choice D"],
          correctAnswer: 0,
          explanation: "Explain why choice A is correct.",
        },
      ],
      alphabetData: {
        letters: ["أ"],
        letterDetails: {
          "أ": createDefaultLetterData("أ")
        }
      }
    });
    setEditorTab("details");
    setSelectedEditLetter("أ");
    setSelectedEditVowelIdx(0);
  };

  const handleFormChange = (key: keyof LessonData, val: any) => {
    setLessonForm((prev) => ({ ...prev, [key]: val }));
  };

  // Slides operations
  const handleAddSlide = () => {
    setLessonForm((prev) => ({
      ...prev,
      slides: [
        ...(prev.slides || []),
        { title: "New Slide Title", content: "Enter contents." },
      ],
    }));
  };

  const handleRemoveSlide = (idx: number) => {
    setLessonForm((prev) => ({
      ...prev,
      slides: (prev.slides || []).filter((_, i) => i !== idx),
    }));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    setLessonForm((prev) => {
      const slides = [...(prev.slides || [])];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= slides.length) return prev;
      const temp = slides[index];
      slides[index] = slides[targetIdx];
      slides[targetIdx] = temp;
      return { ...prev, slides };
    });
  };

  const handleSlideChange = (
    idx: number,
    key: keyof LessonSlide,
    val: string,
  ) => {
    setLessonForm((prev) => {
      const copy = [...(prev.slides || [])];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...prev, slides: copy };
    });
  };

  // Quiz operations
  const handleAddQuiz = () => {
    setLessonForm((prev) => ({
      ...prev,
      quiz: [
        ...(prev.quiz || []),
        {
          id: `q_new_${Date.now()}`,
          question: "Enter question text?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: 0,
          explanation: "Enter explanation.",
        },
      ],
    }));
  };

  const handleRemoveQuiz = (idx: number) => {
    setLessonForm((prev) => ({
      ...prev,
      quiz: (prev.quiz || []).filter((_, i) => i !== idx),
    }));
  };

  const handleMoveQuizQuestion = (index: number, direction: "up" | "down") => {
    setLessonForm((prev) => {
      const quiz = [...(prev.quiz || [])];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= quiz.length) return prev;
      const temp = quiz[index];
      quiz[index] = quiz[targetIdx];
      quiz[targetIdx] = temp;
      return { ...prev, quiz };
    });
  };

  const handleQuizChange = (idx: number, key: keyof QuizQuestion, val: any) => {
    setLessonForm((prev) => {
      const copy = [...(prev.quiz || [])];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...prev, quiz: copy };
    });
  };

  const handleQuizOptionChange = (qIdx: number, oIdx: number, val: string) => {
    setLessonForm((prev) => {
      const copy = [...(prev.quiz || [])];
      const opts = [...copy[qIdx].options];
      opts[oIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return { ...prev, quiz: copy };
    });
  };

  const handleAddQuizOption = (qIdx: number) => {
    setLessonForm((prev) => {
      const copy = [...(prev.quiz || [])];
      const opts = [...copy[qIdx].options, `New Option ${copy[qIdx].options.length + 1}`];
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return { ...prev, quiz: copy };
    });
  };

  const handleRemoveQuizOption = (qIdx: number, oIdx: number) => {
    setLessonForm((prev) => {
      const copy = [...(prev.quiz || [])];
      if (copy[qIdx].options.length <= 2) {
        alert("A quiz question must have at least 2 options!");
        return prev;
      }
      const opts = copy[qIdx].options.filter((_, i) => i !== oIdx);
      let corrAns = copy[qIdx].correctAnswer;
      if (corrAns === oIdx) {
        corrAns = 0;
      } else if (corrAns > oIdx) {
        corrAns = corrAns - 1;
      }
      copy[qIdx] = { ...copy[qIdx], options: opts, correctAnswer: corrAns };
      return { ...prev, quiz: copy };
    });
  };

  // Alphabet letter operations
  const handleAddLetter = () => {
    const char = prompt("Enter the Arabic letter character (e.g. ب):");
    if (!char) return;
    const trimmed = char.trim();
    if (!trimmed) return;

    setLessonForm((prev) => {
      const alphabet = prev.alphabetData || { letters: [], letterDetails: {} };
      if (alphabet.letters.includes(trimmed)) {
        alert("This letter already exists in the lesson!");
        return prev;
      }
      const updatedLetters = [...alphabet.letters, trimmed];
      const updatedDetails = {
        ...alphabet.letterDetails,
        [trimmed]: createDefaultLetterData(trimmed),
      };
      setSelectedEditLetter(trimmed);
      return {
        ...prev,
        alphabetData: {
          letters: updatedLetters,
          letterDetails: updatedDetails,
        },
      };
    });
  };

  const handleDeleteLetterChar = (char: string) => {
    if (!confirm(`Are you sure you want to remove the letter "${char}"?`)) return;
    setLessonForm((prev) => {
      const alphabet = prev.alphabetData || { letters: [], letterDetails: {} };
      const updatedLetters = alphabet.letters.filter((l) => l !== char);
      const updatedDetails = { ...alphabet.letterDetails };
      delete updatedDetails[char];

      if (selectedEditLetter === char) {
        setSelectedEditLetter(updatedLetters[0] || "");
      }

      return {
        ...prev,
        alphabetData: {
          letters: updatedLetters,
          letterDetails: updatedDetails,
        },
      };
    });
  };

  const handleLetterFieldChange = (char: string, key: "name" | "explanation", val: string) => {
    setLessonForm((prev) => {
      const alphabet = prev.alphabetData || { letters: [], letterDetails: {} };
      const details = alphabet.letterDetails[char];
      if (!details) return prev;

      let updatedDetails = { ...alphabet.letterDetails };
      if (key === "explanation") {
        updatedDetails[char] = {
          ...details,
          shapes: { ...details.shapes, letterExplanation: val }
        };
      } else {
        updatedDetails[char] = {
          ...details,
          name: val
        };
      }

      return {
        ...prev,
        alphabetData: {
          ...alphabet,
          letterDetails: updatedDetails,
        },
      };
    });
  };

  const handleLetterShapeFieldChange = (
    char: string,
    key: string,
    val: any
  ) => {
    setLessonForm((prev) => {
      const alphabet = prev.alphabetData || { letters: [], letterDetails: {} };
      const details = alphabet.letterDetails[char];
      if (!details) return prev;

      const newShapes = {
        ...details.shapes,
        [key]: val,
      };

      // For non-connecting letters, initial shape matches isolated, and medial shape matches final
      if (key === "isNonConnecting" && val === true) {
        newShapes.initial = newShapes.isolated;
        newShapes.medial = newShapes.final;
      } else if (newShapes.isNonConnecting) {
        if (key === "isolated") {
          newShapes.initial = val;
        } else if (key === "final") {
          newShapes.medial = val;
        }
      }

      const updatedDetails = {
        ...alphabet.letterDetails,
        [char]: {
          ...details,
          shapes: newShapes,
        },
      };

      return {
        ...prev,
        alphabetData: {
          ...alphabet,
          letterDetails: updatedDetails,
        },
      };
    });
  };

  const handleLetterVowelFieldChange = (
    char: string,
    vowelIdx: number,
    key: string,
    val: string
  ) => {
    setLessonForm((prev) => {
      const alphabet = prev.alphabetData || { letters: [], letterDetails: {} };
      const details = alphabet.letterDetails[char];
      if (!details) return prev;

      const updatedVowels = [...details.vowels];
      updatedVowels[vowelIdx] = {
        ...updatedVowels[vowelIdx],
        [key]: val,
      };

      const updatedDetails = {
        ...alphabet.letterDetails,
        [char]: {
          ...details,
          vowels: updatedVowels,
        },
      };

      return {
        ...prev,
        alphabetData: {
          ...alphabet,
          letterDetails: updatedDetails,
        },
      };
    });
  };


  // Save or Update Lesson in Curriculum
  const handleSaveLessonForm = () => {
    if (!lessonForm.id || !lessonForm.title) {
      showStatus("ID and Title are mandatory fields!", "error");
      return;
    }

    const updatedSections = sections.map((s) => {
      if (s.id !== activeSectionId) return s;

      const levelObj = s.levels[activeLevelId];
      let newLessons = [...levelObj.lessons];

      if (isCreatingNew) {
        // Validate ID uniqueness
        if (newLessons.some((l) => l.id === lessonForm.id)) {
          showStatus(
            "Lesson ID must be unique! This ID already exists.",
            "error",
          );
          return s;
        }
        newLessons.push(lessonForm as LessonData);
      } else {
        // Edit existing lesson
        newLessons = newLessons.map((l) =>
          l.id === selectedLessonId ? (lessonForm as LessonData) : l,
        );
      }

      return {
        ...s,
        levels: {
          ...s.levels,
          [activeLevelId]: {
            ...levelObj,
            lessons: newLessons,
          },
        },
      };
    });

    saveCurriculum(updatedSections);
    setSelectedLessonId(lessonForm.id);
    setIsCreatingNew(false);
  };

  // Remove Lesson
  const handleDeleteLesson = (lessonId: string) => {
    if (
      !confirm(
        "Are you absolutely sure you want to delete this lesson? This cannot be undone.",
      )
    )
      return;

    const updatedSections = sections.map((s) => {
      if (s.id !== activeSectionId) return s;

      const levelObj = s.levels[activeLevelId];
      const newLessons = levelObj.lessons.filter((l) => l.id !== lessonId);

      return {
        ...s,
        levels: {
          ...s.levels,
          [activeLevelId]: {
            ...levelObj,
            lessons: newLessons,
          },
        },
      };
    });

    saveCurriculum(updatedSections);
    setSelectedLessonId(null);
    setIsCreatingNew(false);
    showStatus("Lesson deleted.", "success");
  };

  // Reorder lessons
  const handleMoveLesson = (index: number, direction: "up" | "down") => {
    if (!activeLevel) return;
    const list = [...activeLevel.lessons];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedSections = sections.map((s) => {
      if (s.id !== activeSectionId) return s;
      return {
        ...s,
        levels: {
          ...s.levels,
          [activeLevelId]: {
            ...s.levels[activeLevelId],
            lessons: list,
          },
        },
      };
    });

    saveCurriculum(updatedSections);
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerWrapper}>
        {/* Navigation Breadcrumb & Large Header */}
        <div className={styles.headerRow}>
          <div>
            <Link href="/learn" className={styles.backLink}>
              <span>←</span> <span>Back to Self-Paced Path</span>
            </Link>

            <h1 className={styles.title}>Curriculum Architect</h1>
            <p className={styles.subtitle}>
              Draft curriculum lessons, sequence slide pages, and compile
              interactive multiple-choice questions with generous controls.
            </p>
          </div>

          {/* Quick Database Backup Triggers */}
          <div className={styles.btnRow}>
            <button onClick={handleExportBackup} className={styles.actionBtn}>
              💾 Export JSON Backup
            </button>

            <label className={styles.actionBtn}>
              📤 Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className={styles.hiddenInput}
              />
            </label>

            <button onClick={handleResetToDefaults} className={styles.resetBtn}>
              🔄 Reset to Defaults
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${styles.statusToast} ${statusMessage.type === "success" ? styles.toastSuccess : styles.toastError}`}
            >
              <span className="text-xl">
                {statusMessage.type === "success" ? "✓" : "⚠"}
              </span>
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Layout Columns (Spacious margins & gap spacing) */}
        <div className={styles.workspaceGrid}>
          {/* LEFT TWO-TIER SIDEBAR */}
          <div className={styles.sidebarsWrapper}>
            {/* Primary Sidebar - Course Subject Icons */}
            <div className={styles.primarySidebar}>
              {sections.map((s) => {
                let subjectIcon = "📚";
                if (s.id === "arabic") subjectIcon = "ع";
                else if (s.id === "fiqh") subjectIcon = "⚖️";
                else if (s.id === "aqidah") subjectIcon = "🕌";
                else if (s.id === "qasas") subjectIcon = "📖";
                else if (s.id === "sirah") subjectIcon = "📜";

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (activeSectionId === s.id) {
                        setIsSidebarOpen(!isSidebarOpen);
                      } else {
                        setActiveSectionId(s.id);
                        setSelectedLessonId(null);
                        setIsCreatingNew(false);
                        setIsSidebarOpen(true);
                      }
                    }}
                    className={`${styles.primaryNavItem} ${activeSectionId === s.id ? styles.primaryNavItemActive : ""}`}
                    title={`${s.title} (${s.arabicTitle})`}
                  >
                    <span className="font-bold">{subjectIcon}</span>
                    <span className="text-[10px] font-bold mt-1 scale-90 capitalize opacity-90">{s.id.slice(0, 3)}</span>
                  </button>
                );
              })}

              {/* Sidebar Collapse Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={styles.primaryNavItem}
                style={{ marginTop: "auto" }}
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <span>{isSidebarOpen ? "◀" : "▶"}</span>
              </button>
            </div>

            {/* Secondary Sidebar - Tiers & Scrollable search lessons */}
            <div className={`${styles.secondarySidebar} ${isSidebarOpen ? styles.secondarySidebarOpen : ""}`}>
              <div className={styles.secondarySidebarContent}>
                {/* Header */}
                <div>
                  <h3 className="font-extrabold text-base text-amber-600 capitalize">
                    {activeSection?.title || activeSectionId} Curriculum
                  </h3>
                  <p className="text-xs text-slate-400 font-medium font-sans">
                    Pathway Tiers & Lessons
                  </p>
                </div>

                {/* Tiers Tabs Selector */}
                <div className={styles.tierSelectorRow}>
                  {(["explorer", "adventure", "master"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setActiveLevelId(lvl);
                        setSelectedLessonId(null);
                        setIsCreatingNew(false);
                      }}
                      className={`${styles.tierTabBtn} ${activeLevelId === lvl ? styles.tierTabBtnActive : ""}`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Lesson Index Search bar */}
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search lessons..."
                    value={lessonSearchQuery}
                    onChange={(e) => setLessonSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {lessonSearchQuery && (
                    <button
                      onClick={() => setLessonSearchQuery("")}
                      className={styles.searchClearBtn}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Lessons Header */}
                <div className={styles.listHeaderRow}>
                  <span className={styles.sidebarLabel}>Lessons</span>
                  <button
                    onClick={handleCreateNewSelect}
                    className={styles.addBtn}
                  >
                    + Add New
                  </button>
                </div>

                {/* Scrollable Lessons List */}
                <div className={styles.scrollableLessons}>
                  {(() => {
                    const listLessons = activeLevel?.lessons || [];
                    const filtered = listLessons.filter((l) =>
                      l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
                      l.id.toLowerCase().includes(lessonSearchQuery.toLowerCase())
                    );

                    return (
                      <>
                        {filtered.map((lesson) => {
                          const originalIdx = listLessons.findIndex((l) => l.id === lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className={`${styles.lessonIndexItem} ${selectedLessonId === lesson.id ? styles.lessonIndexItemActive : ""}`}
                            >
                              <button
                                onClick={() => handleEditLessonSelect(lesson)}
                                className={styles.lessonSelectTrigger}
                              >
                                {lesson.title}
                              </button>

                              {/* Reordering indicators */}
                              <div className={styles.reorderBtnGroup}>
                                <button
                                  onClick={() => handleMoveLesson(originalIdx, "up")}
                                  disabled={originalIdx === 0}
                                  className={styles.reorderBtn}
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => handleMoveLesson(originalIdx, "down")}
                                  disabled={originalIdx === listLessons.length - 1}
                                  className={styles.reorderBtn}
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className={`${styles.reorderBtn} text-red-500`}
                                  title="Delete Lesson"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {filtered.length === 0 && (
                          <span className="text-sm text-slate-400 italic p-3 text-center w-full block">
                            {lessonSearchQuery ? "No matching lessons." : "No lessons in this tier."}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Spacious interactive editing card workspace */}
          <div className={styles.editorContentArea}>
            <AnimatePresence mode="wait">
              {selectedLessonId || isCreatingNew ? (
                <motion.div
                  key={selectedLessonId || "new"}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 25 }}
                  className={styles.editorCard}
                >
                  {/* Editor Header Card */}
                  <div className={styles.editorHeader}>
                    <div>
                      <span className={styles.editorSubtitle}>
                        {isCreatingNew
                          ? "⚡ Drafting New Lesson Parameters"
                          : "⚙️ Editing Selected Lesson"}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black mt-1">
                        {lessonForm.title || "Untitled Lesson"}
                      </h2>
                    </div>

                    <button onClick={handleSaveLessonForm} className={styles.saveBtn}>
                      ✓ Save Lesson Changes
                    </button>
                  </div>

                  {/* Editor Card Sub-Tabs */}
                  <div className={styles.editorTabs}>
                    <button
                      type="button"
                      onClick={() => setEditorTab("details")}
                      className={`${styles.tabBtn} ${editorTab === "details" ? styles.tabBtnActive : ""}`}
                    >
                      📝 Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("content")}
                      className={`${styles.tabBtn} ${editorTab === "content" ? styles.tabBtnActive : ""}`}
                    >
                      📖 {lessonForm.isAlphabet ? "Letters & Shapes" : "Lecture Slides"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("quiz")}
                      className={`${styles.tabBtn} ${editorTab === "quiz" ? styles.tabBtnActive : ""}`}
                    >
                      🎯 Practice Quiz
                    </button>
                  </div>

                  {/* DETAILS TAB */}
                  {editorTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Core details spacious fields */}
                      <div className={styles.fieldGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            Lesson Unique ID
                          </label>
                          <input
                            type="text"
                            disabled={!isCreatingNew}
                            value={lessonForm.id}
                            onChange={(e) => handleFormChange("id", e.target.value)}
                            className={styles.textInput}
                            placeholder="e.g. ar_exp_l1"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            Lesson Main Title Heading
                          </label>
                          <input
                            type="text"
                            value={lessonForm.title}
                            onChange={(e) =>
                              handleFormChange("title", e.target.value)
                            }
                            className={styles.textInput}
                            placeholder="Enter lesson title"
                          />
                        </div>
                      </div>

                      {/* Description summary and XP reward */}
                      <div className={styles.fieldGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            Brief Summary Description
                          </label>
                          <input
                            type="text"
                            value={lessonForm.description}
                            onChange={(e) =>
                              handleFormChange("description", e.target.value)
                            }
                            className={styles.textInput}
                            placeholder="Describe what the student will learn..."
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            XP points reward
                          </label>
                          <input
                            type="number"
                            value={lessonForm.points}
                            onChange={(e) =>
                              handleFormChange(
                                "points",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className={styles.textInput}
                            placeholder="e.g. 50"
                          />
                        </div>
                      </div>

                      {/* Lesson Type selector */}
                      <div className={styles.formGroup} style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                        <label className={styles.formLabel}>
                          Lesson Format Type
                        </label>
                        <div className={styles.typeSelectWrapper}>
                          <label className={styles.typeRadioLabel}>
                            <input
                              type="radio"
                              name="lessonType"
                              checked={!lessonForm.isAlphabet}
                              onChange={() => handleFormChange("isAlphabet", false)}
                              className={styles.radioInput}
                            />
                            <span>Standard Lesson (Slides & Lecture)</span>
                          </label>
                          <label className={styles.typeRadioLabel}>
                            <input
                              type="radio"
                              name="lessonType"
                              checked={!!lessonForm.isAlphabet}
                              onChange={() => handleFormChange("isAlphabet", true)}
                              className={styles.radioInput}
                            />
                            <span>Alphabet Lesson (Shapes, Vowels & Harakat)</span>
                          </label>
                        </div>
                        <p className={styles.sectionSubtitle}>
                          Standard lessons use sequential reading slides. Alphabet lessons use an interactive grid showing letter connection forms and vowelled sample words.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* CONTENT TAB - STANDARD LESSON */}
                  {editorTab === "content" && !lessonForm.isAlphabet && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.sectionDivider}
                      style={{ borderTop: "none", paddingTop: 0 }}
                    >
                      <div className={styles.sectionHeaderRow}>
                        <div>
                          <h3 className={styles.sectionTitle}>Lecture Slides</h3>
                          <p className={styles.sectionSubtitle}>
                            Design sequential slide pages for reading.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSlide}
                          className={`${styles.outlineBtn} ${styles.addSlideBtn}`}
                        >
                          + Add Lecture Slide
                        </button>
                      </div>

                      <div className={styles.listContainer}>
                        {lessonForm.slides?.map((slide, idx) => (
                          <div key={idx} className={styles.slideCard}>
                            <div className={styles.itemHeaderRow}>
                              <span className={styles.slideIndexBadge}>
                                Slide #{idx + 1}
                              </span>

                              <div className={styles.itemControls}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSlide(idx, "up")}
                                  className={styles.iconControlBtn}
                                  title="Move Slide Up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (lessonForm.slides?.length || 0) - 1}
                                  onClick={() => handleMoveSlide(idx, "down")}
                                  className={styles.iconControlBtn}
                                  title="Move Slide Down"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlide(idx)}
                                  className={`${styles.iconControlBtn} ${styles.dangerIconBtn}`}
                                  title="Remove Slide"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            <div className={styles.fieldGrid}>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                  Slide Main Title
                                </label>
                                <input
                                  type="text"
                                  value={slide.title}
                                  onChange={(e) =>
                                    handleSlideChange(
                                      idx,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.textInput}
                                />
                              </div>

                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                  Arabic Calligraphy Text (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={slide.arabic || ""}
                                  onChange={(e) =>
                                    handleSlideChange(
                                      idx,
                                      "arabic",
                                      e.target.value,
                                    )
                                  }
                                  className={`${styles.textInput} font-arabic`}
                                  style={{ textAlign: "right" }}
                                />
                              </div>
                            </div>

                            <div className={styles.fieldGrid}>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                  Slide Description Content Body
                                </label>
                                <textarea
                                  rows={4}
                                  value={slide.content}
                                  onChange={(e) =>
                                    handleSlideChange(
                                      idx,
                                      "content",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.textInput}
                                  style={{ resize: "vertical" }}
                                />
                              </div>

                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                  English Phonics Transliteration (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={slide.transliteration || ""}
                                  onChange={(e) =>
                                    handleSlideChange(
                                      idx,
                                      "transliteration",
                                      e.target.value,
                                    )
                                  }
                                  className={styles.textInput}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!lessonForm.slides ||
                          lessonForm.slides.length === 0) && (
                          <div className={styles.emptyListCard}>
                            No slides created yet. Add a lecture slide page above
                            to begin draft lectures.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* CONTENT TAB - ALPHABET LESSON */}
                  {editorTab === "content" && !!lessonForm.isAlphabet && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.alphabetConfigContainer}
                    >
                      <div>
                        <h3 className={styles.sectionTitle}>Alphabet Letters Configuration</h3>
                        <p className={styles.sectionSubtitle}>
                          Select an Arabic letter tab to modify its connection shapes and vowels, or add a new letter.
                        </p>
                      </div>

                      {/* Letters Tab Bar */}
                      <div className={styles.letterSelectorBar}>
                        {lessonForm.alphabetData?.letters.map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => setSelectedEditLetter(char)}
                            className={`${styles.letterTabBtn} ${selectedEditLetter === char ? styles.letterTabBtnActive : ""}`}
                          >
                            {char}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddLetter}
                          className={styles.addLetterBtn}
                        >
                          + Add Letter
                        </button>
                      </div>

                      {/* Active Letter Detail Editor Panel */}
                      {selectedEditLetter && lessonForm.alphabetData?.letterDetails[selectedEditLetter] ? (
                        (() => {
                          const letterObj = lessonForm.alphabetData.letterDetails[selectedEditLetter];
                          return (
                            <div className={styles.letterDetailsPanel}>
                              {/* Panel Header */}
                              <div className={styles.letterDetailsHeader}>
                                <div>
                                  <span className={styles.editorSubtitle}>Selected Letter</span>
                                  <h4 className="text-xl font-extrabold flex items-center gap-2">
                                    {letterObj.name} ({selectedEditLetter})
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLetterChar(selectedEditLetter)}
                                  className={`${styles.outlineBtn} text-red-500 border-red-200 hover:bg-red-50`}
                                >
                                  ✕ Remove Letter
                                </button>
                              </div>

                              {/* Character settings name & explanation */}
                              <div className={styles.fieldGrid}>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Letter Name (e.g. Alif)</label>
                                  <input
                                    type="text"
                                    value={letterObj.name}
                                    onChange={(e) => handleLetterFieldChange(selectedEditLetter, "name", e.target.value)}
                                    className={styles.textInput}
                                  />
                                </div>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Usage Rule Explanation</label>
                                  <input
                                    type="text"
                                    value={letterObj.shapes.letterExplanation}
                                    onChange={(e) => handleLetterFieldChange(selectedEditLetter, "explanation", e.target.value)}
                                    className={styles.textInput}
                                    placeholder="e.g. Alif does not connect to succeeding letters..."
                                  />
                                </div>
                              </div>

                              {/* Non-Connecting Letter Toggle */}
                              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <input
                                  type="checkbox"
                                  id="nonConnectingCheckbox"
                                  checked={!!letterObj.shapes.isNonConnecting}
                                  onChange={(e) => {
                                    handleLetterShapeFieldChange(selectedEditLetter, "isNonConnecting", e.target.checked);
                                    if (e.target.checked && (selectedEditShapeType === "initial" || selectedEditShapeType === "medial")) {
                                      setSelectedEditShapeType("main");
                                    }
                                  }}
                                  className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                                />
                                <label htmlFor="nonConnectingCheckbox" className="text-xs font-black text-amber-800 dark:text-amber-300 cursor-pointer select-none">
                                  Selfish / Non-Connecting Letter (Only has Isolated & Final shapes, e.g. Alif, Dal, Ra, Waw)
                                </label>
                              </div>
                              
                              {/* Connections & Shapes */}
                              <div>
                                <h5 className="font-bold text-sm text-amber-600 mb-4">1. Connection Shapes</h5>
                                <div className={letterObj.shapes.isNonConnecting ? "grid grid-cols-2 gap-4" : "grid grid-cols-2 md:grid-cols-4 gap-4"}>
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Isolated Form</label>
                                    <input
                                      type="text"
                                      value={letterObj.shapes.isolated}
                                      onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "isolated", e.target.value)}
                                      className={`${styles.textInput} text-center font-arabic text-xl`}
                                    />
                                  </div>
                                  {!letterObj.shapes.isNonConnecting && (
                                    <>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Initial Form</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.initial}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "initial", e.target.value)}
                                          className={`${styles.textInput} text-center font-arabic text-xl`}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Medial Form</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.medial}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "medial", e.target.value)}
                                          className={`${styles.textInput} text-center font-arabic text-xl`}
                                        />
                                      </div>
                                    </>
                                  )}
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Final Form</label>
                                    <input
                                      type="text"
                                      value={letterObj.shapes.final}
                                      onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "final", e.target.value)}
                                      className={`${styles.textInput} text-center font-arabic text-xl`}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Main Shape Vocabulary Example with tabs */}
                              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                  <h5 className="font-bold text-sm text-amber-600">2. Vocabulary Examples (by Connection Form)</h5>
                                  
                                  {/* Sub shape tabs */}
                                  <div className={styles.vowelTabs}>
                                    {(["main", "isolated", "initial", "medial", "final"] as const).map((shapeType) => {
                                      if (letterObj.shapes.isNonConnecting && (shapeType === "initial" || shapeType === "medial")) {
                                        return null;
                                      }
                                      return (
                                        <button
                                          key={shapeType}
                                          type="button"
                                          onClick={() => setSelectedEditShapeType(shapeType)}
                                          className={`${styles.vowelTabBtn} ${selectedEditShapeType === shapeType ? styles.vowelTabBtnActive : ""}`}
                                        >
                                          {shapeType === "main" ? "General Fallback" : `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/20 border border-amber-100/10">
                                  {selectedEditShapeType === "main" ? (
                                    <>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Arabic Word</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.exampleArabic || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "exampleArabic", e.target.value)}
                                          className={`${styles.textInput} font-arabic text-right`}
                                          placeholder="e.g. أَرْنَب"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Transliteration</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.exampleWord || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "exampleWord", e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. Arnab"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Translation</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.exampleTranslation || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "exampleTranslation", e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. Rabbit"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Illustration Emoji</label>
                                        <input
                                          type="text"
                                          value={letterObj.shapes.illustrationEmoji || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, "illustrationEmoji", e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. 🐇"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>{selectedEditShapeType.charAt(0).toUpperCase() + selectedEditShapeType.slice(1)} Arabic Word</label>
                                        <input
                                          type="text"
                                          value={(letterObj.shapes as any)[`${selectedEditShapeType}Arabic`] || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, `${selectedEditShapeType}Arabic`, e.target.value)}
                                          className={`${styles.textInput} font-arabic text-right`}
                                          placeholder="e.g. Arabic word"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>{selectedEditShapeType.charAt(0).toUpperCase() + selectedEditShapeType.slice(1)} Transliteration</label>
                                        <input
                                          type="text"
                                          value={(letterObj.shapes as any)[`${selectedEditShapeType}Word`] || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, `${selectedEditShapeType}Word`, e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. transliterated word"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>{selectedEditShapeType.charAt(0).toUpperCase() + selectedEditShapeType.slice(1)} Translation</label>
                                        <input
                                          type="text"
                                          value={(letterObj.shapes as any)[`${selectedEditShapeType}Translation`] || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, `${selectedEditShapeType}Translation`, e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. translation"
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>{selectedEditShapeType.charAt(0).toUpperCase() + selectedEditShapeType.slice(1)} Emoji</label>
                                        <input
                                          type="text"
                                          value={(letterObj.shapes as any)[`${selectedEditShapeType}Emoji`] || ""}
                                          onChange={(e) => handleLetterShapeFieldChange(selectedEditLetter, `${selectedEditShapeType}Emoji`, e.target.value)}
                                          className={styles.textInput}
                                          placeholder="e.g. emoji illustration"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Harakat & Vowels Section */}
                              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                  <h5 className="font-bold text-sm text-amber-600">3. Vowels & Harakat Examples</h5>
                                  {/* Sub Vowels Tab Bar */}
                                  <div className={styles.vowelTabs}>
                                    {letterObj.vowels.map((v, vIdx) => (
                                      <button
                                        key={v.vowelName}
                                        type="button"
                                        onClick={() => setSelectedEditVowelIdx(vIdx)}
                                        className={`${styles.vowelTabBtn} ${selectedEditVowelIdx === vIdx ? styles.vowelTabBtnActive : ""}`}
                                      >
                                        {v.vowelName} ({v.vowelMark})
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Active Vowel Details Form */}
                                {letterObj.vowels[selectedEditVowelIdx] && (
                                  <div className={styles.vowelEditorContent}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Sound Pronounced (e.g. "ba")</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].sound}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "sound", e.target.value)}
                                          className={styles.textInput}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Letter with Vowel Applied (e.g. بَ)</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].letterApplied}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "letterApplied", e.target.value)}
                                          className={`${styles.textInput} font-arabic text-center`}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Vowel Mark Name</label>
                                        <input
                                          type="text"
                                          disabled
                                          value={letterObj.vowels[selectedEditVowelIdx].vowelName}
                                          className={styles.textInput}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Example Arabic Word</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].exampleArabic}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "exampleArabic", e.target.value)}
                                          className={`${styles.textInput} font-arabic text-right`}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Example Transliteration</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].exampleWord}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "exampleWord", e.target.value)}
                                          className={styles.textInput}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Example Translation</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].exampleTranslation}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "exampleTranslation", e.target.value)}
                                          className={styles.textInput}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Illustration Emoji</label>
                                        <input
                                          type="text"
                                          value={letterObj.vowels[selectedEditVowelIdx].illustrationEmoji}
                                          onChange={(e) => handleLetterVowelFieldChange(selectedEditLetter, selectedEditVowelIdx, "illustrationEmoji", e.target.value)}
                                          className={styles.textInput}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className={styles.emptyListCard}>
                          No letters defined for this alphabet lesson. Add a letter above to get started.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* INTERACTIVE PRACTICE QUIZZES SECTION */}
                  {editorTab === "quiz" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.sectionDivider}
                      style={{ borderTop: "none", paddingTop: 0 }}
                    >
                      <div className={styles.sectionHeaderRow}>
                        <div>
                          <h3 className={styles.sectionTitle}>
                            Interactive Practice Quizzes
                          </h3>
                          <p className={styles.sectionSubtitle}>
                            Formulate checking questions at the end of the lesson. Each question can have 2 to 6 choices.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddQuiz}
                          className={`${styles.outlineBtn} ${styles.addQuestionBtn}`}
                        >
                          + Add Practice Question
                        </button>
                      </div>

                      <div className={styles.listContainer}>
                        {lessonForm.quiz?.map((q, qIdx) => (
                          <div key={q.id || qIdx} className={styles.slideCard}>
                            <div className={styles.itemHeaderRow}>
                              <span className={styles.questionIndexBadge}>
                                Question #{qIdx + 1}
                              </span>

                              <div className={styles.itemControls}>
                                <button
                                  type="button"
                                  disabled={qIdx === 0}
                                  onClick={() => handleMoveQuizQuestion(qIdx, "up")}
                                  className={styles.iconControlBtn}
                                  title="Move Question Up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={qIdx === (lessonForm.quiz?.length || 0) - 1}
                                  onClick={() => handleMoveQuizQuestion(qIdx, "down")}
                                  className={styles.iconControlBtn}
                                  title="Move Question Down"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuiz(qIdx)}
                                  className={`${styles.iconControlBtn} ${styles.dangerIconBtn}`}
                                  title="Remove Question"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>
                                Question Query Text
                              </label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) =>
                                  handleQuizChange(
                                    qIdx,
                                    "question",
                                    e.target.value,
                                  )
                                }
                                className={styles.textInput}
                              />
                            </div>

                            {/* Options grid with dynamic choices */}
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <label className={styles.formLabel}>Choices Options</label>
                                {q.options.length < 6 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddQuizOption(qIdx)}
                                    className={styles.addOptionBtn}
                                  >
                                    + Add Option
                                  </button>
                                )}
                              </div>

                              <div className={styles.optionsGrid}>
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`${styles.optionWrapper} ${q.correctAnswer === oIdx ? styles.optionWrapperCorrect : ""}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct_${qIdx}`}
                                      checked={q.correctAnswer === oIdx}
                                      onChange={() =>
                                        handleQuizChange(
                                          qIdx,
                                          "correctAnswer",
                                          oIdx,
                                        )
                                      }
                                      className={styles.radioInput}
                                      title="Mark as correct choice"
                                    />
                                    <div className={styles.optionInputCol}>
                                      <div className="flex items-center justify-between">
                                        <span className={styles.optionLabel}>
                                          Choice Option {oIdx + 1}
                                        </span>
                                        {q.options.length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveQuizOption(qIdx, oIdx)}
                                            className={styles.removeOptionBtn}
                                            title="Delete Choice"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) =>
                                          handleQuizOptionChange(
                                            qIdx,
                                            oIdx,
                                            e.target.value,
                                          )
                                        }
                                        className={styles.optionTextInput}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>
                                Correct Choice rationale explanation
                              </label>
                              <input
                                type="text"
                                value={q.explanation}
                                onChange={(e) =>
                                  handleQuizChange(
                                    qIdx,
                                    "explanation",
                                    e.target.value,
                                  )
                                }
                                className={styles.textInput}
                                placeholder="Explain to the student why this selection is correct..."
                              />
                            </div>
                          </div>
                        ))}

                        {(!lessonForm.quiz || lessonForm.quiz.length === 0) && (
                          <div className={styles.emptyListCard}>
                            No quiz questions created yet. Add a multiple-choice
                            practice query above.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Empty state dashboard */
                <div className={styles.emptyStateCard}>
                  <div className={styles.emptyStateIcon}>🗂️</div>
                  <h3 className={styles.sectionTitle}>No Lesson Selected</h3>
                  <p className={styles.subtitle} style={{ maxWidth: "320px" }}>
                    Select an existing course lesson from the sidebar pathway
                    indices, or click **"+ Add New"** to model a fully
                    customized curriculum lesson from scratch.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

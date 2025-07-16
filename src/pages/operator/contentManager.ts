// src/utils/contentManager.ts

/**
 * System zarządzania treściami edukacyjnymi dla POLSKIEGO LICEUM OGÓLNOKSZTAŁCĄCEGO
 * 
 * KONTEKST:
 * - System przeznaczony dla uczniów liceum przygotowujących się do matury
 * - Struktura oparta na polskim systemie edukacji (klasy 1-4 liceum)
 * - Przedmioty zgodne z podstawą programową MEN
 * 
 * STRUKTURA KLAS:
 * - Każda "klasa" w systemie to kombinacja: przedmiot + poziom + rok nauki
 * - Przykład: "Matematyka rozszerzona - klasa 2"
 * - Poziomy: podstawowy (obowiązkowy) i rozszerzony (dla chętnych)
 * 
 * PRZEDMIOTY MATURALNE:
 * - Obowiązkowe: polski, matematyka, język obcy
 * - Do wyboru: biologia, chemia, fizyka, geografia, historia, WOS, informatyka
 * - Każdy przedmiot może być na poziomie podstawowym lub rozszerzonym
 * 
 * ORGANIZACJA (zgodna ze strukturą bazy danych):
 * - Klasa (np. "Matematyka podstawowa - klasa 1")
 *   └── Lekcje (pogrupowane przez pole 'topic' które pełni rolę działu)
 *       └── Artykuły (teoria) + Zadania (ćwiczenia)
 * 
 * Uwaga: "Działy" nie są osobną tabelą w bazie, tylko wartością pola 'topic' w tabeli lessons
 * 
 * SYSTEM MOTYWACYJNY:
 * - XP (punkty doświadczenia) za ukończone zadania
 * - Odznaki za osiągnięcia (np. ukończenie całego działu)
 * - Śledzenie postępów w przygotowaniu do matury
 */

import { supabaseClient } from "@/utility";

// Typy dla odpowiedzi z Supabase
interface ClassLessonWithRelations {
  lesson_id: string;
  lessons: {
    id: string;
    title: string;
    description: string | null;
    author_id: string;
    subject: string | null;
    education_level: string | null;
    grade: string | null;
    topic: string | null;
    created_at: string;
    articles: Array<{
      id: string;
      title: string;
      content: string;
      sort_order: number;
    }>;
    tasks: Array<{
      id: string;
      type: string;
      question_text: string;
      options: any;
      correct_answer: string;
      explanation: string | null;
      xp_reward: number;
      article_id: string | null;
    }>;
  };
}

// Rozszerzone typy danych - zgodne z istniejącą bazą danych
export interface ContentExport {
  version: string;
  exportedAt: string;
  metadata: {
    description?: string;
    targetAudience?: string;
  };
  // Struktura: Klasy -> Lekcje (przez class_lessons)
  // Klasa może reprezentować: przedmiot + poziom + rok
  classes: ClassExport[];
  badges?: BadgeExport[];
}

export interface ClassExport {
  name: string; // np. "Matematyka podstawowa - klasa 1"
  grade: string; // "1", "2", "3", "4"
  education_year: number; // 9999 dla poziomów edukacyjnych
  description?: string; // opcjonalne metadane
  lessons: LessonExport[]; // lekcje przypisane do tej klasy
}

export interface SectionExport {
  name: string; // np. "Funkcje", "Geometria płaska"
  description?: string;
  sortOrder: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  lessons: LessonExport[];
}

export interface LessonExport {
  title: string;
  description?: string;
  subject?: string; // nullable w bazie
  education_level?: string; // nullable w bazie
  grade?: string; // nullable w bazie
  topic?: string; // nullable w bazie
  estimatedTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  sequenceNumber?: number;
  articles: ArticleExport[];
  tasks: TaskExport[];
  totalXP?: number;
  passingScore?: number;
}

export interface ArticleExport {
  title: string; // Wymagane w bazie danych
  content: string;
  sort_order: number;
  contentType?: "theory" | "example" | "summary" | "tips";
  readingTime?: number;
}

export interface TaskExport {
  type: "single_choice" | "multiple_choice" | "true_false" | "open_question";
  question_text: string;
  options?: any; // JSONB w bazie
  correct_answer: string;
  explanation?: string;
  xp_reward: number;
  article_id?: string; // Opcjonalne powiązanie z artykułem
  difficulty?: "easy" | "medium" | "hard";
  skillTags?: string[];
}

export interface BadgeExport {
  name: string;
  description?: string;
  icon_url?: string;
  category?: "milestone" | "mastery" | "special" | "class_completion";
  unlockCriteria?: string;
  criteria: {
    criteria_type: string;
    criteria_value: number;
  }[];
}

export class ContentManager {
  constructor(private userId: string) {}

  private validateVersion(version: string) {
    return version.startsWith("2."); // Zachowujemy wersję 2.x
  }

  async importContent(jsonContent: string | ContentExport) {
    const errors: string[] = [];
    let classesImported = 0;
    let lessonsImported = 0;
    let tasksImported = 0;
    let articlesImported = 0;

    try {
      const content: ContentExport =
        typeof jsonContent === "string" ? JSON.parse(jsonContent) : jsonContent;

      if (!this.validateVersion(content.version)) {
        throw new Error("Nieobsługiwana wersja pliku. Wymagana wersja 2.x");
      }

      // Import klas (przedmiot + poziom + rok)
      for (const classData of content.classes) {
        try {
          // Utwórz lub znajdź klasę
          const classId = await this.ensureClassExists(classData);
          classesImported++;

          // Import lekcji
          const sortedLessons = classData.lessons.sort((a, b) => 
            (a.sequenceNumber || 0) - (b.sequenceNumber || 0)
          );

          for (const lesson of sortedLessons) {
            try {
              const lessonId = await this.insertLesson(lesson);
              
              // Przypisz lekcję do klasy
              await this.assignLessonToClass(lessonId, classId);
              
              lessonsImported++;
              articlesImported += lesson.articles.length;
              tasksImported += lesson.tasks.length;
            } catch (err: any) {
              errors.push(`Błąd lekcji "${lesson.title}": ${err.message}`);
            }
          }
        } catch (err: any) {
          errors.push(`Błąd klasy "${classData.name}": ${err.message}`);
        }
      }

      // Import odznak
      if (content.badges) {
        for (const badge of content.badges) {
          try {
            await this.insertBadge(badge);
          } catch (err: any) {
            errors.push(`Błąd odznaki "${badge.name}": ${err.message}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        classesImported,
        lessonsImported,
        tasksImported,
        articlesImported,
        errors
      };
    } catch (err: any) {
      return {
        success: false,
        classesImported: 0,
        lessonsImported: 0,
        tasksImported: 0,
        articlesImported: 0,
        errors: [`Błąd parsowania: ${err.message}`]
      };
    }
  }

  private async ensureClassExists(classData: ClassExport): Promise<string> {
    // Sprawdź czy klasa już istnieje
    const { data: existing } = await supabaseClient
      .from("classes")
      .select("id")
      .eq("name", classData.name)
      .eq("grade", classData.grade)
      .single();

    if (existing) {
      return existing.id;
    }

    // Utwórz nową klasę
    const { data, error } = await supabaseClient
      .from("classes")
      .insert({
        name: classData.name,
        grade: classData.grade,
        education_year: classData.education_year || 9999 // 9999 = poziom edukacyjny
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  private async assignLessonToClass(lessonId: string, classId: string) {
    // Sprawdź czy przypisanie już istnieje
    const { data: existing } = await supabaseClient
      .from("class_lessons")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("class_id", classId)
      .single();

    if (!existing) {
      const { error } = await supabaseClient
        .from("class_lessons")
        .insert({
          lesson_id: lessonId,
          class_id: classId
        });

      if (error) throw error;
    }
  }

  private async insertLesson(lesson: LessonExport) {
    const { data, error } = await supabaseClient
      .from("lessons")
      .insert({
        title: lesson.title,
        description: lesson.description || null,
        author_id: this.userId,
        subject: lesson.subject || null,
        education_level: lesson.education_level || null,
        grade: lesson.grade || null,
        topic: lesson.topic || null
      })
      .select("id")
      .single();

    if (error) throw error;

    const lessonId = data.id;

    // Wstaw artykuły
    if (lesson.articles.length) {
      const { data: articleData, error: artErr } = await supabaseClient
        .from("articles")
        .insert(
          lesson.articles.map((a, index) => ({
            lesson_id: lessonId,
            title: a.title, // Wymagane pole
            content: a.content,
            sort_order: a.sort_order ?? index
          }))
        )
        .select("id");
      
      if (artErr) throw artErr;

      // Przechowaj ID artykułów dla powiązania z zadaniami
      const articleIds = articleData?.map(a => a.id) || [];

      // Wstaw zadania z opcjonalnym powiązaniem do artykułów
      if (lesson.tasks.length) {
        const tasks = lesson.tasks.map((t, index) => ({
          lesson_id: lessonId,
          article_id: t.article_id || null, // Opcjonalne powiązanie
          type: t.type,
          question_text: t.question_text,
          options: t.options || null,
          correct_answer: t.correct_answer,
          explanation: t.explanation || null,
          xp_reward: t.xp_reward
        }));
        
        const { error: taskErr } = await supabaseClient
          .from("tasks")
          .insert(tasks);
        
        if (taskErr) throw taskErr;
      }
    } else if (lesson.tasks.length) {
      // Jeśli są zadania ale nie ma artykułów
      const tasks = lesson.tasks.map((t) => ({
        lesson_id: lessonId,
        article_id: null,
        type: t.type,
        question_text: t.question_text,
        options: t.options || null,
        correct_answer: t.correct_answer,
        explanation: t.explanation || null,
        xp_reward: t.xp_reward
      }));
      
      const { error: taskErr } = await supabaseClient
        .from("tasks")
        .insert(tasks);
      
      if (taskErr) throw taskErr;
    }

    return lessonId;
  }

  private async insertBadge(badge: BadgeExport) {
    const { data, error } = await supabaseClient
      .from("badges")
      .insert({
        name: badge.name,
        description: badge.description || null,
        icon_url: badge.icon_url || null
      })
      .select("id")
      .single();

    if (error) throw error;

    if (badge.criteria.length) {
      const criteria = badge.criteria.map((c) => ({
        badge_id: data.id,
        criteria_type: c.criteria_type,
        criteria_value: c.criteria_value
      }));
      const { error: critErr } = await supabaseClient
        .from("badge_criteria")
        .insert(criteria);
      if (critErr) throw critErr;
    }
  }

  async exportContent(filters?: {
    classIds?: string[];
    subject?: string;
    educationLevel?: string;
  }): Promise<ContentExport> {
    // Pobierz klasy
    let classQuery = supabaseClient
      .from("classes")
      .select("*")
      .order("grade");

    if (filters?.classIds?.length) {
      classQuery = classQuery.in("id", filters.classIds);
    }

    const { data: classes, error: classError } = await classQuery;
    if (classError) throw classError;

    const exportClasses: ClassExport[] = [];

    // Dla każdej klasy pobierz lekcje
    for (const cls of classes) {
      const { data: classLessons } = await supabaseClient
        .from("class_lessons")
        .select(`
          lesson_id,
          lessons!inner(
            *,
            articles(id,title,content,sort_order),
            tasks(id,type,question_text,options,correct_answer,explanation,xp_reward,article_id)
          )
        `)
        .eq("class_id", cls.id) as { data: ClassLessonWithRelations[] | null };

      if (!classLessons || classLessons.length === 0) continue;

      // Grupuj lekcje według działów (topic)
      const topicMap = new Map<string, typeof classLessons[0]['lessons'][]>();
      classLessons.forEach((cl) => {
        const lesson = cl.lessons;
        const topic = lesson.topic || "Inne"; // Domyślny dział jeśli brak topic
        if (!topicMap.has(topic)) {
          topicMap.set(topic, []);
        }
        topicMap.get(topic)!.push(lesson);
      });

      // Sortuj lekcje w ramach działów
      const allLessons: LessonExport[] = [];
      topicMap.forEach((lessons) => {
        const sortedLessons = lessons.map((lesson, index) => ({
          title: lesson.title,
          description: lesson.description || undefined,
          subject: lesson.subject || undefined,
          education_level: lesson.education_level || undefined,
          grade: lesson.grade || undefined,
          topic: lesson.topic || undefined,
          sequenceNumber: index,
          articles: (lesson.articles || []).map(a => ({
            title: a.title,
            content: a.content,
            sort_order: a.sort_order
          })),
          tasks: (lesson.tasks || []).map(t => ({
            type: t.type as TaskExport['type'],
            question_text: t.question_text,
            options: t.options,
            correct_answer: t.correct_answer,
            explanation: t.explanation || undefined,
            xp_reward: t.xp_reward,
            article_id: t.article_id || undefined
          })),
          totalXP: lesson.tasks?.reduce((sum, t) => sum + t.xp_reward, 0) || 0
        }));
        allLessons.push(...sortedLessons);
      });
      
      exportClasses.push({
        name: cls.name,
        grade: cls.grade,
        education_year: cls.education_year,
        lessons: allLessons
      });
    }

    // Pobierz odznaki
    const { data: badges } = await supabaseClient
      .from("badges")
      .select(`
        *,
        badge_criteria(criteria_type, criteria_value)
      `);

    return {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      metadata: {
        description: "Eksport klas i lekcji",
        targetAudience: "liceum"
      },
      classes: exportClasses,
      badges: badges?.map(b => ({
        name: b.name,
        description: b.description || undefined,
        icon_url: b.icon_url || undefined,
        criteria: b.badge_criteria || []
      }))
    };
  }

  async exportToFile(filters?: any): Promise<Blob> {
    const content = await this.exportContent(filters);
    const jsonString = JSON.stringify(content, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }

  async importFromFile(file: File) {
    const text = await file.text();
    return this.importContent(text);
  }

  // Generator przykładowej struktury dla polskiego liceum
  getExampleStructure(): ContentExport {
    return {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      metadata: {
        description: "Przykładowa struktura kursu dla liceum ogólnokształcącego",
        targetAudience: "Liceum ogólnokształcące - przygotowanie do matury"
      },
      classes: [
        {
          name: "Matematyka podstawowa - klasa 1",
          grade: "1",
          education_year: 9999, // Specjalna wartość dla poziomów edukacyjnych
          description: "Pierwszy rok matematyki na poziomie podstawowym",
          lessons: [
            {
              title: "Zbiory liczbowe",
              description: "Poznajemy podstawowe zbiory liczb",
              subject: "matematyka",
              education_level: "podstawowy",
              grade: "1",
              topic: "Liczby rzeczywiste",
              estimatedTime: 45,
              difficulty: "easy",
              sequenceNumber: 1,
              articles: [
                {
                  title: "Wprowadzenie do zbiorów liczbowych",
                  content: "# Zbiory liczbowe\n\n## Wprowadzenie\n\nW matematyce wyróżniamy kilka podstawowych zbiorów liczb:\n\n- **Liczby naturalne (ℕ)** - używane do liczenia: 1, 2, 3, ...\n- **Liczby całkowite (ℤ)** - liczby naturalne wraz z zerem i liczbami ujemnymi\n- **Liczby wymierne (ℚ)** - liczby które można zapisać jako ułamek\n- **Liczby niewymierne** - liczby których nie można zapisać jako ułamek\n- **Liczby rzeczywiste (ℝ)** - wszystkie liczby na osi liczbowej",
                  sort_order: 1,
                  contentType: "theory",
                  readingTime: 10
                },
                {
                  title: "Przykłady liczb niewymiernych",
                  content: "## Przykłady liczb niewymiernych\n\nNajbardziej znane liczby niewymierne to:\n\n1. **√2** ≈ 1.414213...\n2. **π** ≈ 3.141592...\n3. **e** ≈ 2.718281...\n\nTe liczby mają nieskończone rozwinięcia dziesiętne, które nigdy się nie powtarzają.",
                  sort_order: 2,
                  contentType: "example",
                  readingTime: 5
                }
              ],
              tasks: [
                {
                  type: "single_choice",
                  question_text: "Która z liczb jest niewymierna?",
                  options: ["2", "0.5", "√2", "1/3"],
                  correct_answer: "√2",
                  explanation: "Liczba √2 nie może być zapisana jako ułamek zwykły",
                  xp_reward: 10,
                  difficulty: "easy",
                  skillTags: ["liczby", "zbiory"]
                },
                {
                  type: "multiple_choice",
                  question_text: "Które z poniższych liczb należą do zbioru liczb wymiernych?",
                  options: ["0.333...", "√4", "π", "2/7"],
                  correct_answer: "0.333...,√4,2/7",
                  explanation: "0.333... = 1/3, √4 = 2, 2/7 to ułamek. Tylko π jest niewymierna.",
                  xp_reward: 15,
                  difficulty: "medium"
                },
                {
                  type: "true_false",
                  question_text: "Każda liczba całkowita jest liczbą wymierną.",
                  options: ["Prawda", "Fałsz"],
                  correct_answer: "Prawda",
                  explanation: "Każdą liczbę całkowitą można zapisać jako ułamek, np. 5 = 5/1",
                  xp_reward: 10,
                  difficulty: "easy"
                }
              ],
              totalXP: 35,
              passingScore: 25
            },
            {
              title: "Działania na zbiorach",
              description: "Podstawowe operacje na zbiorach liczbowych",
              subject: "matematyka",
              education_level: "podstawowy",
              grade: "1", 
              topic: "Liczby rzeczywiste",
              sequenceNumber: 2,
              articles: [
                {
                  title: "Suma i iloczyn zbiorów",
                  content: "# Działania na zbiorach\n\n## Podstawowe operacje\n\n1. **Suma zbiorów (A ∪ B)** - elementy należące do A lub B\n2. **Iloczyn zbiorów (A ∩ B)** - elementy należące do A i B\n3. **Różnica zbiorów (A \\ B)** - elementy należące do A, ale nie do B",
                  sort_order: 1
                }
              ],
              tasks: []
            }
          ]
        },
        {
          name: "Matematyka rozszerzona - klasa 3",
          grade: "3", 
          education_year: 9999,
          description: "Trzeci rok matematyki na poziomie rozszerzonym",
          lessons: [
            {
              title: "Granice funkcji",
              description: "Wprowadzenie do granic",
              subject: "matematyka",
              education_level: "rozszerzony",
              grade: "3",
              topic: "Rachunek różniczkowy",
              estimatedTime: 90,
              difficulty: "hard",
              articles: [
                {
                  title: "Pojęcie granicy funkcji",
                  content: "# Granice funkcji\n\n## Intuicyjne rozumienie granicy\n\nGranica funkcji w punkcie to wartość, do której funkcja \"dąży\" gdy argument zbliża się do tego punktu.",
                  sort_order: 1
                }
              ],
              tasks: [
                {
                  type: "open_question",
                  question_text: "Oblicz granicę: lim(x→2) (x² - 4)/(x - 2)",
                  correct_answer: "4",
                  explanation: "Stosując przekształcenie: (x² - 4)/(x - 2) = (x-2)(x+2)/(x-2) = x+2, otrzymujemy lim(x→2) (x+2) = 4",
                  xp_reward: 25,
                  difficulty: "medium"
                }
              ]
            }
          ]
        }
      ],
      badges: [
        {
          name: "Maturzysta z matematyki",
          description: "Ukończ cały kurs matematyki podstawowej",
          category: "class_completion",
          unlockCriteria: "Zdobądź 100% postępu we wszystkich klasach matematyki podstawowej",
          criteria: [
            {
              criteria_type: "subject_completion",
              criteria_value: 100
            }
          ]
        },
        {
          name: "Mistrz liczb",
          description: "Rozwiąż 50 zadań z działu Liczby rzeczywiste",
          icon_url: "/badges/numbers-master.svg",
          category: "mastery",
          criteria: [
            {
              criteria_type: "topic_tasks_completed",
              criteria_value: 50
            }
          ]
        }
      ]
    };
  }
}
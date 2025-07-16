// src/pages/operator/EducationLevelsPanel.tsx
import React, { useState, useEffect } from "react";
import { GraduationCap, Award, BookOpen, Clock, Users, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabaseClient } from "@/utility";

interface ClassStats {
  id: string;
  name: string;
  grade: string;
  education_year: number;
  totalLessons: number;
  totalXP: number;
  totalTasks: number;
  topics: TopicStats[];
}

interface TopicStats {
  name: string;
  lessonCount: number;
  totalXP: number;
  totalTasks: number;
}

export const EducationLevelsPanel: React.FC = () => {
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassStats();
  }, []);

  const loadClassStats = async () => {
    setLoading(true);
    try {
      // Pobierz wszystkie klasy
      const { data: classes, error: classError } = await supabaseClient
        .from("classes")
        .select("*")
        .order("grade", { ascending: true });

      if (classError) throw classError;

      const stats: ClassStats[] = [];

      // Dla każdej klasy pobierz powiązane lekcje
      for (const cls of classes || []) {
        const { data: classLessons, error: lessonError } = await supabaseClient
          .from("class_lessons")
          .select(`
            lesson_id,
            lessons!inner(
              *,
              tasks(xp_reward)
            )
          `)
          .eq("class_id", cls.id);

        if (lessonError) {
          console.error(`Error loading lessons for class ${cls.name}:`, lessonError);
          continue;
        }

        // Grupuj lekcje według działów (topic)
        const topicMap = new Map<string, TopicStats>();
        let totalXP = 0;
        let totalTasks = 0;

        classLessons?.forEach((cl: any) => {
          const lesson = cl.lessons;
          const topicName = lesson.topic || "Inne";
          
          if (!topicMap.has(topicName)) {
            topicMap.set(topicName, {
              name: topicName,
              lessonCount: 0,
              totalXP: 0,
              totalTasks: 0
            });
          }
          
          const topic = topicMap.get(topicName)!;
          topic.lessonCount++;
          
          // Oblicz XP i zadania dla lekcji
          const lessonTasks = lesson.tasks || [];
          const lessonXP = lessonTasks.reduce((sum: number, task: any) => 
            sum + (task.xp_reward || 0), 0);
          
          topic.totalXP += lessonXP;
          topic.totalTasks += lessonTasks.length;
          totalXP += lessonXP;
          totalTasks += lessonTasks.length;
        });

        stats.push({
          id: cls.id,
          name: cls.name,
          grade: cls.grade,
          education_year: cls.education_year,
          totalLessons: classLessons?.length || 0,
          totalXP,
          totalTasks,
          topics: Array.from(topicMap.values()).sort((a, b) => 
            b.lessonCount - a.lessonCount
          )
        });
      }

      setClassStats(stats.sort((a, b) => 
        parseInt(a.grade) - parseInt(b.grade)
      ));
    } catch (error) {
      console.error("Error loading class stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      "1": "from-green-400 to-green-600",
      "2": "from-blue-400 to-blue-600",
      "3": "from-purple-400 to-purple-600",
      "4": "from-orange-400 to-orange-600"
    };
    return colors[grade as keyof typeof colors] || "from-gray-400 to-gray-600";
  };

  const getGradeDescription = (grade: string) => {
    const descriptions = {
      "1": "Budowanie fundamentów wiedzy",
      "2": "Rozwijanie umiejętności i pogłębianie teorii",
      "3": "Intensywne przygotowanie do matury",
      "4": "Poziom olimpijski i zaawansowany"
    };
    return descriptions[grade as keyof typeof descriptions] || "";
  };

  const parseClassName = (name: string) => {
    // Parsuje nazwę klasy np. "Matematyka rozszerzona - klasa 2"
    const match = name.match(/^(.+?)\s+(podstawowy|rozszerzony)?\s*-\s*klasa\s*\d+$/i);
    if (match) {
      return {
        subject: match[1].trim(),
        level: match[2] || "podstawowy"
      };
    }
    return { subject: name, level: "" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie struktury klas...</div>
      </div>
    );
  }

  // Grupuj klasy według roku (grade)
  const classesByGrade = classStats.reduce((acc, cls) => {
    if (!acc[cls.grade]) {
      acc[cls.grade] = [];
    }
    acc[cls.grade].push(cls);
    return acc;
  }, {} as Record<string, ClassStats[]>);

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Struktura klas w systemie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            System edukacyjny dla liceum ogólnokształcącego. Każda klasa reprezentuje 
            kombinację przedmiotu, poziomu i roku nauki.
          </p>
          {classStats.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                Brak klas w systemie
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Przejdź do panelu Import/Eksport aby załadować strukturę klas i lekcji.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Klasy pogrupowane według roku */}
      {Object.entries(classesByGrade).map(([grade, gradeClasses]) => (
        <Card key={grade} className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${getGradeColor(grade)}`} />
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Klasa {grade}</CardTitle>
                <p className="text-gray-600 mt-1">
                  {getGradeDescription(grade)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Award className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {gradeClasses.reduce((sum, cls) => sum + cls.totalXP, 0).toLocaleString()} XP
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {gradeClasses.length} przedmiotów • 
                  {gradeClasses.reduce((sum, cls) => sum + cls.totalLessons, 0)} lekcji
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Statystyki roku */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Przedmioty</span>
                </div>
                <p className="text-2xl font-bold">{gradeClasses.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Lekcje</span>
                </div>
                <p className="text-2xl font-bold">
                  {gradeClasses.reduce((sum, cls) => sum + cls.totalLessons, 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Zadania</span>
                </div>
                <p className="text-2xl font-bold">
                  {gradeClasses.reduce((sum, cls) => sum + cls.totalTasks, 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Czas nauki</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(gradeClasses.reduce((sum, cls) => 
                    sum + cls.totalLessons, 0) * 45 / 60)}h
                </p>
              </div>
            </div>

            {/* Lista klas w roku */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Przedmioty w klasie {grade}:</h4>
              {gradeClasses.map((cls) => {
                const { subject, level } = parseClassName(cls.name);
                const totalLessons = gradeClasses.reduce((sum, c) => sum + c.totalLessons, 0);
                
                return (
                  <div key={cls.id} 
                       className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium capitalize">{subject}</span>
                        {level && (
                          <span className="ml-2 text-sm px-2 py-1 bg-gray-100 rounded">
                            {level}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cls.totalLessons} lekcji • {cls.totalTasks} zadań • {cls.totalXP} XP
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-3">
                      <Progress 
                        value={(cls.totalLessons / totalLessons) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Działy w klasie */}
                    {cls.topics.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Działy:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {cls.topics.map((topic) => (
                            <span key={topic.name} 
                                  className="px-2 py-1 bg-gray-50 rounded text-xs">
                              {topic.name} ({topic.lessonCount})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Informacja o systemie */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Organizacja systemu edukacyjnego
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-3">
          <p className="text-sm">
            System dostosowany do polskiego liceum ogólnokształcącego:
          </p>
          <ul className="text-sm list-disc list-inside space-y-1 ml-2">
            <li><strong>Klasa w systemie</strong> = przedmiot + poziom + rok nauki</li>
            <li><strong>Poziomy:</strong> podstawowy (obowiązkowy), rozszerzony (maturalny)</li>
            <li><strong>Przedmioty obowiązkowe:</strong> polski, matematyka, język obcy</li>
            <li><strong>Przedmioty do wyboru:</strong> biologia, chemia, fizyka, geografia, historia, WOS, informatyka</li>
          </ul>
          <p className="text-sm mt-4 font-medium">
            Przykład: "Matematyka rozszerzona - klasa 2" to osobna klasa zawierająca
            lekcje z matematyki na poziomie rozszerzonym dla drugiego roku nauki.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
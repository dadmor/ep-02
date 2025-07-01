// src/pages/student/ui.Lessons.tsx
import React from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
}

interface ProgressRecord {
  lesson_id: string;
  score: number;
  attempts_count: number;
}

const StudentLessons: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<{ id: string }>();

  const { data: lessonsData, isLoading } = useList<Lesson>({
    resource: "lessons",
    pagination: { pageSize: 50 },
    sorters: [{ field: "created_at", order: "asc" }],
  });

  const { data: progressData } = useList<ProgressRecord>({
    resource: "progress",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const lessons = lessonsData?.data || [];
  const progressRecords = progressData?.data || [];

  const getLessonProgress = (lessonId: string | undefined) => {
    if (!lessonId) return undefined;
    return progressRecords.find(p => p.lesson_id === lessonId);
  };

  const isLessonAvailable = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    const previousLesson = lessons[lessonIndex - 1];
    if (!previousLesson?.id) return false;
    const previousProgress = getLessonProgress(previousLesson.id);
    return previousProgress && previousProgress.score >= 70;
  };

  if (isLoading) {
    return <div>Ładowanie lekcji...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wszystkie lekcje</h1>
        <p className="text-gray-600">Wybierz lekcję, którą chcesz rozpocząć lub powtórzyć</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => {
          // Zabezpieczenie przed undefined id
          if (!lesson.id) return null;
          
          const progress = getLessonProgress(lesson.id);
          const isAvailable = isLessonAvailable(index);
          const isCompleted = progress && progress.score >= 70;

          return (
            <Card 
              key={lesson.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                !isAvailable 
                  ? 'bg-gray-50 border-gray-200' 
                  : isCompleted 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-lg ${!isAvailable ? 'text-gray-500' : 'text-gray-800'}`}>
                    {lesson.title}
                  </CardTitle>
                  {isCompleted && (
                    <Badge className="bg-green-500">
                      ✓ Ukończone
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm mb-4 ${!isAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lesson.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {lesson.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {lesson.grade}
                  </span>
                </div>

                {progress && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Najlepszy wynik:</span>
                      <span className="font-semibold">{progress.score}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Liczba prób:</span>
                      <span>{progress.attempts_count}</span>
                    </div>
                  </div>
                )}

                <Button 
                  disabled={!isAvailable}
                  onClick={() => {
                    if (lesson.id) {
                      navigate(`/student/lessons/${lesson.id}`);
                    }
                  }}
                  className={`w-full ${
                    isCompleted 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : !isAvailable 
                        ? 'bg-gray-300'
                        : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {!isAvailable ? 'Zablokowane' : isCompleted ? 'Powtórz lekcję' : 'Rozpocznij lekcję'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentLessons;
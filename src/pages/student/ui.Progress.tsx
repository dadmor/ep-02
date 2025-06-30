// src/pages/student/ui.Progress.tsx
import React from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Target,
  BookOpen,
  Star,
  Award
} from "lucide-react";

const StudentProgress: React.FC = () => {
  const { data: identity } = useGetIdentity<{ 
    id: string; 
    username: string; 
    xp: number; 
    level: number; 
    streak: number; 
  }>();

  const { data: progressData } = useList({
    resource: "progress",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
    sorters: [{ field: "completed_at", order: "desc" }],
  });

  const { data: lessonsData } = useList({
    resource: "lessons",
  });

  const { data: userBadgesData } = useList({
    resource: "user_badges",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const progressRecords = progressData?.data || [];
  const lessons = lessonsData?.data || [];
  const userBadges = userBadgesData?.data || [];

  const completedLessons = progressRecords.filter(p => p.score >= 70);
  const averageScore = progressRecords.length > 0 
    ? Math.round(progressRecords.reduce((sum, p) => sum + p.score, 0) / progressRecords.length)
    : 0;

  const totalXpFromLessons = progressRecords.reduce((sum, p) => sum + (p.score + p.streak_bonus), 0);

  if (!identity) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Twoje postępy</h1>
        <p className="text-gray-600">Przegląd Twojej aktywności i osiągnięć</p>
      </div>

      {/* Statystyki główne */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{identity.level}</div>
            <div className="text-sm text-gray-600">Poziom</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{identity.xp}</div>
            <div className="text-sm text-gray-600">Łączne XP</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{identity.streak}</div>
            <div className="text-sm text-gray-600">Passa (dni)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{userBadges.length}</div>
            <div className="text-sm text-gray-600">Odznaki</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Lewe kolumny */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Postęp w poziomie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Postęp do następnego poziomu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Poziom {identity.level}</span>
                <span>Poziom {identity.level + 1}</span>
              </div>
              <Progress value={((identity.xp % 1000) / 1000) * 100} className="h-4" />
              <p className="text-sm text-gray-500 mt-2">
                {1000 - (identity.xp % 1000)} XP do następnego poziomu
              </p>
            </CardContent>
          </Card>

          {/* Historia lekcji */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                Historia lekcji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressRecords.map((progress) => {
                  const lesson = lessons.find(l => l.id === progress.lesson_id);
                  return (
                    <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{lesson?.title || 'Nieznana lekcja'}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(progress.completed_at).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          progress.score >= 90 ? 'bg-green-500' :
                          progress.score >= 70 ? 'bg-blue-500' :
                          'bg-orange-500'
                        }>
                          {progress.score}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Próba #{progress.attempts_count}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {progressRecords.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nie ukończyłeś jeszcze żadnej lekcji
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna */}
        <div className="space-y-6">
          
          {/* Statystyki szczegółowe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Szczegółowe statystyki
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ukończone lekcje</span>
                <span className="font-semibold">{completedLessons.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Wszystkie próby</span>
                <span className="font-semibold">{progressRecords.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Średni wynik</span>
                <span className="font-semibold">{averageScore}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">XP z lekcji</span>
                <span className="font-semibold">{totalXpFromLessons}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ostatnie osiągnięcia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Ostatnie odznaki
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userBadges.length > 0 ? (
                <div className="space-y-3">
                  {userBadges.slice(0, 3).map((userBadge) => (
                    <div key={userBadge.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Nowa odznaka!</p>
                        <p className="text-xs text-gray-600">
                          {new Date(userBadge.awarded_at).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Jeszcze nie zdobyłeś żadnych odznak
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
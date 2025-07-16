// src/pages/student/dashboard.tsx - ZMODYFIKOWANY
import React, { useState } from 'react';
import { useList, useGetIdentity } from '@refinedev/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  CheckCircle2,
  Lock,
  Play,
  User,
  Award,
  TrendingUp,
  ChevronRight,
  Grid3X3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Konfiguracja przedmiotów
const SUBJECTS_CONFIG: Record<string, { icon: string; color: string }> = {
  'Matematyka': { icon: '📐', color: 'blue' },
  'Język polski': { icon: '📚', color: 'red' },
  'Język angielski': { icon: '🇬🇧', color: 'green' },
  'Fizyka': { icon: '⚛️', color: 'purple' },
  'Chemia': { icon: '🧪', color: 'orange' },
  'Biologia': { icon: '🧬', color: 'teal' },
  'Historia': { icon: '🏛️', color: 'amber' },
  'Geografia': { icon: '🌍', color: 'cyan' },
  'Informatyka': { icon: '💻', color: 'slate' }
};

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  education_level: string;
}

interface ProgressRecord {
  lesson_id: string;
  score: number;
  attempts_count: number;
}

interface BadgeType {
  id: string;
  name: string;
}

interface UserBadge {
  badge_id: string;
}

interface Ranking {
  rank: number;
}

// Komponent karty przedmiotu
const SubjectCard: React.FC<{
  subject: string;
  lessons: Lesson[];
  progress: ProgressRecord[];
  onSelect: () => void;
}> = ({ subject, lessons, progress, onSelect }) => {
  const config = SUBJECTS_CONFIG[subject] || { icon: '📖', color: 'gray' };
  
  const completedLessons = lessons.filter(lesson => 
    progress.some(p => p.lesson_id === lesson.id && p.score >= 70)
  ).length;
  
  const averageScore = progress
    .filter(p => lessons.some(l => l.id === p.lesson_id))
    .reduce((sum, p, _, arr) => sum + p.score / arr.length, 0);
  
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    teal: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
    amber: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    cyan: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    slate: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
    gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${colorClasses[config.color as keyof typeof colorClasses] || colorClasses.gray}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{config.icon}</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <h3 className="font-semibold text-base mb-2">{subject}</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Lekcje</span>
            <span className="font-semibold">{completedLessons}/{lessons.length}</span>
          </div>
          
          {lessons.length > 0 && (
            <>
              <Progress 
                value={(completedLessons / lessons.length) * 100} 
                className="h-2" 
              />
              
              {averageScore > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-gray-600">Średni wynik</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(averageScore)}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<{ 
    id: string; 
    username: string; 
    xp: number; 
    level: number; 
    streak: number; 
  }>();
  
  const [viewMode, setViewMode] = useState<'subjects' | 'all'>('subjects');

  // Pobieranie danych
  const { data: lessonsData } = useList<Lesson>({
    resource: "lessons",
    pagination: { pageSize: 100 },
    sorters: [{ field: "created_at", order: "asc" }],
  });

  const { data: progressData } = useList<ProgressRecord>({
    resource: "progress",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const { data: userBadgesData } = useList<UserBadge>({
    resource: "user_badges",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const { data: allBadgesData } = useList<BadgeType>({
    resource: "badges",
  });

  const { data: rankingData } = useList<Ranking>({
    resource: "student_rankings",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const lessons = lessonsData?.data || [];
  const progressRecords = progressData?.data || [];
  const userBadges = userBadgesData?.data || [];
  const allBadges = allBadgesData?.data || [];
  const userRanking = rankingData?.data?.[0];

  // Grupowanie lekcji po przedmiotach
  const lessonsBySubject = lessons.reduce((acc, lesson) => {
    const subject = lesson.subject || 'Inne';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  // Sortowanie przedmiotów według liczby lekcji
  const sortedSubjects = Object.entries(lessonsBySubject)
    .sort(([, a], [, b]) => b.length - a.length);

  const isLessonAvailable = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    const previousLesson = lessons[lessonIndex - 1];
    if (!previousLesson?.id) return false;
    return progressRecords.some(p => p.lesson_id === previousLesson.id && p.score >= 70);
  };

  const getLessonProgress = (lessonId: string) => {
    return progressRecords.find(p => p.lesson_id === lessonId) || null;
  };

  const getLevelProgress = () => {
    if (!identity) return 0;
    const currentLevelXP = (identity.level - 1) * 1000;
    const nextLevelXP = identity.level * 1000;
    const progressInLevel = identity.xp - currentLevelXP;
    return (progressInLevel / 1000) * 100;
  };

  const badgesWithStatus = allBadges.map(badge => ({
    ...badge,
    earned: userBadges.some(ub => ub.badge_id === badge.id)
  }));

  if (!identity) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="">
        
        {/* Header z profilem - BEZ ZMIAN */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    <User />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cześć, {identity.username}!</h1>
                    <p className="text-gray-600">Poziom {identity.level} • {identity.xp} XP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold text-lg">{identity.streak}</span>
                    </div>
                    <p className="text-sm text-gray-600">dni z rzędu</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-yellow-500 mb-1">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold text-lg">{userBadges.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">odznak</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Poziom {identity.level}</span>
                  <span>Poziom {identity.level + 1}</span>
                </div>
                <Progress value={getLevelProgress()} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">
                  {1000 - (identity.xp % 1000)} XP do następnego poziomu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Główna kolumna z lekcjami/przedmiotami */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    {viewMode === 'subjects' ? 'Przedmioty' : 'Wszystkie lekcje'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'subjects' ? 'all' : 'subjects')}
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    {viewMode === 'subjects' ? 'Pokaż wszystkie' : 'Pokaż przedmioty'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* WIDOK PRZEDMIOTOWY */}
                {viewMode === 'subjects' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {sortedSubjects.map(([subject, subjectLessons]) => (
                      <SubjectCard
                        key={subject}
                        subject={subject}
                        lessons={subjectLessons}
                        progress={progressRecords}
                        onSelect={() => navigate(`/student/lessons?subject=${encodeURIComponent(subject)}`)}
                      />
                    ))}
                  </div>
                ) : (
                  // ORYGINALNY WIDOK WSZYSTKICH LEKCJI
                  lessons.slice(0, 5).map((lesson, index) => {
                    if (!lesson.id) return null;
                    const progress = getLessonProgress(lesson.id);
                    const isAvailable = isLessonAvailable(index);
                    const isCompleted = progress && progress.score >= 70;
                    const hasMaxScore = progress && progress.score === 100;

                    return (
                      <Card 
                        key={lesson.id}
                        className={`transition-all duration-200 hover:shadow-md ${
                          !isAvailable 
                            ? 'bg-gray-100 border-gray-200' 
                            : isCompleted 
                              ? 'bg-green-50 border-green-200'
                              : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                !isAvailable 
                                  ? 'bg-gray-300 text-gray-500'
                                  : isCompleted
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-500 text-white'
                              }`}>
                                {!isAvailable ? (
                                  <Lock className="w-6 h-6" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                  <Play className="w-6 h-6" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className={`font-semibold ${!isAvailable ? 'text-gray-500' : hasMaxScore ? 'text-gray-600' : 'text-gray-800'}`}>
                                  {lesson.title}
                                </h3>
                                <p className={`text-sm ${!isAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {lesson.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {lesson.subject} • {lesson.topic}
                                </p>
                                {progress && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500">
                                      Najlepszy wynik: {progress.score}% • Próby: {progress.attempts_count}
                                    </p>
                                    {progress.score === 100 && (
                                      <p className="text-xs text-orange-600 font-medium mt-1">
                                        ⚠️ Maksymalny wynik osiągnięty - kolejne próby nie dadzą XP
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              disabled={!isAvailable}
                              onClick={() => {
                                if (lesson.id) {
                                  navigate(`/student/lessons/${lesson.id}`);
                                }
                              }}
                              className={
                                hasMaxScore
                                  ? 'bg-gray-400 hover:bg-gray-500'
                                  : isCompleted 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : !isAvailable 
                                      ? 'bg-gray-300'
                                      : 'bg-blue-500 hover:bg-blue-600'
                              }
                            >
                              {hasMaxScore ? 'Powtórz (bez XP)' : isCompleted ? 'Powtórz' : !isAvailable ? 'Zablokowane' : 'Rozpocznij'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                
                {viewMode === 'all' && lessons.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/student/lessons')}
                  >
                    Zobacz wszystkie lekcje ({lessons.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - BEZ ZMIAN */}
          <div className="space-y-6">
            
            {/* Dzisiejsze cele */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-green-500" />
                  Dzisiejsze cele
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ukończ 1 lekcję</span>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zdobądź 100 XP</span>
                  <div className="text-xs text-gray-500">50/100</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Kontynuuj passę</span>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            {/* Odznaki */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Twoje odznaki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badgesWithStatus.slice(0, 4).map((badge) => (
                    <div 
                      key={badge.id}
                      className={`p-3 rounded-lg text-center transition-all ${
                        badge.earned 
                          ? 'bg-yellow-50 border-2 border-yellow-200' 
                          : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">🏆</div>
                      <p className="text-xs font-medium">{badge.name}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate('/student/badges')}
                >
                  Zobacz wszystkie
                </Button>
              </CardContent>
            </Card>

            {/* Statystyki */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Twoje statystyki
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Lekcje ukończone</span>
                  <span className="font-semibold">{progressRecords.filter(p => p.score >= 70).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Średni wynik</span>
                  <span className="font-semibold">
                    {progressRecords.length > 0 
                      ? Math.round(progressRecords.reduce((sum, p) => sum + p.score, 0) / progressRecords.length)
                      : 0}%
                  </span>
                </div>
                {userRanking && (
                  <div className="flex justify-between">
                    <span className="text-sm">Pozycja w rankingu</span>
                    <span className="font-semibold text-green-600">#{userRanking.rank}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-3" 
                  size="sm"
                  onClick={() => navigate('/student/progress')}
                >
                  Zobacz szczegóły
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
        
        {/* Zachęta do nauki - BEZ ZMIAN */}
        <Card className="mt-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Świetna robota!</h3>
            <p className="mb-4">Masz {identity.streak} dni z rzędu! Kontynuuj naukę, żeby nie stracić passy.</p>
            <Button 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => navigate('/student/lessons')}
            >
              Rozpocznij kolejną lekcję
            </Button>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
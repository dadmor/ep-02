// src/pages/teacher/dashboard.tsx - POPRAWIONY dla rzeczywistej bazy danych
import { useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  GraduationCap,
  Award,
  BarChart3,
  Target,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Identity = {
  id: string;
  email?: string;
  username?: string;
  role: 'teacher' | 'student';
};

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Fetch teacher's lessons
  const { data: lessons } = useList({
    resource: "lessons",
    filters: userId ? [
      {
        field: "author_id",
        operator: "eq",
        value: userId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Fetch all students (users with role 'student')
  const { data: students } = useList({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "student",
      },
    ],
    pagination: { mode: "off" },
  });

  // Fetch all classes
  const { data: classes } = useList({
    resource: "classes",
    pagination: { mode: "off" },
  });

  // Fetch articles for teacher's lessons
  const { data: articles } = useList({
    resource: "articles",
    pagination: { mode: "off" },
  });

  // Fetch tasks for teacher's lessons
  const { data: tasks } = useList({
    resource: "tasks",
    pagination: { mode: "off" },
  });

  // Fetch recent progress
  const { data: progress } = useList({
    resource: "progress",
    sorters: [
      {
        field: "completed_at",
        order: "desc",
      },
    ],
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // Fetch badges
  const { data: badges } = useList({
    resource: "badges",
    pagination: { mode: "off" },
  });

  const lessonList = lessons?.data || [];
  const studentList = students?.data || [];
  const classList = classes?.data || [];
  const articleList = articles?.data || [];
  const taskList = tasks?.data || [];
  const progressList = progress?.data || [];
  const badgeList = badges?.data || [];

  // Filter teacher's content
  const teacherLessons = lessonList.filter(l => l.author_id === userId);
  const teacherLessonIds = teacherLessons.map(l => l.id);
  const teacherArticles = articleList.filter(a => teacherLessonIds.includes(a.lesson_id));
  const teacherTasks = taskList.filter(t => teacherLessonIds.includes(t.lesson_id));
  const teacherProgress = progressList.filter(p => teacherLessonIds.includes(p.lesson_id));

  const stats = {
    totalLessons: teacherLessons.length,
    totalArticles: teacherArticles.length,
    totalTasks: teacherTasks.length,
    totalStudents: studentList.length,
    totalClasses: classList.length,
    completedLessons: teacherProgress.length,
    averageScore: teacherProgress.length > 0 
      ? Math.round(teacherProgress.reduce((sum, p) => sum + p.score, 0) / teacherProgress.length)
      : 0,
    totalBadges: badgeList.length,
  };

  const recentLessons = teacherLessons
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 3);

  const recentProgress = teacherProgress
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    .slice(0, 5);

  // Show loading state if user identity is not loaded yet
  if (!userId) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Lead
        title={`Witaj, ${identity?.username || identity?.email || 'Nauczycielu'}!`}
        description="Panel zarządzania treściami edukacyjnymi i postępami uczniów"
      />

      {/* Quick Stats */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
                <div className="text-sm text-muted-foreground">Moje lekcje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <div className="text-sm text-muted-foreground">Artykuły</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Zadania</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completedLessons}</div>
                <div className="text-sm text-muted-foreground">Ukończenia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox>
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/teacher/lessons/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nowa lekcja
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate('/teacher/articles/create')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Nowy artykuł
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/teacher/tasks/create')}
              >
                <Target className="w-4 h-4 mr-2" />
                Nowe zadanie
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/teacher/classes/create')}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Nowa klasa
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/teacher/progress')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Zobacz postępy
              </Button>
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Statystyki systemu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uczniowie w systemie</span>
                  <Badge variant="outline">{stats.totalStudents}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Klasy</span>
                  <Badge variant="outline">{stats.totalClasses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Średni wynik</span>
                  <Badge variant="outline" className={
                    stats.averageScore >= 80 ? 'border-green-500 text-green-700' :
                    stats.averageScore >= 60 ? 'border-blue-500 text-blue-700' :
                    'border-yellow-500 text-yellow-700'
                  }>
                    {stats.averageScore}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dostępne odznaki</span>
                  <Badge variant="outline" className="border-purple-500 text-purple-700">
                    {stats.totalBadges}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lessons */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <FlexBox>
                <CardTitle>Moje najnowsze lekcje</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/teacher/lessons')}
                >
                  Zobacz wszystkie
                </Button>
              </FlexBox>
            </CardHeader>
            <CardContent>
              {recentLessons.length > 0 ? (
                <div className="space-y-4">
                  {recentLessons.map((lesson: any) => {
                    const lessonArticles = teacherArticles.filter(a => a.lesson_id === lesson.id);
                    const lessonTasks = teacherTasks.filter(t => t.lesson_id === lesson.id);
                    const lessonProgress = teacherProgress.filter(p => p.lesson_id === lesson.id);
                    
                    return (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <FlexBox className="mb-2">
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {lessonArticles.length} artykułów
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {lessonTasks.length} zadań
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {lessonProgress.length} ukończeń
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(lesson.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {lesson.subject && (
                              <Badge variant="outline">{lesson.subject}</Badge>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </FlexBox>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nie masz jeszcze żadnych lekcji</p>
                  <p className="text-sm">Utwórz pierwszą lekcję, aby rozpocząć</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </GridBox>

      {/* Recent Activity */}
      <GridBox className="grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ostatnie ukończenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProgress.length > 0 ? (
              <div className="space-y-3">
                {recentProgress.map((prog: any) => {
                  const lesson = teacherLessons.find(l => l.id === prog.lesson_id);
                  const student = studentList.find(s => s.id === prog.user_id);
                  
                  return (
                    <div key={prog.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {lesson?.title || 'Nieznana lekcja'}
                        </div>
                        <Badge variant={
                          prog.score >= 90 ? 'default' :
                          prog.score >= 75 ? 'secondary' :
                          prog.score >= 60 ? 'outline' : 'destructive'
                        }>
                          {prog.score}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uczeń: {student?.username || student?.email || 'Nieznany'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(prog.completed_at).toLocaleDateString()} - 
                        {prog.correct_tasks}/{prog.total_tasks} zadań
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Brak ostatnich ukończeń</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Moje najlepsze lekcje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacherLessons.length > 0 ? (
              <div className="space-y-3">
                {teacherLessons
                  .map(lesson => {
                    const lessonProgress = teacherProgress.filter(p => p.lesson_id === lesson.id);
                    const avgScore = lessonProgress.length > 0 
                      ? lessonProgress.reduce((sum, p) => sum + p.score, 0) / lessonProgress.length 
                      : 0;
                    return { ...lesson, avgScore, completions: lessonProgress.length };
                  })
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .slice(0, 4)
                  .map((lesson: any) => (
                    <div key={lesson.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <Badge variant="default">{Math.round(lesson.avgScore)}%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lesson.completions} ukończeń
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Utwórz lekcje, aby zobaczyć statystyki</p>
              </div>
            )}
          </CardContent>
        </Card>
      </GridBox>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Przegląd aktywności
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLessons}</div>
              <div className="text-sm text-muted-foreground">Utworzone lekcje</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.totalArticles + stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Materiały</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.completedLessons}</div>
              <div className="text-sm text-muted-foreground">Ukończenia</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">{stats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Średni wynik</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
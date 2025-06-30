// src/pages/teacher/ui.LessonShow.tsx - POPRAWIONE
import { useShow, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Calendar, 
  GraduationCap,
  User,
  FileText,
  Target,
  Plus,
  Eye,
  Users
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useParams } from "react-router-dom";

export default function LessonShow() {
  const { id } = useParams();
  const { goBack, edit, create } = useNavigation();
  
  // DEBUG: Sprawdź ID z URL
  console.log("=== LESSON SHOW DEBUG ===");
  console.log("ID from URL params:", id);
  console.log("========================");
  
  const { queryResult } = useShow({
    resource: "lessons",
    id: id!,
  });

  // Pobierz artykuły dla tej lekcji
  const { data: articles } = useList({
    resource: "articles",
    filters: [
      {
        field: "lesson_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "sort_order",
        order: "asc",
      },
    ],
  });

  // Pobierz zadania dla tej lekcji
  const { data: tasks } = useList({
    resource: "tasks",
    filters: [
      {
        field: "lesson_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  // Pobierz postępy uczniów dla tej lekcji
  const { data: progressList } = useList({
    resource: "progress",
    filters: [
      {
        field: "lesson_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "completed_at",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 10,
    },
  });

  const { data: lessonResponse, isLoading } = queryResult;
  const lessonData = lessonResponse?.data;

  // DEBUG: Sprawdź załadowane dane
  console.log("=== LESSON DATA DEBUG ===");
  console.log("Lesson response:", lessonResponse);
  console.log("Lesson data:", lessonData);
  console.log("Lesson ID from data:", lessonData?.id);
  console.log("Is loading:", isLoading);
  console.log("========================");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Lekcja nie została znaleziona</h3>
          <p className="text-muted-foreground mb-4">
            Nie można znaleźć lekcji o podanym identyfikatorze.
          </p>
          <Button onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const articleList = articles?.data || [];
  const taskList = tasks?.data || [];
  const progressData = progressList?.data || [];

  // Statystyki
  const stats = {
    totalArticles: articleList.length,
    totalTasks: taskList.length,
    studentsCompleted: progressData.length,
    averageScore: progressData.length > 0 
      ? Math.round(progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length)
      : 0,
  };

  // Bezpieczna funkcja do formatowania ID
  const formatId = (id: string | undefined | null) => {
    if (!id || typeof id !== 'string') return 'Brak ID';
    return `${id.slice(0, 8)}...`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lessonData.title}</h1>
            <p className="text-muted-foreground">Szczegóły lekcji</p>
          </div>
        </div>
        <Button onClick={() => edit("lessons", id!)}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj lekcję
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Informacje o lekcji
            </CardTitle>
            <div className="flex gap-2">
              {lessonData.subject && (
                <Badge variant="outline">{lessonData.subject}</Badge>
              )}
              {lessonData.education_level && (
                <Badge variant="secondary">{lessonData.education_level}</Badge>
              )}
            </div>
          </FlexBox>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonData.subject && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Przedmiot</h4>
                <p className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {lessonData.subject}
                </p>
              </div>
            )}

            {lessonData.grade && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Klasa</h4>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {lessonData.grade}
                </p>
              </div>
            )}

            {lessonData.education_level && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Poziom edukacji</h4>
                <p>{lessonData.education_level}</p>
              </div>
            )}

            {lessonData.topic && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Temat</h4>
                <p>{lessonData.topic}</p>
              </div>
            )}

            {lessonData.created_at && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Data utworzenia</h4>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(lessonData.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Autor</h4>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ID: {formatId(lessonData.author_id)}
              </p>
            </div>
          </div>

          {lessonData.description && (
            <div className="mt-6">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Opis</h4>
              <p className="text-sm leading-relaxed">{lessonData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Statystyki lekcji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-sm text-muted-foreground">Artykuły</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Zadania</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.studentsCompleted}</div>
              <div className="text-sm text-muted-foreground">Ukończenia</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">{stats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Średni wynik</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GridBox>
        {/* Articles */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Artykuły ({stats.totalArticles})
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => create("articles", "push", { lesson_id: id })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {articleList.length > 0 ? (
              <div className="space-y-3">
                {articleList.map((article: any) => (
                  <div key={article.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{article.title}</h4>
                      <Badge variant="outline">#{article.sort_order || 'N/A'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {article.content ? `${article.content.substring(0, 100)}...` : 'Brak treści'}
                    </p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Zobacz
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak artykułów</p>
                <p className="text-sm">Dodaj pierwszy artykuł do lekcji</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Zadania ({stats.totalTasks})
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => create("tasks", "push", { lesson_id: id })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {taskList.length > 0 ? (
              <div className="space-y-3">
                {taskList.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.question_text || 'Brak treści pytania'}</h4>
                      <Badge variant="outline">{task.type || 'unknown'}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>XP: {task.xp_reward || 0}</span>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {taskList.length > 5 && (
                  <Button variant="ghost" className="w-full">
                    Zobacz wszystkie ({taskList.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak zadań</p>
                <p className="text-sm">Dodaj pierwsze zadanie do lekcji</p>
              </div>
            )}
          </CardContent>
        </Card>
      </GridBox>

      {/* Recent Progress */}
      {progressData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ostatnie ukończenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.slice(0, 10).map((progress: any) => (
                <div key={progress.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Użytkownik: {formatId(progress.user_id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : 'Brak daty'} - 
                      {progress.correct_tasks || 0}/{progress.total_tasks || 0} zadań
                    </p>
                  </div>
                  <Badge variant={
                    (progress.score || 0) >= 80 ? "default" : 
                    (progress.score || 0) >= 60 ? "secondary" : "outline"
                  }>
                    {progress.score || 0}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={() => edit("lessons", id!)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edytuj lekcję
            </Button>
            <Button 
              variant="outline"
              onClick={() => create("articles", "push", { lesson_id: id })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj artykuł
            </Button>
            <Button 
              variant="outline"
              onClick={() => create("tasks", "push", { lesson_id: id })}
            >
              <Target className="w-4 h-4 mr-2" />
              Dodaj zadanie
            </Button>
            <Button variant="ghost">
              <Users className="w-4 h-4 mr-2" />
              Zobacz wszystkie postępy
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
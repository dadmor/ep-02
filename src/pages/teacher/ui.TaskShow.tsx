// src/pages/teacher/ui.TaskShow.tsx
import { useShow, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Target, 
  Calendar, 
  Star,
  CheckCircle,
  XCircle,
  BookOpen,
  FileText,
  Users,
  TrendingUp
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { useParams } from "react-router-dom";

interface TaskOption {
  text: string;
  isCorrect: boolean;
}

interface Task {
  id: string;
  lesson_id: string;
  article_id?: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank';
  question_text: string;
  explanation?: string;
  xp_reward: number;
  correct_answer?: string;
  options?: TaskOption[];
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject?: string;
  grade?: string;
}

interface Article {
  id: string;
  title: string;
  content?: string;
}

interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
}

interface IncorrectAnswer {
  id: string;
  task_id: string;
  user_id: string;
  given_answer: string;
  created_at: string;
}

export default function TaskShow() {
  const { id } = useParams();
  const { goBack, edit } = useNavigation();
  
  const { queryResult } = useShow<Task>({
    resource: "tasks",
    id: id!,
  });

  // Pobierz lekcję dla tego zadania
  const { queryResult: lessonQueryResult } = useShow<Lesson>({
    resource: "lessons",
    id: queryResult.data?.data?.lesson_id,
    queryOptions: {
      enabled: !!queryResult.data?.data?.lesson_id,
    },
  });

  // Pobierz artykuł jeśli jest powiązany
  const { queryResult: articleQueryResult } = useShow<Article>({
    resource: "articles",
    id: queryResult.data?.data?.article_id,
    queryOptions: {
      enabled: !!queryResult.data?.data?.article_id,
    },
  });

  // Pobierz postępy dla tego zadania
  const { data: progressList } = useList<Progress>({
    resource: "progress",
    filters: [
      {
        field: "lesson_id",
        operator: "eq",
        value: queryResult.data?.data?.lesson_id,
      },
    ],
    pagination: {
      pageSize: 50,
    },
    queryOptions: {
      enabled: !!queryResult.data?.data?.lesson_id,
    },
  });

  // Pobierz błędne odpowiedzi
  const { data: incorrectAnswers } = useList<IncorrectAnswer>({
    resource: "incorrect_answers",
    filters: [
      {
        field: "task_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 20,
    },
    queryOptions: {
      enabled: !!id,
    },
  });

  const { data: taskResponse, isLoading } = queryResult;
  const taskData = taskResponse?.data;
  const lesson = lessonQueryResult.data?.data;
  const article = articleQueryResult.data?.data;
  const progressData = progressList?.data || [];
  const incorrectAnswersList = incorrectAnswers?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Zadanie nie zostało znalezione</h3>
          <p className="text-muted-foreground mb-4">
            Nie można znaleźć zadania o podanym identyfikatorze.
          </p>
          <Button onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'single_choice': return <CheckCircle className="w-5 h-5" />;
      case 'multiple_choice': return <Target className="w-5 h-5" />;
      case 'true_false': return <CheckCircle className="w-5 h-5" />;
      case 'fill_blank': return <FileText className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice': return 'Jednokrotny wybór';
      case 'multiple_choice': return 'Wielokrotny wybór';
      case 'true_false': return 'Prawda/Fałsz';
      case 'fill_blank': return 'Uzupełnij lukę';
      default: return type;
    }
  };

  // Statystyki zadania
  const stats = {
    totalAttempts: progressData.length,
    avgScore: progressData.length > 0 ? 
      Math.round(progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length) : 0,
    incorrectAttempts: incorrectAnswersList.length,
    uniqueStudents: new Set(progressData.map(p => p.user_id)).size,
  };

  const options: TaskOption[] = taskData.options ? 
    (Array.isArray(taskData.options) ? taskData.options : 
     typeof taskData.options === 'object' ? Object.values(taskData.options) as TaskOption[] : []) : [];

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
            <h1 className="text-3xl font-bold tracking-tight">Szczegóły zadania</h1>
            <p className="text-muted-foreground">
              {getTaskTypeLabel(taskData.type)} • {taskData.xp_reward} XP
            </p>
          </div>
        </div>
        <Button onClick={() => edit("tasks", id!)}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj zadanie
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              {getTaskTypeIcon(taskData.type)}
              Treść zadania
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{getTaskTypeLabel(taskData.type)}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                {taskData.xp_reward} XP
              </Badge>
            </div>
          </FlexBox>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Pytanie</h4>
              <p className="text-lg leading-relaxed">{taskData.question_text}</p>
            </div>

            {taskData.explanation && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Wyjaśnienie</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {taskData.explanation}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Typ zadania</h4>
                <p className="flex items-center gap-2">
                  {getTaskTypeIcon(taskData.type)}
                  {getTaskTypeLabel(taskData.type)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Nagroda XP</h4>
                <p className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {taskData.xp_reward} punktów
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Data utworzenia</h4>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(taskData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options/Answers */}
      {options.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Opcje odpowiedzi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className={`p-3 border rounded-lg flex items-center gap-3 ${
                  option.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                }`}>
                  {option.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={option.isCorrect ? 'font-medium text-green-800' : ''}>
                    {option.text}
                  </span>
                  {option.isCorrect && (
                    <Badge variant="outline" className="ml-auto text-green-600 border-green-600">
                      Poprawna
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correct Answer for fill_blank */}
      {taskData.type === 'fill_blank' && taskData.correct_answer && (
        <Card>
          <CardHeader>
            <CardTitle>Poprawna odpowiedź</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800">{taskData.correct_answer}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Statystyki zadania
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</div>
              <div className="text-sm text-muted-foreground">Prób rozwiązania</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.avgScore}%</div>
              <div className="text-sm text-muted-foreground">Średni wynik</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueStudents}</div>
              <div className="text-sm text-muted-foreground">Unikalnych uczniów</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-red-600">{stats.incorrectAttempts}</div>
              <div className="text-sm text-muted-foreground">Błędnych odpowiedzi</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GridBox>
        {/* Lesson Info */}
        {lesson && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Powiązana lekcja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                </div>
                {lesson.subject && (
                  <Badge variant="outline">{lesson.subject}</Badge>
                )}
                {lesson.grade && (
                  <Badge variant="secondary">{lesson.grade}</Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => edit("lessons", lesson.id)}>
                  <BookOpen className="w-4 h-4 mr-1" />
                  Zobacz lekcję
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article Info */}
        {article && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Powiązany artykuł
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{article.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {article.content ? `${article.content.substring(0, 100)}...` : 'Brak treści'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => edit("articles", article.id)}>
                  <FileText className="w-4 h-4 mr-1" />
                  Zobacz artykuł
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </GridBox>

      {/* Recent Incorrect Answers */}
      {incorrectAnswersList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Ostatnie błędne odpowiedzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incorrectAnswersList.slice(0, 10).map((incorrect) => (
                <div key={incorrect.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Użytkownik: {incorrect.user_id.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(incorrect.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    "{incorrect.given_answer}"
                  </p>
                </div>
              ))}
              {incorrectAnswersList.length > 10 && (
                <Button variant="ghost" className="w-full">
                  Zobacz wszystkie ({incorrectAnswersList.length})
                </Button>
              )}
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
              onClick={() => edit("tasks", id!)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edytuj zadanie
            </Button>
            {lesson && (
              <Button 
                variant="outline"
                onClick={() => edit("lessons", lesson.id)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Zobacz lekcję
              </Button>
            )}
            <Button variant="ghost">
              <Users className="w-4 h-4 mr-2" />
              Analizuj odpowiedzi
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
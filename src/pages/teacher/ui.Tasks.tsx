// src/pages/teacher/ui.Tasks.tsx
import { useTable, useNavigation, useDelete, useList, useGetIdentity } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Target, 
  BookOpen,
  Calendar,
  Star,
  CheckCircle,
  HelpCircle,
  List,
  Type
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";

type Identity = {
  id: string;
  email?: string;
  username?: string;
  role: 'teacher' | 'student';
};

export default function TeacherTasks() {
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Pobierz lekcje nauczyciela
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

  const teacherLessonIds = lessons?.data?.map(l => l.id) || [];

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
    setSorters,
  } = useTable({
    resource: "tasks",
    filters: {
      permanent: teacherLessonIds.length > 0 ? [
        {
          field: "lesson_id",
          operator: "in",
          value: teacherLessonIds,
        },
      ] : [],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteTask } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const lessonList = lessons?.data || [];

  const getLessonById = (lessonId: string) => {
    return lessonList.find(lesson => lesson.id === lessonId);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'single_choice': return <CheckCircle className="w-4 h-4" />;
      case 'multiple_choice': return <List className="w-4 h-4" />;
      case 'true_false': return <HelpCircle className="w-4 h-4" />;
      case 'fill_blank': return <Type className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
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

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'single_choice': return 'bg-blue-100 text-blue-800';
      case 'multiple_choice': return 'bg-green-100 text-green-800';
      case 'true_false': return 'bg-yellow-100 text-yellow-800';
      case 'fill_blank': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Moje zadania"
          description="Zarządzaj zadaniami i quizami w swoich lekcjach"
        />

        <Button onClick={() => create("tasks")}>
          <Plus className="w-4 h-4 mr-2" />
          Utwórz nowe zadanie
        </Button>
      </FlexBox>

       {/* Task Statistics */}
       {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Statystyki zadań</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich zadań</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(data.data.map((t: any) => t.lesson_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Lekcji z zadaniami</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(data.data.reduce((sum: number, t: any) => sum + (t.xp_reward || 0), 0) / data.data.length)}
                </div>
                <div className="text-sm text-muted-foreground">Średnie XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(data.data.map((t: any) => t.type)).size}
                </div>
                <div className="text-sm text-muted-foreground">Typów zadań</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Types Overview */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Podział typów zadań</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['single_choice', 'multiple_choice', 'true_false', 'fill_blank'].map(type => {
                const count = data.data.filter((t: any) => t.type === type).length;
                return (
                  <div key={type} className="text-center p-3 border rounded">
                    <div className="flex items-center justify-center mb-2">
                      {getTaskTypeIcon(type)}
                    </div>
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {getTaskTypeLabel(type)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <FlexBox>
        <Input
          placeholder="Szukaj zadań..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "question_text",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSorters([
            {
              field: "xp_reward",
              order: "desc",
            },
          ])}
        >
          <Star className="w-4 h-4 mr-2" />
          Sortuj wg XP
        </Button>
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak zadań</h3>
            <p className="text-muted-foreground mb-6">
              Nie masz jeszcze żadnych zadań. Utwórz pierwsze zadanie, aby dodać interaktywne elementy do swoich lekcji.
            </p>
            <Button onClick={() => create("tasks")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwsze zadanie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((task: any) => {
            const lesson = getLessonById(task.lesson_id);
            
            return (
              <Card key={task.id}>
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-2">
                      {getTaskTypeIcon(task.type)}
                      <Badge className={getTaskTypeColor(task.type)}>
                        {getTaskTypeLabel(task.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{task.xp_reward} XP</span>
                    </div>
                  </FlexBox>
                  <Lead
                    title={task.question_text.length > 50 ? `${task.question_text.substring(0, 50)}...` : task.question_text}
                    description={task.explanation ? `${task.explanation.substring(0, 80)}...` : 'Brak wyjaśnienia'}
                    variant="card"
                  />
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Lekcja
                      </span>
                      <Badge variant="outline">
                        {lesson?.title || 'Nieznana lekcja'}
                      </Badge>
                    </FlexBox>

                    {lesson?.subject && (
                      <FlexBox>
                        <span className="text-sm font-medium">Przedmiot</span>
                        <Badge variant="secondary">{lesson.subject}</Badge>
                      </FlexBox>
                    )}

                    <FlexBox>
                      <span className="text-sm font-medium">Typ zadania</span>
                      <div className="flex items-center gap-1">
                        {getTaskTypeIcon(task.type)}
                        <span className="text-sm">{getTaskTypeLabel(task.type)}</span>
                      </div>
                    </FlexBox>

                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Nagroda XP
                      </span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        {task.xp_reward} XP
                      </Badge>
                    </FlexBox>

                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Utworzone
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </FlexBox>

                    {/* Options count */}
                    {task.options && (
                      <FlexBox>
                        <span className="text-sm font-medium">Opcje odpowiedzi</span>
                        <Badge variant="outline">
                          {Array.isArray(task.options) ? task.options.length : Object.keys(task.options).length} opcji
                        </Badge>
                      </FlexBox>
                    )}

                    <div className="text-xs text-muted-foreground">
                      ID: #{task.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <FlexBox>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("tasks", task.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit("tasks", task.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </FlexBox>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm("Czy na pewno chcesz usunąć to zadanie? Ta akcja jest nieodwracalna.")
                      ) {
                        deleteTask({
                          resource: "tasks",
                          id: task.id,
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </GridBox>
      )}

     

      {/* Pagination */}
      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="zadań"
      />
    </>
  );
}
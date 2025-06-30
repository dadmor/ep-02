// src/pages/teacher/ui.Lessons.tsx
import { useTable, useNavigation, useDelete, useList } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  BookOpen, 
  Users,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  CheckCircle
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";

export default function TeacherLessons() {
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "lessons",
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  // Pobierz dane o artykułach i zadaniach dla każdej lekcji
  const { data: articles } = useList({
    resource: "articles",
    pagination: { mode: "off" },
  });

  const { data: tasks } = useList({
    resource: "tasks", 
    pagination: { mode: "off" },
  });

  // Pobierz postępy uczniów
  const { data: progress } = useList({
    resource: "progress",
    pagination: { mode: "off" },
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteLesson } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const articlesList = articles?.data || [];
  const tasksList = tasks?.data || [];
  const progressList = progress?.data || [];

  const getLessonStats = (lessonId: string) => {
    const lessonArticles = articlesList.filter(a => a.lesson_id === lessonId);
    const lessonTasks = tasksList.filter(t => t.lesson_id === lessonId);
    const lessonProgress = progressList.filter(p => p.lesson_id === lessonId);
    const avgScore = lessonProgress.length > 0 
      ? Math.round(lessonProgress.reduce((sum, p) => sum + p.score, 0) / lessonProgress.length)
      : 0;
    
    return {
      articleCount: lessonArticles.length,
      taskCount: lessonTasks.length,
      studentCount: lessonProgress.length,
      avgScore
    };
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'matematyka': 'bg-blue-100 text-blue-800 border-blue-200',
      'język polski': 'bg-green-100 text-green-800 border-green-200',
      'historia': 'bg-amber-100 text-amber-800 border-amber-200',
      'geografia': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'biologia': 'bg-lime-100 text-lime-800 border-lime-200',
      'chemia': 'bg-purple-100 text-purple-800 border-purple-200',
      'fizyka': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'informatyka': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[subject?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEducationLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'podstawowa': 'bg-green-100 text-green-700',
      'średnia': 'bg-blue-100 text-blue-700',
      'liceum': 'bg-purple-100 text-purple-700',
    };
    return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Lekcje"
          description="Zarządzaj lekcjami i materiałami edukacyjnymi"
        />

        <Button onClick={() => create("lessons")}>
          <Plus className="w-4 h-4 mr-2" />
          Utwórz nową lekcję
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj lekcji..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "title",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak lekcji</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze żadnych lekcji. Utwórz pierwszą lekcję, aby zacząć nauczanie.
            </p>
            <Button onClick={() => create("lessons")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszą lekcję
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((lesson: any) => {
            const stats = getLessonStats(lesson.id);
            
            return (
              <Card key={lesson.id}>
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          <BookOpen className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lesson.topic || 'Brak tematu'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getSubjectColor(lesson.subject)}
                    >
                      {lesson.subject || 'Brak przedmiotu'}
                    </Badge>
                  </FlexBox>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Artykuły
                        </span>
                        <Badge variant="outline">
                          {stats.articleCount}
                        </Badge>
                      </FlexBox>

                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Zadania
                        </span>
                        <Badge variant="outline">
                          {stats.taskCount}
                        </Badge>
                      </FlexBox>

                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Uczniowie
                        </span>
                        <Badge variant="outline">
                          {stats.studentCount}
                        </Badge>
                      </FlexBox>

                      <FlexBox>
                        <span className="text-sm font-medium">Śr. wynik</span>
                        <Badge 
                          variant="outline"
                          className={stats.avgScore >= 80 ? 'text-green-600 border-green-600' : 
                                   stats.avgScore >= 60 ? 'text-yellow-600 border-yellow-600' :
                                   'text-red-600 border-red-600'}
                        >
                          {stats.avgScore}%
                        </Badge>
                      </FlexBox>
                    </div>

                    <div className="space-y-2">
                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Poziom
                        </span>
                        <Badge 
                          variant="secondary"
                          className={getEducationLevelColor(lesson.education_level)}
                        >
                          {lesson.education_level || 'Nieokreślony'}
                        </Badge>
                      </FlexBox>

                      {lesson.grade && (
                        <FlexBox>
                          <span className="text-sm font-medium">Klasa</span>
                          <Badge variant="outline">
                            {lesson.grade}
                          </Badge>
                        </FlexBox>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Utworzono: {new Date(lesson.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <FlexBox>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("lessons", lesson.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit("lessons", lesson.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </FlexBox>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(`Czy na pewno chcesz usunąć lekcję "${lesson.title}"? Ta akcja jest nieodwracalna.`)
                      ) {
                        deleteLesson({
                          resource: "lessons",
                          id: lesson.id,
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

      {/* Statistics Cards */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich lekcji</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasksList.length}
                </div>
                <div className="text-sm text-muted-foreground">Zadań łącznie</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {articlesList.length}
                </div>
                <div className="text-sm text-muted-foreground">Artykułów łącznie</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(progressList.map(p => p.user_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Aktywnych uczniów</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-medium">Szybkie akcje</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("lessons")}
            >
              <BookOpen className="w-6 h-6" />
              <span>Utwórz nową lekcję</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("articles")}
            >
              <FileText className="w-6 h-6" />
              <span>Dodaj artykuł</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("tasks")}
            >
              <CheckCircle className="w-6 h-6" />
              <span>Utwórz zadanie</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="lekcji"
      />
    </>
  );
}
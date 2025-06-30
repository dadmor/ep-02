// src/pages/teacher/ui.StudentProgress.tsx - DOSTOSOWANE do tabeli progress
import { useTable, useNavigation, useGetIdentity, useList } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  TrendingUp, 
  Users,
  Star,
  Target,
  Calendar,
  BookOpen,
  Award,
  BarChart3,
  CheckCircle,
  Clock
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

export default function StudentProgress() {
  const { data: identity } = useGetIdentity<Identity>();

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "progress",
    sorters: {
      initial: [
        {
          field: "completed_at",
          order: "desc",
        },
      ],
    },
  });

  // Pobierz informacje o użytkownikach (uczniach)
  const { data: users } = useList({
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

  // Pobierz informacje o lekcjach
  const { data: lessons } = useList({
    resource: "lessons",
    pagination: { mode: "off" },
  });

  const { show } = useNavigation();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const userList = users?.data || [];
  const lessonList = lessons?.data || [];

  // Funkcje pomocnicze
  const getUserById = (userId: string) => {
    return userList.find(user => user.id === userId);
  };

  const getLessonById = (lessonId: string) => {
    return lessonList.find(lesson => lesson.id === lessonId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    if (score >= 60) return 'outline';
    return 'destructive';
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Postępy uczniów"
          description="Przeglądaj wyniki i postępy uczniów w lekcjach"
        />
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj po nazwie użytkownika..."
          className="max-w-sm"
          onChange={(e) => {
            const searchValue = e.target.value;
            if (searchValue) {
              // Znajdź użytkowników pasujących do wyszukiwania
              const matchingUsers = userList.filter(user => 
                user.username?.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchValue.toLowerCase())
              );
              const userIds = matchingUsers.map(user => user.id);
              
              if (userIds.length > 0) {
                setFilters([
                  {
                    field: "user_id",
                    operator: "in",
                    value: userIds,
                  },
                ]);
              }
            } else {
              setFilters([]);
            }
          }}
        />
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak postępów</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze żadnych ukończonych lekcji przez uczniów.
            </p>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((progress: any) => {
            const user = getUserById(progress.user_id);
            const lesson = getLessonById(progress.lesson_id);
            
            return (
              <Card key={progress.id}>
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user?.username || user?.email || 'UN')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-sm">{user?.username || 'Nieznany użytkownik'}</h3>
                        <p className="text-xs text-muted-foreground">
                          #{progress.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getScoreBadgeVariant(progress.score)}>
                      {progress.score}%
                    </Badge>
                  </FlexBox>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Lesson Info */}
                    {lesson && (
                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Lekcja
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {lesson.title}
                        </span>
                      </FlexBox>
                    )}

                    {/* Subject */}
                    {lesson?.subject && (
                      <FlexBox>
                        <span className="text-sm font-medium">Przedmiot</span>
                        <Badge variant="outline">{lesson.subject}</Badge>
                      </FlexBox>
                    )}

                    {/* Score Details */}
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Wynik
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.score} className="w-16" />
                        <span className={`text-sm font-medium ${getScoreColor(progress.score)}`}>
                          {progress.score}%
                        </span>
                      </div>
                    </FlexBox>

                    {/* Task Completion */}
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Zadania
                      </span>
                      <span className="text-sm">
                        {progress.correct_tasks}/{progress.total_tasks}
                      </span>
                    </FlexBox>

                    {/* Attempts */}
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Próby
                      </span>
                      <Badge variant="outline">{progress.attempts_count}</Badge>
                    </FlexBox>

                    {/* Streak Bonus */}
                    {progress.streak_bonus > 0 && (
                      <FlexBox>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Bonus za serię
                        </span>
                        <Badge variant="secondary" className="text-orange-600">
                          +{progress.streak_bonus}
                        </Badge>
                      </FlexBox>
                    )}

                    {/* Completion Date */}
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ukończono
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(progress.completed_at).toLocaleDateString()} {new Date(progress.completed_at).toLocaleTimeString()}
                      </span>
                    </FlexBox>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </GridBox>
      )}

      {/* Progress Statistics */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statystyki postępów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Ukończone lekcje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(data.data.reduce((sum: number, p: any) => sum + p.score, 0) / data.data.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Średni wynik</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.data.filter((p: any) => p.score >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Bardzo dobre wyniki</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.data.reduce((sum: number, p: any) => sum + (p.streak_bonus || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Łączne bonusy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="postępów"
      />
    </>
  );
}
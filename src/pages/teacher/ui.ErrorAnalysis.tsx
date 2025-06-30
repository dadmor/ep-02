// src/pages/teacher/ui.ErrorAnalysis.tsx
import { useTable, useList, useGetIdentity } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingDown, 
  Users,
  BookOpen,
  Target,
  BarChart3,
  Search,
  Filter,
  RefreshCw
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

export default function ErrorAnalysis() {
  const { data: identity } = useGetIdentity<Identity>();

  // Pobierz dane z view error_analysis
  const {
    tableQuery: { data, isLoading, isError, refetch },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "error_analysis",
    sorters: {
      initial: [
        {
          field: "error_count",
          order: "desc",
        },
      ],
    },
  });

  // Pobierz szczegółowe błędy z tabeli incorrect_answers
  const { data: incorrectAnswers } = useList({
    resource: "incorrect_answers",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  // Pobierz lekcje nauczyciela
  const { data: lessons } = useList({
    resource: "lessons",
    filters: identity?.id ? [
      {
        field: "author_id",
        operator: "eq",
        value: identity.id,
      },
    ] : [],
    pagination: { mode: "off" },
  });

  // Pobierz zadania
  const { data: tasks } = useList({
    resource: "tasks",
    pagination: { mode: "off" },
  });

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const errorAnalysisList = data?.data || [];
  const incorrectAnswersList = incorrectAnswers?.data || [];
  const lessonList = lessons?.data || [];
  const taskList = tasks?.data || [];

  // Filtruj błędy tylko dla lekcji nauczyciela
  const teacherLessonIds = lessonList.map(l => l.id);
  const teacherIncorrectAnswers = incorrectAnswersList.filter(ia => 
    teacherLessonIds.includes(ia.lesson_id)
  );

  // Statystyki ogólne
  const totalErrors = teacherIncorrectAnswers.length;
  const uniqueStudentsWithErrors = new Set(teacherIncorrectAnswers.map(ia => ia.user_id)).size;
  const mostProblematicSubjects = errorAnalysisList
    .filter(ea => ea.subject)
    .sort((a, b) => b.error_count - a.error_count)
    .slice(0, 3);

  const getErrorRate = (errorCount: number, studentsWithErrors: number) => {
    if (studentsWithErrors === 0) return 0;
    return Math.round((errorCount / studentsWithErrors) * 100);
  };

  const getSeverityColor = (errorCount: number) => {
    if (errorCount >= 10) return 'text-red-600 bg-red-50';
    if (errorCount >= 5) return 'text-orange-600 bg-orange-50';
    if (errorCount >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getSeverityBadge = (errorCount: number) => {
    if (errorCount >= 10) return 'destructive';
    if (errorCount >= 5) return 'secondary';
    if (errorCount >= 2) return 'outline';
    return 'default';
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Analiza błędów uczniów"
          description="Identyfikuj najczęstsze problemy i obszary wymagające poprawy"
        />
        
        <Button 
          variant="outline"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Odśwież dane
        </Button>
      </FlexBox>

      {/* Statystyki ogólne */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{totalErrors}</div>
                <div className="text-sm text-muted-foreground">Błędnych odpowiedzi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{uniqueStudentsWithErrors}</div>
                <div className="text-sm text-muted-foreground">Uczniów z błędami</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{errorAnalysisList.length}</div>
                <div className="text-sm text-muted-foreground">Problemów zidentyfikowanych</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {totalErrors > 0 ? Math.round(totalErrors / uniqueStudentsWithErrors) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Śr. błędów na ucznia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtry analizy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlexBox>
            <Input
              placeholder="Szukaj po temacie lub pytaniu..."
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
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Zaawansowane filtry
            </Button>
          </FlexBox>
        </CardContent>
      </Card>

      {/* Najczęstsze problemy */}
      {mostProblematicSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Najbardziej problematyczne przedmioty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostProblematicSubjects.map((subject, index) => (
                <div key={`${subject.subject}-${index}`} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{subject.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {subject.students_with_errors} uczniów ma problemy
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{subject.error_count}</div>
                    <div className="text-sm text-muted-foreground">błędów</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista błędów */}
      {errorAnalysisList.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak danych o błędach</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze wystarczających danych do analizy błędów lub uczniowie nie popełnili jeszcze błędów.
            </p>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {errorAnalysisList.map((error: any, index: number) => (
            <Card key={`${error.subject}-${error.topic}-${index}`}>
              <CardHeader>
                <FlexBox>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <Badge variant={getSeverityBadge(error.error_count)}>
                      {error.error_count} błędów
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {error.students_with_errors} uczniów
                  </Badge>
                </FlexBox>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {error.subject && (
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Przedmiot
                      </span>
                      <Badge variant="secondary">{error.subject}</Badge>
                    </FlexBox>
                  )}

                  {error.topic && (
                    <FlexBox>
                      <span className="text-sm font-medium">Temat</span>
                      <span className="text-sm">{error.topic}</span>
                    </FlexBox>
                  )}

                  {error.question_text && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Pytanie z problemami:</h4>
                      <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {error.question_text.length > 150 
                          ? `${error.question_text.substring(0, 150)}...` 
                          : error.question_text
                        }
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <FlexBox>
                      <span className="text-sm font-medium">Poziom problemu</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.error_count)}`}>
                        {error.error_count >= 10 ? 'Krytyczny' :
                         error.error_count >= 5 ? 'Wysoki' :
                         error.error_count >= 2 ? 'Średni' : 'Niski'}
                      </div>
                    </FlexBox>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Wskaźnik błędów</span>
                        <span>{getErrorRate(error.error_count, error.students_with_errors)}%</span>
                      </div>
                      <Progress 
                        value={getErrorRate(error.error_count, error.students_with_errors)} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Błędów: {error.error_count}</span>
                      <span>Uczniów: {error.students_with_errors}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </GridBox>
      )}

      {/* Rekomendacje */}
      {errorAnalysisList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Rekomendacje działań
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Materiały dodatkowe</h4>
                <p className="text-sm text-blue-700">
                  Rozważ stworzenie dodatkowych artykułów wyjaśniających najbardziej problematyczne tematy.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <h4 className="font-medium text-green-900">Ćwiczenia praktyczne</h4>
                <p className="text-sm text-green-700">
                  Dodaj więcej zadań ćwiczeniowych dla obszarów z wysokim wskaźnikiem błędów.
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <h4 className="font-medium text-orange-900">Indywidualne wsparcie</h4>
                <p className="text-sm text-orange-700">
                  Uczniowie z powtarzającymi się błędami mogą potrzebować dodatkowego wsparcia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {errorAnalysisList.length > 0 && (
        <PaginationSwith
          current={current}
          pageSize={pageSize}
          total={data?.total || 0}
          setCurrent={setCurrent}
          itemName="problemów"
        />
      )}
    </>
  );
}
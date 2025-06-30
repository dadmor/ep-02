// src/pages/teacher/ui.Articles.tsx
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
  FileText, 
  BookOpen,
  Calendar,
  ArrowUpDown
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

export default function TeacherArticles() {
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
    resource: "articles",
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
  const { mutate: deleteArticle } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const lessonList = lessons?.data || [];

  const getLessonById = (lessonId: string) => {
    return lessonList.find(lesson => lesson.id === lessonId);
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Moje artykuły"
          description="Zarządzaj artykułami w swoich lekcjach"
        />

        <Button onClick={() => create("articles")}>
          <Plus className="w-4 h-4 mr-2" />
          Utwórz nowy artykuł
        </Button>
      </FlexBox>

        {/* Article Statistics */}
        {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Statystyki artykułów</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich artykułów</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(data.data.map((a: any) => a.lesson_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Lekcji z artykułami</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(data.data.reduce((sum: number, a: any) => sum + (a.content?.length || 0), 0) / data.data.length)}
                </div>
                <div className="text-sm text-muted-foreground">Średnia długość</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.data.filter((a: any) => new Date(a.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </div>
                <div className="text-sm text-muted-foreground">Nowych (7 dni)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <FlexBox>
        <Input
          placeholder="Szukaj artykułów..."
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSorters([
            {
              field: "sort_order",
              order: "asc",
            },
          ])}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Sortuj wg kolejności
        </Button>
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak artykułów</h3>
            <p className="text-muted-foreground mb-6">
              Nie masz jeszcze żadnych artykułów. Utwórz pierwszy artykuł, aby dodać treści do swoich lekcji.
            </p>
            <Button onClick={() => create("articles")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszy artykuł
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((article: any) => {
            const lesson = getLessonById(article.lesson_id);
            
            return (
              <Card key={article.id}>
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <Badge variant="outline">
                        #{article.sort_order || 'N/A'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      #{article.id.slice(0, 8)}
                    </span>
                  </FlexBox>
                  <Lead
                    title={article.title}
                    description={article.content ? `${article.content.substring(0, 100)}...` : 'Brak treści'}
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
                      <span className="text-sm font-medium">Kolejność</span>
                      <span className="text-sm text-muted-foreground">
                        {article.sort_order || 'Nie ustawiono'}
                      </span>
                    </FlexBox>

                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Utworzony
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </FlexBox>

                    <div className="text-xs text-muted-foreground">
                      Długość: {article.content ? article.content.length : 0} znaków
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <FlexBox>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("articles", article.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit("articles", article.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </FlexBox>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm("Czy na pewno chcesz usunąć ten artykuł? Ta akcja jest nieodwracalna.")
                      ) {
                        deleteArticle({
                          resource: "articles",
                          id: article.id,
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
        itemName="artykułów"
      />
    </>
  );
}
// src/pages/teacher/ui.Lessons.tsx - DOSTOSOWANE do istniejącej bazy
import { useTable, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
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
  BookOpen, 
  GraduationCap,
  Calendar,
  User,
  FileText
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

export default function TeacherLessons() {
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "lessons",
    filters: {
      permanent: userId ? [
        {
          field: "author_id", // To jest prawidłowe pole w Twojej bazie
          operator: "eq",
          value: userId,
        },
      ] : [],
    },
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteLesson } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  return (
    <>
      <FlexBox>
        <Lead
          title="Moje lekcje"
          description="Zarządzaj swoimi lekcjami i materiałami edukacyjnymi"
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
              Nie masz jeszcze żadnych lekcji. Utwórz swoją pierwszą lekcję, aby rozpocząć nauczanie.
            </p>
            <Button onClick={() => create("lessons")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszą lekcję
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((lesson: any) => (
            <Card key={lesson.id}>
              <CardHeader>
                <FlexBox>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <Badge variant="outline">
                      {lesson.subject || 'Brak przedmiotu'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    #{lesson.id.slice(0, 8)}
                  </span>
                </FlexBox>
                <Lead
                  title={lesson.title}
                  description={lesson.description}
                  variant="card"
                />
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {lesson.subject && (
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Przedmiot
                      </span>
                      <Badge variant="outline">{lesson.subject}</Badge>
                    </FlexBox>
                  )}

                  {lesson.grade && (
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        Klasa
                      </span>
                      <Badge variant="outline">{lesson.grade}</Badge>
                    </FlexBox>
                  )}

                  {lesson.education_level && (
                    <FlexBox>
                      <span className="text-sm font-medium">Poziom</span>
                      <Badge variant="secondary">{lesson.education_level}</Badge>
                    </FlexBox>
                  )}

                  {lesson.topic && (
                    <FlexBox>
                      <span className="text-sm font-medium">Temat</span>
                      <span className="text-sm text-muted-foreground">{lesson.topic}</span>
                    </FlexBox>
                  )}

                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Utworzona
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </span>
                  </FlexBox>
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
                      confirm("Czy na pewno chcesz usunąć tę lekcję? Ta akcja jest nieodwracalna.")
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
          ))}
        </GridBox>
      )}

      {/* Pagination */}
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
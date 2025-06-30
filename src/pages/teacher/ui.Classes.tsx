// src/pages/teacher/ui.Classes.tsx - DOSTOSOWANE do istniejącej tabeli classes
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
import { Eye, Edit, Trash2, Plus, Users, Calendar, BookOpen, GraduationCap } from "lucide-react";
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

export default function TeacherClasses() {
  const { data: identity } = useGetIdentity<Identity>();

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "classes",
    // Nie filtrujemy po teacher_id bo nie ma takiego pola w istniejącej tabeli
    // Pokazujemy wszystkie klasy dostępne w systemie
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteClass } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  return (
    <>
      <FlexBox>
        <Lead
          title="Klasy"
          description="Zarządzaj klasami w systemie"
        />

        <Button onClick={() => create("classes")}>
          <Plus className="w-4 h-4 mr-2" />
          Utwórz nową klasę
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj klas..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "name",
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
            <h3 className="text-lg font-medium mb-2">Brak klas</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze żadnych klas w systemie. Utwórz pierwszą klasę, aby rozpocząć.
            </p>
            <Button onClick={() => create("classes")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszą klasę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((classItem: any) => (
            <Card key={classItem.id}>
              <CardHeader>
                <FlexBox>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <Badge variant="outline">
                      {classItem.grade}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    #{classItem.id.slice(0, 8)}
                  </span>
                </FlexBox>
                <Lead
                  title={classItem.name}
                  description={`Rok szkolny ${classItem.education_year}`}
                  variant="card"
                />
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Klasa
                    </span>
                    <Badge variant="outline">{classItem.grade}</Badge>
                  </FlexBox>

                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Rok szkolny
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {classItem.education_year}
                    </span>
                  </FlexBox>

                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Utworzona
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(classItem.created_at).toLocaleDateString()}
                    </span>
                  </FlexBox>

                  {/* Możemy pokazać liczbę przypisanych uczniów jeśli mamy relację */}
                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Status
                    </span>
                    <Badge variant="default">Aktywna</Badge>
                  </FlexBox>
                </div>
              </CardContent>

              <CardFooter>
                <FlexBox>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => show("classes", classItem.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => edit("classes", classItem.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </FlexBox>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm("Czy na pewno chcesz usunąć tę klasę? Ta akcja jest nieodwracalna.")
                    ) {
                      deleteClass({
                        resource: "classes",
                        id: classItem.id,
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

      {/* Class Statistics */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Statystyki klas</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich klas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(data.data.map((c: any) => c.grade)).size}
                </div>
                <div className="text-sm text-muted-foreground">Różnych poziomów</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(data.data.map((c: any) => c.education_year)).size}
                </div>
                <div className="text-sm text-muted-foreground">Lat szkolnych</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.data.filter((c: any) => new Date(c.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length}
                </div>
                <div className="text-sm text-muted-foreground">Nowych (30 dni)</div>
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
        itemName="klas"
      />
    </>
  );
}
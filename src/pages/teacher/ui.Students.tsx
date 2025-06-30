// src/pages/teacher/ui.Students.tsx - DOSTOSOWANE do tabeli users
import { useTable, useNavigation, useGetIdentity } from "@refinedev/core";
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
  Mail, 
  GraduationCap, 
  Award,
  TrendingUp,
  Users,
  Star,
  Flame
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

export default function TeacherStudents() {
  const { data: identity } = useGetIdentity<Identity>();

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "users",
    filters: {
      permanent: [
        {
          field: "role",
          operator: "eq",
          value: "student", // Filtrujemy tylko uczniów
        },
      ],
    },
  });

  const { show } = useNavigation();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Uczniowie"
          description="Przeglądaj postępy swoich uczniów"
        />
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj uczniów..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "username",
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
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak uczniów</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze żadnych uczniów w systemie.
            </p>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((student: any) => (
            <Card key={student.id}>
              <CardHeader>
                <FlexBox>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback>
                        {getInitials(student.username || student.email || 'UN')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{student.username || 'Bez nazwy'}</h3>
                      <p className="text-sm text-muted-foreground">
                        #{student.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">
                    Poziom {student.level || 1}
                  </Badge>
                </FlexBox>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {student.email}
                    </span>
                  </FlexBox>

                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Poziom
                    </span>
                    <Badge variant="secondary">
                      Poziom {student.level || 1}
                    </Badge>
                  </FlexBox>

                  <FlexBox>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Punkty XP
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {student.xp || 0} XP
                    </span>
                  </FlexBox>

                  {student.streak > 0 && (
                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        Seria dni
                      </span>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        🔥 {student.streak}
                      </Badge>
                    </FlexBox>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Dołączył: {new Date(student.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <FlexBox>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => show("users", student.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Zobacz profil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => show("progress", student.id)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Postępy
                  </Button>
                </FlexBox>
              </CardFooter>
            </Card>
          ))}
        </GridBox>
      )}

      {/* Student Statistics */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Statystyki uczniów</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich uczniów</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(data.data.reduce((sum: number, s: any) => sum + (s.xp || 0), 0) / data.data.length)}
                </div>
                <div className="text-sm text-muted-foreground">Średnie XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(data.data.reduce((sum: number, s: any) => sum + (s.level || 1), 0) / data.data.length * 10) / 10}
                </div>
                <div className="text-sm text-muted-foreground">Średni poziom</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.data.filter((s: any) => (s.streak || 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Z serią</div>
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
        itemName="uczniów"
      />
    </>
  );
}
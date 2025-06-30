// src/pages/teacher/ui.ClassEnrollments.tsx
import { useTable, useNavigation, useCreate, useDelete, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  UserMinus, 
  Search, 
  Users, 
  ArrowLeft,
  Check,
  Mail,
  Trophy,
  Zap
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { CrudFilter } from "@refinedev/core";

interface User {
  id: string;
  username: string;
  email: string;
  role: 'teacher' | 'student';
  xp: number;
  level: number;
  streak: number;
  created_at: string;
}

interface ClassEnrollment {
  id: string;
  user_id: string;
  class_id: string;
  enrolled_at: string;
  left_at?: string;
}

interface ClassData {
  id: string;
  name: string;
  education_year: number;
  grade: string;
}

export default function ClassEnrollments() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { goBack, list } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Pobierz informacje o klasie z różnych źródeł
  const classIdFromState = location.state?.classId;
  const classIdFromParams = searchParams.get('classId');
  const classNameFromState = location.state?.className;
  
  const classId = classIdFromState || classIdFromParams || selectedClassId;

  // Pobierz wszystkie klasy dla selectora
  const { data: allClassesData } = useList({
    resource: "classes",
  });

  // Pobierz wszystkich uczniów (role = 'student')
  const {
    tableQuery: { data: usersData, isLoading: usersLoading, isError: usersError },
  } = useTable({
    resource: "users",
    filters: {
      initial: [
        {
          field: "role",
          operator: "eq" as const,
          value: "student",
        },
        ...(searchTerm ? [{
          field: "username",
          operator: "contains" as const,
          value: searchTerm,
        }] : [])
      ] as CrudFilter[]
    },
  });

  // Pobierz aktualnych uczniów w klasie
  const { data: enrollmentsData } = useList({
    resource: "class_enrollments",
    filters: [
      ...(classId ? [{
        field: "class_id",
        operator: "eq" as const,
        value: classId,
      }, {
        field: "left_at",
        operator: "null" as const,
        value: null,
      }] : [])
    ] as CrudFilter[],
  });

  // Pobierz informacje o klasie
  const { data: classData } = useList({
    resource: "classes",
    filters: [
      ...(classId ? [{
        field: "id",
        operator: "eq" as const,
        value: classId,
      }] : [])
    ] as CrudFilter[],
  });

  const { mutate: createEnrollment } = useCreate();
  const { mutate: deleteEnrollment } = useDelete();

  const init = useLoading({ isLoading: usersLoading, isError: usersError });
  if (init) return init;

  const students = (usersData?.data as User[]) || [];
  const enrollments = (enrollmentsData?.data as ClassEnrollment[]) || [];
  const currentClass = (classData?.data?.[0] as ClassData) || null;
  const allClasses = (allClassesData?.data as ClassData[]) || [];
  const className = classNameFromState || currentClass?.name;
  
  // Lista ID uczniów już zapisanych do klasy
  const enrolledStudentIds = new Set(enrollments.map(e => e.user_id));

  const handleEnrollStudent = (studentId: string) => {
    if (!classId) return;
    
    createEnrollment({
      resource: "class_enrollments",
      values: {
        user_id: studentId,
        class_id: classId,
        enrolled_at: new Date().toISOString(),
      }
    }, {
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  const handleUnenrollStudent = (enrollmentId: string) => {
    deleteEnrollment({
      resource: "class_enrollments",
      id: enrollmentId,
    }, {
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  const availableStudents = students.filter(student => !enrolledStudentIds.has(student.id));
  const enrolledStudents = students.filter(student => enrolledStudentIds.has(student.id));

  return (
    <>
      <FlexBox>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
          <Lead
            title="Zarządzanie uczniami w klasach"
            description={classId ? `Klasa: ${className || currentClass?.name || 'Nieznana klasa'}` : "Wybierz klasę aby zarządzać uczniami"}
          />
        </div>
        {!classId && (
          <Button onClick={() => list("classes")}>
            Zobacz wszystkie klasy
          </Button>
        )}
      </FlexBox>

      {/* Class Selector - pokazujemy tylko gdy nie ma classId */}
      {!classId && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz klasę</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {allClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedClassId(cls.id)}
                >
                  <div>
                    <h4 className="font-medium">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cls.grade} • Rok {cls.education_year}
                    </p>
                  </div>
                  <Button size="sm">
                    Zarządzaj uczniami
                  </Button>
                </div>
              ))}
              {allClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Brak dostępnych klas</p>
                  <Button className="mt-2" onClick={() => list("classes")}>
                    Utwórz pierwszą klasę
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - pokazujemy tylko gdy jest classId */}
      {classId && (
        <>
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj uczniów po nazwie użytkownika..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Uczniowie w klasie ({enrolledStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length > 0 ? (
                <div className="grid gap-4">
                  {enrolledStudents.map((student) => {
                    const enrollment = enrollments.find(e => e.user_id === student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{student.username}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                Level {student.level}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                {student.xp} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Zapisany
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => enrollment && handleUnenrollStudent(enrollment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak uczniów w klasie</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Dostępni uczniowie ({availableStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableStudents.length > 0 ? (
                <div className="grid gap-4">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{student.username}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              Level {student.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {student.xp} XP
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Streak: {student.streak}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEnrollStudent(student.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Zapisz do klasy
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak dostępnych uczniów</p>
                  <p className="text-sm">Wszyscy uczniowie są już w klasie lub nie ma uczniów w systemie</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {enrolledStudents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Uczniów w klasie</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {availableStudents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dostępnych uczniów</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {enrolledStudents.reduce((sum, s) => sum + s.xp, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Łączne XP klasy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {enrolledStudents.length > 0 
                      ? Math.round(enrolledStudents.reduce((sum, s) => sum + s.level, 0) / enrolledStudents.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Średni poziom</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
// src/pages/teacher/ui.ClassShow.tsx - NAPRAWIONY
import { useShow, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
  BookOpen, 
  MapPin,
  GraduationCap,
  Plus,
  Eye,
  FileText,
  UserPlus,
  BookOpenCheck
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useParams } from "react-router-dom";

// Definicje typów zgodne z rzeczywistą bazą danych
interface ClassData {
  id: string;
  name: string;
  education_year: number;
  grade: string;
  created_at: string;
}

interface ClassEnrollment {
  id: string;
  user_id: string;
  class_id: string;
  enrolled_at: string;
  left_at?: string;
  // Joined data from users table
  user?: {
    id: string;
    username: string;
    email: string;
    xp: number;
    level: number;
    streak: number;
  };
}

interface ClassLesson {
  class_id: string;
  lesson_id: string;
  // Joined data from lessons table
  lesson?: {
    id: string;
    title: string;
    description: string;
    subject: string;
    education_level: string;
    grade: string;
    topic: string;
    created_at: string;
  };
}

export default function ClassShow() {
  const { id } = useParams();
  const { goBack, edit, create, push } = useNavigation();
  
  const { queryResult } = useShow({
    resource: "classes",
    id: id!,
  });

  // Pobierz uczniów w tej klasie - używamy class_enrollments
  const { data: enrollmentsResult } = useList({
    resource: "class_enrollments",
    filters: [
      {
        field: "class_id",
        operator: "eq",
        value: id,
      },
      {
        field: "left_at",
        operator: "null",
        value: null,
      }
    ],
    meta: {
      // W prawdziwej aplikacji tutaj byłoby JOIN z tabelą users
      // Na razie zakładamy że mamy dostęp do danych użytkownika
    }
  });

  // Pobierz lekcje przypisane do tej klasy
  const { data: lessonsResult } = useList({
    resource: "class_lessons",
    filters: [
      {
        field: "class_id",
        operator: "eq",
        value: id,
      },
    ],
    meta: {
      // W prawdziwej aplikacji tutaj byłoby JOIN z tabelą lessons
    }
  });

  // Poprawna destrukturyzacja danych
  const classData = queryResult.data?.data as ClassData | undefined;
  const isLoading = queryResult.isLoading;
  const enrollmentList = (enrollmentsResult?.data as ClassEnrollment[]) || [];
  const lessonList = (lessonsResult?.data as ClassLesson[]) || [];

  // Funkcje do dodawania uczniów i lekcji
  const handleAddStudent = () => {
    // Przechodzimy do dedykowanego komponentu zarządzania zapisami
    push("/teacher/enrollments", "push", { 
      state: { 
        action: "enroll", 
        classId: id, 
        className: classData?.name 
      } 
    });
  };

  const handleAddLesson = () => {
    // Przechodzimy do dedykowanego komponentu zarządzania lekcjami w klasie
    push("/teacher/class-lessons", "push", { 
      state: { 
        action: "assign", 
        classId: id, 
        className: classData?.name 
      } 
    });
  };

  const handleCreateLesson = () => {
    // Tworzymy nową lekcję z pre-wypełnionymi danymi klasy
    create("lessons", "push", {
      defaultValues: {
        education_level: classData?.grade,
        grade: classData?.grade,
        // Automatycznie przypisz do tej klasy po utworzeniu
        assignToClass: id
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Klasa nie została znaleziona</h3>
          <p className="text-muted-foreground mb-4">
            Nie można znaleźć klasy o podanym identyfikatorze.
          </p>
          <Button onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
        </CardContent>
      </Card>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
            <p className="text-muted-foreground">
              {classData.grade} • Rok szkolny {classData.education_year}
            </p>
          </div>
        </div>
        <Button onClick={() => edit("classes", classData.id)}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj klasę
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Informacje o klasie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Nazwa klasy</h4>
              <p className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {classData.name}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Poziom</h4>
              <p>{classData.grade}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Rok szkolny</h4>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {classData.education_year}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Data utworzenia</h4>
              <p>{new Date(classData.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <GridBox variant="1-2-2">
        {/* Students Card */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Uczniowie ({enrollmentList.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddStudent}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Przypisz ucznia
                </Button>
              </div>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {enrollmentList.length > 0 ? (
              <div className="space-y-3">
                {enrollmentList.slice(0, 5).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium">
                        {enrollment.user?.username || `User ${enrollment.user_id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.user?.email || "Email niedostępny"}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Level {enrollment.user?.level || 1}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {enrollment.user?.xp || 0} XP
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {enrollmentList.length > 5 && (
                  <Button variant="ghost" className="w-full" onClick={handleAddStudent}>
                    Zobacz wszystkich ({enrollmentList.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak uczniów</p>
                <p className="text-sm mb-4">Przypisz pierwszego ucznia do klasy</p>
                <Button onClick={handleAddStudent}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Przypisz ucznia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons Card */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5" />
                Lekcje ({lessonList.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleAddLesson}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Przypisz lekcję
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreateLesson}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Utwórz nową
                </Button>
              </div>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {lessonList.length > 0 ? (
              <div className="space-y-3">
                {lessonList.slice(0, 5).map((classLesson) => (
                  <div key={`${classLesson.class_id}-${classLesson.lesson_id}`} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {classLesson.lesson?.title || `Lekcja ${classLesson.lesson_id.slice(0, 8)}`}
                      </p>
                      <Badge variant="outline">
                        {classLesson.lesson?.subject || "Brak przedmiotu"}
                      </Badge>
                    </div>
                    {classLesson.lesson?.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {classLesson.lesson.description.slice(0, 100)}...
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => push(`/teacher/lessons/${classLesson.lesson_id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Zobacz
                      </Button>
                    </div>
                  </div>
                ))}
                {lessonList.length > 5 && (
                  <Button variant="ghost" className="w-full" onClick={handleAddLesson}>
                    Zobacz wszystkie ({lessonList.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpenCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak lekcji</p>
                <p className="text-sm mb-4">Przypisz lub utwórz pierwszą lekcję dla klasy</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleAddLesson}>
                    <Plus className="w-4 h-4 mr-2" />
                    Przypisz istniejącą
                  </Button>
                  <Button onClick={handleCreateLesson}>
                    <Plus className="w-4 h-4 mr-2" />
                    Utwórz nową
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </GridBox>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statystyki klasy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {enrollmentList.length}
              </div>
              <div className="text-sm text-muted-foreground">Uczniów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {lessonList.length}
              </div>
              <div className="text-sm text-muted-foreground">Lekcji</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {enrollmentList.reduce((sum, e) => sum + (e.user?.xp || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Łączne XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {enrollmentList.length > 0 
                  ? Math.round(enrollmentList.reduce((sum, e) => sum + (e.user?.level || 1), 0) / enrollmentList.length)
                  : 0
                }
              </div>
              <div className="text-sm text-muted-foreground">Średni level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={() => edit("classes", classData.id)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edytuj klasę
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddStudent}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Przypisz ucznia
            </Button>
            <Button 
              variant="outline"
              onClick={handleCreateLesson}
            >
              <BookOpenCheck className="w-4 h-4 mr-2" />
              Utwórz lekcję
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddLesson}
            >
              <Plus className="w-4 h-4 mr-2" />
              Przypisz lekcję
            </Button>
            <Button 
              variant="ghost"
              onClick={() => push("/teacher/progress", "push", { 
                state: { classId: id, className: classData.name } 
              })}
            >
              <FileText className="w-4 h-4 mr-2" />
              Zobacz postępy
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
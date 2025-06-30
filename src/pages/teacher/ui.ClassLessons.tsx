// src/pages/teacher/ui.ClassLessons.tsx
import { useTable, useNavigation, useCreate, useDelete, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpenCheck, 
  BookX, 
  Search, 
  ArrowLeft,
  Plus,
  Eye,
  FileText,
  Calendar,
  Target
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { CrudFilter } from "@refinedev/core";

interface Lesson {
  id: string;
  title: string;
  description: string;
  author_id: string;
  subject: string;
  education_level: string;
  grade: string;
  topic: string;
  created_at: string;
}

interface ClassLesson {
  class_id: string;
  lesson_id: string;
}

interface ClassData {
  id: string;
  name: string;
  education_year: number;
  grade: string;
}

export default function ClassLessons() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { goBack, show, create, list } = useNavigation();
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

  // Pobierz wszystkie lekcje
  const {
    tableQuery: { data: lessonsData, isLoading: lessonsLoading, isError: lessonsError },
  } = useTable({
    resource: "lessons",
    filters: {
      initial: [
        ...(searchTerm ? [{
          field: "title",
          operator: "contains" as const,
          value: searchTerm,
        }] : [])
      ] as CrudFilter[]
    },
  });

  // Pobierz aktualne przypisania lekcji do klasy
  const { data: classLessonsData } = useList({
    resource: "class_lessons",
    filters: [
      ...(classId ? [{
        field: "class_id",
        operator: "eq" as const,
        value: classId,
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

  const { mutate: createClassLesson } = useCreate();
  const { mutate: deleteClassLesson } = useDelete();

  const init = useLoading({ isLoading: lessonsLoading, isError: lessonsError });
  if (init) return init;

  const lessons = (lessonsData?.data as Lesson[]) || [];
  const classLessons = (classLessonsData?.data as ClassLesson[]) || [];
  const currentClass = (classData?.data?.[0] as ClassData) || null;
  const allClasses = (allClassesData?.data as ClassData[]) || [];
  const className = classNameFromState || currentClass?.name;
  
  // Lista ID lekcji już przypisanych do klasy
  const assignedLessonIds = new Set(classLessons.map(cl => cl.lesson_id));

  const handleAssignLesson = (lessonId: string) => {
    if (!classId) return;
    
    createClassLesson({
      resource: "class_lessons",
      values: {
        class_id: classId,
        lesson_id: lessonId,
      }
    }, {
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  const handleUnassignLesson = (lessonId: string) => {
    // Znajdź rekord do usunięcia
    const classLessonToDelete = classLessons.find(cl => cl.lesson_id === lessonId);
    if (classLessonToDelete) {
      deleteClassLesson({
        resource: "class_lessons",
        id: `${classLessonToDelete.class_id}-${classLessonToDelete.lesson_id}`,
      }, {
        onSuccess: () => {
          window.location.reload();
        }
      });
    }
  };

  const assignedLessons = lessons.filter(lesson => assignedLessonIds.has(lesson.id));
  const availableLessons = lessons.filter(lesson => !assignedLessonIds.has(lesson.id));

  return (
    <>
      <FlexBox>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
          <Lead
            title="Zarządzanie lekcjami w klasach"
            description={classId ? `Klasa: ${className || currentClass?.name || 'Nieznana klasa'}` : "Wybierz klasę aby zarządzać lekcjami"}
          />
        </div>
        <div className="flex gap-2">
          {!classId && (
            <Button onClick={() => list("classes")}>
              Zobacz wszystkie klasy
            </Button>
          )}
          {classId && (
            <Button 
              onClick={() => create("lessons", "push", {
                defaultValues: {
                  education_level: currentClass?.grade,
                  grade: currentClass?.grade,
                }
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Utwórz nową lekcję
            </Button>
          )}
        </div>
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
                    Zarządzaj lekcjami
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
                  placeholder="Szukaj lekcji po tytule..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-green-600" />
                Przypisane lekcje ({assignedLessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedLessons.length > 0 ? (
                <div className="grid gap-4">
                  {assignedLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-lg">{lesson.title}</h4>
                          <Badge variant="default" className="bg-green-600 ml-2">
                            ✓ Przypisana
                          </Badge>
                        </div>
                        
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {lesson.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            📚 {lesson.grade}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            🎯 {lesson.topic}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => show("lessons", lesson.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Zobacz szczegóły
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignLesson(lesson.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <BookX className="w-4 h-4 mr-1" />
                            Usuń z klasy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpenCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak przypisanych lekcji</p>
                  <p className="text-sm">Przypisz pierwszą lekcję do klasy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Dostępne lekcje ({availableLessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableLessons.length > 0 ? (
                <div className="grid gap-4">
                  {availableLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-lg">{lesson.title}</h4>
                          <Badge variant="outline" className="ml-2">
                            Dostępna
                          </Badge>
                        </div>
                        
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {lesson.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            📚 {lesson.grade}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            🎯 {lesson.topic}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAssignLesson(lesson.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Przypisz do klasy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => show("lessons", lesson.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Zobacz szczegóły
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak dostępnych lekcji</p>
                  <p className="text-sm">Wszystkie lekcje są już przypisane do klasy lub nie ma lekcji w systemie</p>
                  <Button 
                    className="mt-4"
                    onClick={() => create("lessons", "push", {
                      defaultValues: {
                        education_level: currentClass?.grade,
                        grade: currentClass?.grade,
                      }
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Utwórz pierwszą lekcję
                  </Button>
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
                    {assignedLessons.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Przypisanych lekcji</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {availableLessons.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dostępnych lekcji</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(assignedLessons.map(l => l.subject)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Różnych przedmiotów</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(assignedLessons.map(l => l.topic)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Różnych tematów</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
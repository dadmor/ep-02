// src/pages/teacher/ui.ClassShow.tsx
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
  FileText
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useParams } from "react-router-dom";

// Definicje typów
interface ClassData {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  school_year?: string;
  room?: string;
  status?: "active" | "inactive" | "archived";
  notes?: string;
  education_year?: number;
  created_at?: string;
  updated_at?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class_id?: string;
}

interface Assignment {
  id: string;
  title: string;
  status: string;
  due_date: string;
  class_id?: string;
}

export default function ClassShow() {
  const { id } = useParams();
  const { goBack, edit, create } = useNavigation();
  
  const { queryResult } = useShow({
    resource: "classes",
    id: id!,
  });

  // Pobierz uczniów w tej klasie
  const { data: studentsResult } = useList({
    resource: "students",
    filters: [
      {
        field: "class_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  // Pobierz zadania dla tej klasy
  const { data: assignmentsResult } = useList({
    resource: "assignments",
    filters: [
      {
        field: "class_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  // Poprawna destrukturyzacja danych
  const classData = queryResult.data?.data as ClassData | undefined;
  const isLoading = queryResult.isLoading;
  const studentList = (studentsResult?.data as Student[]) || [];
  const assignmentList = (assignmentsResult?.data as Assignment[]) || [];

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
            <p className="text-muted-foreground">Szczegóły klasy</p>
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
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Informacje o klasie
            </CardTitle>
            <Badge 
              variant={classData.status === "active" ? "default" : "secondary"}
            >
              {classData.status === "active" ? "Aktywna" : "Nieaktywna"}
            </Badge>
          </FlexBox>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.subject && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Przedmiot</h4>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {classData.subject}
                </p>
              </div>
            )}

            {classData.grade && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Poziom</h4>
                <p>{classData.grade}</p>
              </div>
            )}

            {classData.room && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Sala</h4>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {classData.room}
                </p>
              </div>
            )}

            {classData.school_year && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Rok szkolny</h4>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {classData.school_year}
                </p>
              </div>
            )}

            {classData.created_at && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Data utworzenia</h4>
                <p>{new Date(classData.created_at).toLocaleDateString()}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Liczba uczniów</h4>
              <p className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {studentList.length}
              </p>
            </div>
          </div>

          {classData.description && (
            <div className="mt-6">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Opis</h4>
              <p className="text-sm leading-relaxed">{classData.description}</p>
            </div>
          )}

          {classData.notes && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Notatki</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{classData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <GridBox>
        {/* Students Card */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Uczniowie ({studentList.length})
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => create("students", "push", { class_id: id })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {studentList.length > 0 ? (
              <div className="space-y-3">
                {studentList.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {studentList.length > 5 && (
                  <Button variant="ghost" className="w-full">
                    Zobacz wszystkich ({studentList.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak uczniów</p>
                <p className="text-sm">Dodaj pierwszego ucznia do klasy</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments Card */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Zadania ({assignmentList.length})
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => create("assignments", "push", { class_id: id })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {assignmentList.length > 0 ? (
              <div className="space-y-3">
                {assignmentList.slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{assignment.title}</p>
                      <Badge variant="outline">
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Termin: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Zobacz
                    </Button>
                  </div>
                ))}
                {assignmentList.length > 5 && (
                  <Button variant="ghost" className="w-full">
                    Zobacz wszystkie ({assignmentList.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Brak zadań</p>
                <p className="text-sm">Utwórz pierwsze zadanie dla klasy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </GridBox>

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
              onClick={() => create("students", "push", { class_id: id })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj ucznia
            </Button>
            <Button 
              variant="outline"
              onClick={() => create("assignments", "push", { class_id: id })}
            >
              <FileText className="w-4 h-4 mr-2" />
              Utwórz zadanie
            </Button>
            <Button variant="ghost">
              <Users className="w-4 h-4 mr-2" />
              Zarządzaj uczniami
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
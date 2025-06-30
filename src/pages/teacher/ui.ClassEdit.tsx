// src/pages/teacher/ui.ClassEdit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useShow } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

// Definicja typu dla danych klasy
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

export default function ClassEdit() {
  const { id } = useParams();
  const { goBack, list, show } = useNavigation();
  
  const { queryResult } = useShow({
    resource: "classes",
    id: id!,
  });

  // Poprawna destrukturyzacja - dane są w queryResult.data.data
  const classData = queryResult.data?.data as ClassData | undefined;
  const isLoading = queryResult.isLoading;

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  // Wypełnij formularz danymi klasy
  useEffect(() => {
    if (classData) {
      reset({
        name: classData.name || "",
        description: classData.description || "",
        subject: classData.subject || "",
        grade: classData.grade || "",
        school_year: classData.school_year || "",
        room: classData.room || "",
        status: classData.status || "active",
        notes: classData.notes || "",
      });
    }
  }, [classData, reset]);

  const onSubmit = (data: any) => {
    onFinish({
      ...data,
      updated_at: new Date().toISOString(),
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edytuj klasę
            </h1>
            <p className="text-muted-foreground">
              Modyfikuj ustawienia klasy {classData.name}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły klasy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa klasy *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Nazwa klasy jest wymagana" })}
                  placeholder="np. Klasa 3A, Matematyka podstawowa"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => setValue("status", value)}
                  defaultValue={classData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywna</SelectItem>
                    <SelectItem value="inactive">Nieaktywna</SelectItem>
                    <SelectItem value="archived">Zarchiwizowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Przedmiot</Label>
                <Select 
                  onValueChange={(value) => setValue("subject", value)}
                  defaultValue={classData.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz przedmiot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matematyka">Matematyka</SelectItem>
                    <SelectItem value="Polski">Język Polski</SelectItem>
                    <SelectItem value="Angielski">Język Angielski</SelectItem>
                    <SelectItem value="Historia">Historia</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Biologia">Biologia</SelectItem>
                    <SelectItem value="Chemia">Chemia</SelectItem>
                    <SelectItem value="Fizyka">Fizyka</SelectItem>
                    <SelectItem value="Informatyka">Informatyka</SelectItem>
                    <SelectItem value="Plastyka">Plastyka</SelectItem>
                    <SelectItem value="Muzyka">Muzyka</SelectItem>
                    <SelectItem value="WF">Wychowanie Fizyczne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Poziom/Klasa</Label>
                <Select 
                  onValueChange={(value) => setValue("grade", value)}
                  defaultValue={classData.grade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poziom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Klasa 1">Klasa 1</SelectItem>
                    <SelectItem value="Klasa 2">Klasa 2</SelectItem>
                    <SelectItem value="Klasa 3">Klasa 3</SelectItem>
                    <SelectItem value="Klasa 4">Klasa 4</SelectItem>
                    <SelectItem value="Klasa 5">Klasa 5</SelectItem>
                    <SelectItem value="Klasa 6">Klasa 6</SelectItem>
                    <SelectItem value="Klasa 7">Klasa 7</SelectItem>
                    <SelectItem value="Klasa 8">Klasa 8</SelectItem>
                    <SelectItem value="Liceum 1">Liceum 1</SelectItem>
                    <SelectItem value="Liceum 2">Liceum 2</SelectItem>
                    <SelectItem value="Liceum 3">Liceum 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_year">Rok szkolny</Label>
                <Input
                  id="school_year"
                  {...register("school_year")}
                  placeholder="np. 2024/2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Sala</Label>
                <Input
                  id="room"
                  {...register("room")}
                  placeholder="np. 101, Pracownia komputerowa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis klasy</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Opisz klasę, cele nauczania, wymagania..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Dodatkowe informacje, uwagi..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => show("classes", id!)}
              >
                Anuluj
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Zapisz zmiany
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
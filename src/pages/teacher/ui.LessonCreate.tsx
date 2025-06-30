// src/pages/teacher/ui.LessonCreate.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useGetIdentity } from "@refinedev/core";
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
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import { useEffect } from "react";

type Identity = {
  id: string;
  email?: string;
  username?: string;
  role: 'teacher' | 'student';
};

export default function LessonCreate() {
  const { goBack, list } = useNavigation();
  const { data: identity } = useGetIdentity<Identity>();
  
  // DEBUG: Sprawdź co zwraca identity
  useEffect(() => {
    console.log("=== LESSON CREATE DEBUG ===");
    console.log("Identity data:", identity);
    console.log("Identity ID:", identity?.id);
    console.log("Identity type:", typeof identity?.id);
    console.log("==========================");
  }, [identity]);
  
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      education_level: "",
      grade: "",
      topic: "",
      author_id: identity?.id,
    },
  });

  const onSubmit = (data: any) => {
    // DEBUG: Sprawdź dane przed wysłaniem
    const submitData = {
      ...data,
      author_id: identity?.id,
      created_at: new Date().toISOString(),
    };
    
    console.log("=== SUBMIT DEBUG ===");
    console.log("Form data:", data);
    console.log("Identity at submit:", identity);
    console.log("Final submit data:", submitData);
    console.log("Author ID:", submitData.author_id);
    console.log("===================");
    
    // Sprawdź czy author_id istnieje przed wysłaniem
    if (!identity?.id) {
      alert("BŁĄD: Brak ID użytkownika! Nie można utworzyć lekcji.");
      console.error("Cannot create lesson: missing user ID");
      return;
    }
    
    onFinish(submitData);
  };

  // Pokaż ostrzeżenie jeśli brak identity
  if (!identity) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Ładowanie danych użytkownika...</h3>
          <p className="text-muted-foreground mb-4">
            Proszę czekać na załadowanie danych.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!identity.id) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2 text-red-600">Błąd autoryzacji</h3>
          <p className="text-muted-foreground mb-4">
            Nie można zidentyfikować użytkownika. ID użytkownika jest puste.
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
              Utwórz nową lekcję
            </h1>
            <p className="text-muted-foreground">
              Dodaj nową lekcję do systemu edukacyjnego
            </p>
            {/* DEBUG INFO */}
            <p className="text-xs text-blue-600 mt-1">
              Autor: {identity.email || identity.username} (ID: {identity.id.slice(0, 8)}...)
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600">📚</span>
            Do czego służy lekcja?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">🎯 Kontener wiedzy</h4>
              <p className="text-sm text-indigo-700">
                Lekcja grupuje artykuły (teoria) i zadania (praktyka) w logiczną całość 
                poświęconą jednemu tematowi.
              </p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">🏗️ Struktura kursu</h4>
              <p className="text-sm text-emerald-700">
                Lekcje można przypisywać do klas. Uczniowie przechodzą przez 
                lekcje w określonej kolejności, zdobywając wiedzę krok po kroku.
              </p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
              <h4 className="font-semibold text-rose-800 mb-2">📊 Śledzenie postępów</h4>
              <p className="text-sm text-rose-700">
                System śledzi jak uczniowie radzą sobie z każdą lekcją - 
                wyniki zadań, zdobyte punkty XP i odznaki.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-700">
              <strong>Przykład użycia:</strong> Stwórz lekcję "Równania kwadratowe", dodaj 3 artykuły 
              z teorią, 5 zadań do rozwiązania i przypisz do klasy "2A Matematyka"! 🧮
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Szczegóły lekcji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł lekcji *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Tytuł lekcji jest wymagany" })}
                  placeholder="np. Wprowadzenie do algebry"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Przedmiot</Label>
                <Select onValueChange={(value) => setValue("subject", value)}>
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
                <Label htmlFor="education_level">Poziom edukacji</Label>
                <Select onValueChange={(value) => setValue("education_level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poziom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Podstawowa">Szkoła podstawowa</SelectItem>
                    <SelectItem value="Średnia">Szkoła średnia</SelectItem>
                    <SelectItem value="Liceum">Liceum</SelectItem>
                    <SelectItem value="Technikum">Technikum</SelectItem>
                    <SelectItem value="Wyższa">Szkoła wyższa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Klasa</Label>
                <Select onValueChange={(value) => setValue("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klasę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Klasa 1</SelectItem>
                    <SelectItem value="2">Klasa 2</SelectItem>
                    <SelectItem value="3">Klasa 3</SelectItem>
                    <SelectItem value="4">Klasa 4</SelectItem>
                    <SelectItem value="5">Klasa 5</SelectItem>
                    <SelectItem value="6">Klasa 6</SelectItem>
                    <SelectItem value="7">Klasa 7</SelectItem>
                    <SelectItem value="8">Klasa 8</SelectItem>
                    <SelectItem value="1 LO">1 Liceum</SelectItem>
                    <SelectItem value="2 LO">2 Liceum</SelectItem>
                    <SelectItem value="3 LO">3 Liceum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic">Temat lekcji</Label>
                <Input
                  id="topic"
                  {...register("topic")}
                  placeholder="np. Równania liniowe, Podstawy gramatyki"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis lekcji</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Opisz czego dotyczy lekcja, jakie umiejętności rozwija..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => list("lessons")}
              >
                Anuluj
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Utwórz lekcję
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Wskazówki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Planowanie:</strong> Zanim stworzysz lekcję, przemyśl jakie artykuły i zadania będą potrzebne</p>
            <p><strong>Nazewnictwo:</strong> Używaj jasnych i opisowych tytułów, np. "Równania kwadratowe - wprowadzenie"</p>
            <p><strong>Kolejność:</strong> Po utworzeniu lekcji dodaj najpierw artykuły z teorią, potem zadania praktyczne</p>
            <p><strong>Przypisywanie:</strong> Pamiętaj o przypisaniu lekcji do odpowiedniej klasy po jej utworzeniu</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
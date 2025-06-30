// src/pages/teacher/ui.ClassCreate.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

type Identity = {
  id: string;
  email?: string;
  full_name?: string;
};

export default function ClassCreate() {
  const { goBack, list } = useNavigation();
  const { data: identity } = useGetIdentity<Identity>();
  
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      grade: "",
      education_year: new Date().getFullYear(),
    },
  });

  const onSubmit = (data: any) => {
    // Mapowanie zgodne ze schematem bazy danych classes
    const classData = {
      name: data.name,
      education_year: parseInt(data.education_year) || new Date().getFullYear(),
      grade: data.grade,
      // created_at jest automatycznie dodawane przez bazę (DEFAULT now())
    };
    
    onFinish(classData);
  };

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
              Utwórz nową klasę
            </h1>
            <p className="text-muted-foreground">
              Dodaj nową klasę do swojego systemu nauczania
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600">📚</span>
            Do czego służy klasa?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">👥 Grupowanie uczniów</h4>
              <p className="text-sm text-green-700">
                Klasa pozwala zebrać uczniów w jedną grupę, którą możesz zarządzać jako nauczyciel. 
                Możesz śledzić postępy całej grupy jednocześnie.
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">📖 Organizacja lekcji</h4>
              <p className="text-sm text-purple-700">
                Do klasy dodajesz lekcje, które uczniowie mają realizować. 
                Możesz tworzyć różne zestawy lekcji dla różnych grup.
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">📊 Monitoring postępów</h4>
              <p className="text-sm text-orange-700">
                Śledź wyniki, rankingi i postępy uczniów. System pokazuje 
                kto ma problemy i gdzie potrzebuje dodatkowej pomocy.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Przykład użycia:</strong> Stwórz klasę "3A Matematyka", dodaj uczniów z klasy 3A, 
              przypisz lekcje z matematyki i obserwuj jak uczniowie zdobywają punkty XP i odznaki! 🏆
            </p>
          </div>
        </CardContent>
      </Card>

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
                  placeholder="np. 3A Matematyka, Klasa 5B, Liceum 2A"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name?.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Podaj pełną nazwę zawierającą przedmiot i klasę
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Poziom/Klasa *</Label>
                <Select 
                  onValueChange={(value) => setValue("grade", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poziom" />
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
                    <SelectItem value="9">Liceum 1</SelectItem>
                    <SelectItem value="10">Liceum 2</SelectItem>
                    <SelectItem value="11">Liceum 3</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Wybierz odpowiedni poziom edukacyjny
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="education_year">Rok edukacyjny *</Label>
                <Input
                  id="education_year"
                  type="number"
                  {...register("education_year", { 
                    required: "Rok edukacyjny jest wymagany",
                    min: { value: 2020, message: "Rok nie może być wcześniejszy niż 2020" },
                    max: { value: 2030, message: "Rok nie może być późniejszy niż 2030" }
                  })}
                  placeholder="2024"
                  min="2020"
                  max="2030"
                />
                {errors.education_year && (
                  <p className="text-sm text-red-500">
                    {errors.education_year?.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Podaj rok rozpoczęcia roku szkolnego (np. 2024 dla roku 2024/2025)
                </p>
              </div>
            </div>

            

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => list("classes")}
              >
                Anuluj
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Utwórz klasę
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
// src/pages/teacher/ui.ArticleEdit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useShow, useSelect } from "@refinedev/core";
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
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

type ArticleFormData = {
  lesson_id: string;
  title: string;
  content: string;
  sort_order: number;
};

export default function ArticleEdit() {
  const { id } = useParams();
  const { goBack, show } = useNavigation();
  
  const { queryResult } = useShow({
    resource: "articles",
    id: id!,
  });

  const { data: articleResponse, isLoading } = queryResult;
  const articleData = articleResponse?.data;

  // Pobierz wszystkie lekcje do wyboru
  const { options: lessonOptions } = useSelect({
    resource: "lessons",
    optionLabel: "title",
    optionValue: "id",
  });

  // Poprawne sparametryzowanie useForm
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ArticleFormData>({
    refineCoreProps: {
      resource: "articles",
      id: id!,
      action: "edit",
    },
  });

  // Wypełnij formularz danymi artykułu
  useEffect(() => {
    if (articleData) {
      reset({
        lesson_id: articleData.lesson_id || "",
        title: articleData.title || "",
        content: articleData.content || "",
        sort_order: articleData.sort_order || 0,
      });
    }
  }, [articleData, reset]);

  const onSubmit = (data: Record<string, any>) => {
    // Rzutowanie na nasz typ
    const formData: ArticleFormData = {
      lesson_id: data.lesson_id as string,
      title: data.title as string,
      content: data.content as string,
      sort_order: Number(data.sort_order) || 0,
    };
    console.log("Form data:", formData);

    if (!formData.lesson_id || formData.lesson_id.trim() === "") {
      alert("Musisz wybrać lekcję");
      return;
    }

    if (!formData.title || formData.title.trim() === "") {
      alert("Tytuł artykułu jest wymagany");
      return;
    }

    if (!formData.content || formData.content.trim() === "") {
      alert("Treść artykułu jest wymagana");
      return;
    }

    const processedData = {
      lesson_id: formData.lesson_id.trim(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      sort_order: parseInt(formData.sort_order.toString()) || 0,
      // ✅ Removed updated_at since it doesn't exist in the database
    };

    console.log("Processed data:", processedData);
    onFinish(processedData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">Artykuł nie został znaleziony</h3>
          <p className="text-muted-foreground mb-4">
            Nie można znaleźć artykułu o podanym identyfikatorze.
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
            <h1 className="text-3xl font-bold tracking-tight">Edytuj artykuł</h1>
            <p className="text-muted-foreground">
              Modyfikuj treść artykułu "{articleData.title}"
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Edycja artykułu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lesson_id">Lekcja *</Label>
                <Select
                  onValueChange={(value) => setValue("lesson_id", value)}
                  defaultValue={articleData.lesson_id || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz lekcję" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lesson_id && (
                  <p className="text-sm text-red-500">Musisz wybrać lekcję</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Kolejność wyświetlania</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  {...register("sort_order", {
                    min: { value: 0, message: "Kolejność nie może być ujemna" },
                  })}
                  placeholder="0"
                />
                {errors.sort_order && (
                  <p className="text-sm text-red-500">
                    {errors.sort_order.message as string}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Niższe liczby będą wyświetlane pierwsze
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tytuł artykułu *</Label>
              <Input
                id="title"
                {...register("title", {
                  required: "Tytuł artykułu jest wymagany",
                })}
                placeholder="np. Wprowadzenie do tematu"
              />
              {errors.title && (
                <p className="text-sm text-red-500">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Treść artykułu *</Label>
              <Textarea
                id="content"
                {...register("content", {
                  required: "Treść artykułu jest wymagana",
                })}
                placeholder="Napisz treść artykułu... Możesz używać Markdown do formatowania."
                rows={15}
                className="min-h-[400px]"
              />
              {errors.content && (
                <p className="text-sm text-red-500">
                  {errors.content.message as string}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Możesz używać formatowania Markdown: **pogrubienie**, *kursywa*, `kod`, ### nagłówki, - listy
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => show("articles", id!)}
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

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Wskazówki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Markdown:</strong> Używaj **pogrubienia**, *kursywy*, `kodu` do formatowania tekstu</p>
            <p><strong>Nagłówki:</strong> Użyj ### Nagłówek dla sekcji artykułu</p>
            <p><strong>Listy:</strong> Rozpocznij linię od - aby utworzyć listę punktową</p>
            <p><strong>Kolejność:</strong> Artykuły będą sortowane według numeru kolejności</p>
            <p><strong>Długość:</strong> Dobry artykuł to 300-800 słów - wystarczająco, by wyjaśnić temat</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
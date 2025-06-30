// src/pages/teacher/ui.TaskCreate.tsx
import { useForm } from "@refinedev/react-hook-form";
import {
  useNavigation,
  useGetIdentity,
  useSelect,
  useList,
} from "@refinedev/core";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Target, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

type Identity = {
  id: string;
  email?: string;
  username?: string;
  role: "teacher" | "student";
};

type TaskOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

// Define the form data type
type TaskFormData = {
  lesson_id: string;
  type: string;
  xp_reward: number;
  question_text: string;
  explanation?: string;
  correct_answer?: string;
  article_id?: string;
};

export default function TaskCreate() {
  const { goBack, list } = useNavigation();
  const { data: identity } = useGetIdentity<Identity>();
  const [searchParams] = useSearchParams();
  const preselectedLessonId = searchParams.get("lesson_id");

  const [taskType, setTaskType] = useState<string>("single_choice");
  const [options, setOptions] = useState<TaskOption[]>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ]);

  // Pobierz lekcje nauczyciela do wyboru
  const { options: lessonOptions } = useSelect({
    resource: "lessons",
    optionLabel: "title",
    optionValue: "id",
    filters: identity?.id
      ? [
          {
            field: "author_id",
            operator: "eq",
            value: identity.id,
          },
        ]
      : [],
  });

  // Pobierz artykuły dla wybranej lekcji
  const { data: articles } = useList({
    resource: "articles",
    filters: preselectedLessonId
      ? [
          {
            field: "lesson_id",
            operator: "eq",
            value: preselectedLessonId,
          },
        ]
      : [],
    queryOptions: {
      enabled: !!preselectedLessonId,
    },
  });

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    defaultValues: {
      lesson_id: preselectedLessonId || "",
      type: "single_choice",
      xp_reward: 10,
      question_text: "",
      explanation: "",
      correct_answer: "",
      article_id: "",
    },
  });

  const watchedLessonId = watch("lesson_id");

  const addOption = () => {
    const newOption: TaskOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (optionId: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== optionId));
    }
  };

  const updateOption = (optionId: string, text: string) => {
    setOptions(
      options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt))
    );
  };

  const toggleCorrectOption = (optionId: string) => {
    if (taskType === "single_choice") {
      // Dla single choice - tylko jedna poprawna odpowiedź
      setOptions(
        options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === optionId,
        }))
      );
    } else {
      // Dla multiple choice - wiele poprawnych odpowiedzi
      setOptions(
        options.map((opt) =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        )
      );
    }
  };

  const onSubmit = (data: TaskFormData) => {
    console.log("Raw form data:", data); // Debug log 1

    // Validate required fields
    if (!data.lesson_id || data.lesson_id.trim() === "") {
      alert("Musisz wybrać lekcję");
      return;
    }

    if (!data.question_text || data.question_text.trim() === "") {
      alert("Treść pytania jest wymagana");
      return;
    }

    const processedData: any = {
      lesson_id: data.lesson_id.trim(),
      type: taskType,
      question_text: data.question_text.trim(),
      xp_reward: parseInt(data.xp_reward.toString()) || 10,
    };

    // Handle optional fields - only include if they have actual values
    if (
      data.article_id &&
      data.article_id.trim() !== "" &&
      data.article_id !== "undefined"
    ) {
      processedData.article_id = data.article_id.trim();
    }

    if (
      data.explanation &&
      data.explanation.trim() !== "" &&
      data.explanation !== "undefined"
    ) {
      processedData.explanation = data.explanation.trim();
    }

    // Przygotuj opcje i poprawną odpowiedź w zależności od typu zadania
    if (taskType === "single_choice" || taskType === "multiple_choice") {
      const validOptions = options.filter((opt) => opt.text.trim() !== "");

      // Validate that we have at least 2 options
      if (validOptions.length < 2) {
        alert("Musisz dodać co najmniej 2 opcje odpowiedzi");
        return;
      }

      // Validate that at least one option is marked as correct
      const correctOptions = validOptions.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        alert("Musisz oznaczyć co najmniej jedną opcję jako poprawną");
        return;
      }

      processedData.options = validOptions.map((opt) => ({
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      }));

      if (taskType === "single_choice") {
        const correctOption = validOptions.find((opt) => opt.isCorrect);
        processedData.correct_answer = correctOption
          ? correctOption.text.trim()
          : "";
      } else {
        processedData.correct_answer = validOptions
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.text.trim())
          .join("|");
      }
    } else if (taskType === "true_false") {
      if (!data.correct_answer) {
        alert("Musisz wybrać poprawną odpowiedź dla pytania Prawda/Fałsz");
        return;
      }

      processedData.options = [
        { text: "Prawda", isCorrect: data.correct_answer === "true" },
        { text: "Fałsz", isCorrect: data.correct_answer === "false" },
      ];
      processedData.correct_answer =
        data.correct_answer === "true" ? "Prawda" : "Fałsz";
    } else if (taskType === "fill_blank") {
      if (!data.correct_answer || data.correct_answer.trim() === "") {
        alert("Poprawna odpowiedź jest wymagana dla zadania uzupełniania luki");
        return;
      }

      // Dla fill_blank opcje nie są potrzebne
      processedData.options = null;
      processedData.correct_answer = data.correct_answer.trim();
    }

    console.log("Final processed data:", processedData); // Debug log 2
    console.log("Data keys:", Object.keys(processedData)); // Debug log 3
    console.log("Data values:", Object.values(processedData)); // Debug log 4

    // Final cleanup - remove any remaining empty strings or undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(processedData).filter(([key, value]) => {
        // Keep the value if it's not empty, undefined, or null
        if (value === "" || value === undefined || value === null) {
          console.log(`Removing empty field: ${key} = ${value}`);
          return false;
        }
        return true;
      })
    );

    console.log("Cleaned data:", cleanedData); // Debug log 5

    onFinish(cleanedData);
  };

  const onTaskTypeChange = (newType: string) => {
    setTaskType(newType);
    setValue("type", newType);

    // Reset opcji dla różnych typów zadań
    if (newType === "true_false") {
      setOptions([]);
      setValue("correct_answer", undefined); // Use undefined instead of empty string
    } else if (newType === "fill_blank") {
      setOptions([]);
      setValue("correct_answer", undefined); // Use undefined instead of empty string
    } else {
      setOptions([
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
      ]);
    }
  };

  if (!identity) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">
            Ładowanie danych użytkownika...
          </h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
              Utwórz nowe zadanie
            </h1>
            <p className="text-muted-foreground">
              Dodaj interaktywne zadanie do swojej lekcji
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data as TaskFormData))}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Podstawowe informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lesson_id">Lekcja *</Label>
                <Select
                  onValueChange={(value) => setValue("lesson_id", value)}
                  defaultValue={preselectedLessonId || ""}
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
                <Label htmlFor="type">Typ zadania *</Label>
                <Select
                  onValueChange={onTaskTypeChange}
                  defaultValue="single_choice"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ zadania" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">
                      Jednokrotny wybór
                    </SelectItem>
                    <SelectItem value="multiple_choice">
                      Wielokrotny wybór
                    </SelectItem>
                    <SelectItem value="true_false">Prawda/Fałsz</SelectItem>
                    <SelectItem value="fill_blank">Uzupełnij lukę</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {articles?.data && articles.data.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="article_id">
                    Powiązany artykuł (opcjonalnie)
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("article_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz artykuł" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Brak powiązania</SelectItem>
                      {articles.data.map((article: any) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="xp_reward">Nagroda XP *</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  min="1"
                  max="100"
                  {...register("xp_reward", {
                    required: "Nagroda XP jest wymagana",
                    min: { value: 1, message: "Minimalna nagroda to 1 XP" },
                    max: {
                      value: 100,
                      message: "Maksymalna nagroda to 100 XP",
                    },
                  })}
                  placeholder="10"
                />
                {errors.xp_reward && (
                  <p className="text-sm text-red-500">
                    {errors.xp_reward.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Treść pytania *</Label>
              <Textarea
                id="question_text"
                {...register("question_text", {
                  required: "Treść pytania jest wymagana",
                })}
                placeholder="Wprowadź treść pytania..."
                rows={3}
              />
              {errors.question_text && (
                <p className="text-sm text-red-500">
                  {errors.question_text.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Wyjaśnienie (opcjonalnie)</Label>
              <Textarea
                id="explanation"
                {...register("explanation")}
                placeholder="Wyjaśnienie dlaczego dana odpowiedź jest poprawna..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Opcje odpowiedzi */}
        <Card>
          <CardHeader>
            <CardTitle>Opcje odpowiedzi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskType === "single_choice" || taskType === "multiple_choice" ? (
              <>
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 border rounded"
                  >
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={() => toggleCorrectOption(option.id)}
                    />
                    <Input
                      placeholder={`Opcja ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj opcję
                </Button>
                <p className="text-sm text-muted-foreground">
                  {taskType === "single_choice"
                    ? "Zaznacz jedną poprawną odpowiedź"
                    : "Zaznacz wszystkie poprawne odpowiedzi"}
                </p>
              </>
            ) : taskType === "true_false" ? (
              <div className="space-y-3">
                <Label>Poprawna odpowiedź:</Label>
                <Select
                  onValueChange={(value) => setValue("correct_answer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poprawną odpowiedź" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Prawda</SelectItem>
                    <SelectItem value="false">Fałsz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : taskType === "fill_blank" ? (
              <div className="space-y-2">
                <Label htmlFor="correct_answer">Poprawna odpowiedź *</Label>
                <Input
                  id="correct_answer"
                  {...register("correct_answer", {
                    required: "Poprawna odpowiedź jest wymagana",
                  })}
                  placeholder="Wprowadź poprawną odpowiedź..."
                />
                {errors.correct_answer && (
                  <p className="text-sm text-red-500">
                    {errors.correct_answer.message as string}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Możesz podać kilka akceptowalnych odpowiedzi oddzielonych
                  przecinkami
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => list("tasks")}>
            Anuluj
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Utwórz zadanie
          </Button>
        </div>
      </form>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Wskazówki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Jednokrotny wybór:</strong> Uczniowie wybierają jedną
              odpowiedź z kilku opcji
            </p>
            <p>
              <strong>Wielokrotny wybór:</strong> Uczniowie mogą wybrać kilka
              poprawnych odpowiedzi
            </p>
            <p>
              <strong>Prawda/Fałsz:</strong> Proste pytanie z dwiema opcjami
              odpowiedzi
            </p>
            <p>
              <strong>Uzupełnij lukę:</strong> Uczniowie wpisują odpowiedź
              tekstową
            </p>
            <p>
              <strong>Nagroda XP:</strong> Im trudniejsze zadanie, tym więcej XP
              można przyznać (1-100)
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

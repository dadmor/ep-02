// src/pages/student/ui.LessonTake.tsx - UPROSZCZONA WERSJA
import React, { useState, useEffect } from "react";
import { useOne, useList, useGetIdentity } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 

  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Flame
} from "lucide-react";
import { supabaseClient } from "@/utility/supabaseClient"; // ✅ IMPORT SUPABASE CLIENT

interface Answer {
  task_id: string;
  answer: string;
}

const LessonTake: React.FC = () => {
  // ✅ PARAMETRY
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ WSZYSTKIE HOOKI NA POCZĄTKU
  const { data: identity, isLoading: identityLoading } = useGetIdentity<{ id: string }>();

  // ✅ STATE
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ QUERIES - zawsze wywoływane, ale disabled gdy brak danych
  const { data: lessonData, isLoading: lessonLoading } = useOne({
    resource: "lessons",
    id: id || "dummy",
    queryOptions: {
      enabled: !!id,
    },
  });

  const { data: tasksData, isLoading: tasksLoading } = useList({
    resource: "tasks",
    filters: [{ field: "lesson_id", operator: "eq", value: id || "dummy" }],
    sorters: [{ field: "created_at", order: "asc" }],
    queryOptions: {
      enabled: !!id,
    },
  });

  // ✅ DERIVED STATE
  const lesson = lessonData?.data;
  const tasks = tasksData?.data || [];
  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? ((currentTaskIndex + 1) / tasks.length) * 100 : 0;

  // ✅ EFFECTS
  useEffect(() => {
    if (currentTask) {
      const existingAnswer = answers.find(a => a.task_id === currentTask.id);
      setCurrentAnswer(existingAnswer?.answer || "");
    }
  }, [currentTaskIndex, currentTask, answers]);

  // ✅ LOADING STATES
  if (identityLoading || lessonLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  // ✅ ERROR STATES
  if (!identity?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Brak danych użytkownika</div>
          <Button onClick={() => navigate('/student/dashboard')}>
            Powrót do panelu
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Nie znaleziono lekcji</div>
          <Button onClick={() => navigate('/student/lessons')}>
            Powrót do lekcji
          </Button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Ta lekcja nie ma jeszcze zadań</div>
          <Button onClick={() => navigate('/student/lessons')}>
            Powrót do lekcji
          </Button>
        </div>
      </div>
    );
  }

  // ✅ EVENT HANDLERS
  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const saveCurrentAnswer = () => {
    if (!currentTask || !currentAnswer.trim()) return;

    const newAnswers = answers.filter(a => a.task_id !== currentTask.id);
    newAnswers.push({
      task_id: currentTask.id,
      answer: currentAnswer.trim()
    });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    saveCurrentAnswer();
    
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleCompleteLesson();
    }
  };

  const handlePrevious = () => {
    saveCurrentAnswer();
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleCompleteLesson = async () => {
    if (!identity?.id || !id) {
      alert("Brak danych użytkownika lub lekcji");
      return;
    }

    saveCurrentAnswer();
    
    const finalAnswers = [...answers];
    if (currentTask && currentAnswer.trim()) {
      const filtered = finalAnswers.filter(a => a.task_id !== currentTask.id);
      filtered.push({ task_id: currentTask.id, answer: currentAnswer.trim() });
      finalAnswers.splice(0, finalAnswers.length, ...filtered);
    }

    if (finalAnswers.length !== tasks.length) {
      alert("Proszę odpowiedzieć na wszystkie pytania");
      return;
    }

    console.log("🚀 Wysyłanie odpowiedzi:", {
      user_id: identity.id,
      lesson_id: id,
      answers_count: finalAnswers.length
    });

    setIsSubmitting(true);

    try {
      // ✅ UŻYWAMY SUPABASE CLIENT zamiast fetch
      const { data, error } = await supabaseClient.rpc('fn_process_lesson_answers', {
        p_user_id: identity.id,
        p_lesson_id: id,
        p_answers: finalAnswers
      });

      if (error) {
        throw error;
      }

      console.log("✅ Success response:", data);
      
      const result = Array.isArray(data) ? data[0] : data;
      setResults(result);
      setIsCompleted(true);
      
    } catch (error: any) {
      console.error("❌ Błąd:", error);
      alert(`Błąd: ${error.message || "Wystąpił błąd podczas zapisywania odpowiedzi"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ RENDER HELPERS - uproszczone
  const renderTaskInput = () => {
    if (!currentTask) return null;

    // ✅ BEZPIECZNE PARSOWANIE OPTIONS
    let options: string[] = [];
    try {
      if (Array.isArray(currentTask.options)) {
        options = currentTask.options;
      } else if (typeof currentTask.options === 'string') {
        options = JSON.parse(currentTask.options);
      }
    } catch (e) {
      console.error("Błąd parsowania options:", e);
      options = [];
    }

    switch (currentTask.type) {
      case 'multiple_choice':
      case 'single_choice':
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {options.map((option, index) => {
                // ✅ BEZPIECZNE RENDEROWANIE - zawsze string
                const optionText = typeof option === 'string' ? option : 
                                  typeof option === 'object' && option?.text ? option.text : 
                                  `Opcja ${index + 1}`;
                
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionText} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50">
                      {optionText}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        );

      case 'text_input':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Wpisz swoją odpowiedź..."
            className="w-full p-4 text-lg"
          />
        );

      case 'math':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Wpisz wynik..."
            className="w-full p-4 text-lg text-center"
            type="number"
          />
        );

      default:
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Wpisz swoją odpowiedź..."
            className="w-full p-4 min-h-24"
          />
        );
    }
  };

  // ✅ RESULTS SCREEN
  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {results.score >= 70 ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              
              <h2 className="text-3xl font-bold mb-2">
                {results.score >= 70 ? "Gratulacje!" : "Spróbuj ponownie!"}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {results.score >= 70 
                  ? "Świetnie wykonana lekcja!" 
                  : "Nie martw się, możesz spróbować ponownie."}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
                <div className="text-sm text-gray-600">Wynik</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.correct_tasks}/{results.total_tasks}</div>
                <div className="text-sm text-gray-600">Poprawne odpowiedzi</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">+{results.xp_earned}</div>
                <div className="text-sm text-gray-600">Zdobyte XP</div>
              </div>
            </div>

            {results.streak_bonus > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Flame className="w-5 h-5" />
                  <span className="font-semibold">Bonus za passę: +{results.streak_bonus} XP!</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/student/dashboard')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Powrót do panelu
              </Button>
              
              {results.score < 70 && (
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Spróbuj ponownie
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/student/lessons')}
                variant="outline"
              >
                Kolejna lekcja
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ MAIN RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-4 max-w-4xl">
        
        {/* Header z postępem */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
                <p className="text-gray-600">
                  Pytanie {currentTaskIndex + 1} z {tasks.length}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/student/lessons')}
                size="sm"
              >
                Wyjdź
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Aktualne zadanie */}
        {currentTask && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentTask.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderTaskInput()}
              
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentTaskIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Poprzednie
                </Button>

                <div className="text-sm text-gray-500">
                  {currentTask.xp_reward} XP za poprawną odpowiedź
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  {isSubmitting ? (
                    "Zapisywanie..."
                  ) : currentTaskIndex === tasks.length - 1 ? (
                    <>
                      Zakończ
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Następne
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Podgląd odpowiedzi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Postęp odpowiedzi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {tasks.map((task, index) => {
                const hasAnswer = answers.some(a => a.task_id === task.id) || 
                                 (index === currentTaskIndex && currentAnswer.trim());
                
                return (
                  <div
                    key={task.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === currentTaskIndex
                        ? 'bg-blue-500 text-white'
                        : hasAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LessonTake;
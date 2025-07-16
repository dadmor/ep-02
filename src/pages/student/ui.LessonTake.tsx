// src/pages/student/ui.LessonTake.tsx - REFAKTORYZACJA Z KOMPONENTAMI
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
import { supabaseClient } from "@/utility/supabaseClient";

// ====== TYPY ======
interface Answer {
  task_id: string;
  answer: string;
}

interface TaskInputProps {
  currentTask: any;
  currentAnswer: string;
  onAnswerChange: (value: string) => void;
}

// ====== KOMPONENTY DLA TYPÓW ZADAŃ ======

// Komponent dla pojedynczego wyboru
const SingleChoiceInput: React.FC<TaskInputProps> = ({ currentTask, currentAnswer, onAnswerChange }) => {
  const options = currentTask.options || [];
  
  return (
    <RadioGroup value={currentAnswer} onValueChange={onAnswerChange}>
      <div className="space-y-3">
        {options.map((option: any, index: number) => {
          // Dla tablicy stringów (stary format)
          let optionText = '';
          
          if (typeof option === 'string') {
            optionText = option;
          } else if (option && typeof option === 'object') {
            // Dla nowego formatu z TaskCreate
            optionText = option.text || option.label || option.value || '';
          }
          
          // Fallback tylko jeśli naprawdę brak tekstu
          if (!optionText) {
            console.warn(`Brak tekstu dla opcji ${index}:`, option);
            optionText = `Opcja ${index + 1}`;
          }
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={optionText} id={`option-${index}`} />
              <Label 
                htmlFor={`option-${index}`} 
                className="cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                {optionText}
              </Label>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
};

// Komponent dla wielokrotnego wyboru
const MultipleChoiceInput: React.FC<TaskInputProps> = ({ currentTask, currentAnswer, onAnswerChange }) => {
  const options = currentTask.options || [];
  const selectedOptions = currentAnswer ? currentAnswer.split('|') : [];
  
  return (
    <div className="space-y-3">
      {options.map((option: any, index: number) => {
        // Dla tablicy stringów (stary format)
        let optionText = '';
        
        if (typeof option === 'string') {
          optionText = option;
        } else if (option && typeof option === 'object') {
          // Dla nowego formatu z TaskCreate
          optionText = option.text || option.label || option.value || '';
        }
        
        // Fallback tylko jeśli naprawdę brak tekstu
        if (!optionText) {
          console.warn(`Brak tekstu dla opcji ${index}:`, option);
          optionText = `Opcja ${index + 1}`;
        }
        
        const isChecked = selectedOptions.includes(optionText);
        
        return (
          <label
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                let newSelected = [...selectedOptions];
                if (e.target.checked) {
                  if (!newSelected.includes(optionText)) {
                    newSelected.push(optionText);
                  }
                } else {
                  newSelected = newSelected.filter(opt => opt !== optionText);
                }
                onAnswerChange(newSelected.join('|'));
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="flex-1">{optionText}</span>
          </label>
        );
      })}
      {selectedOptions.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Wybrano: {selectedOptions.length} opcji
        </p>
      )}
    </div>
  );
};

// Komponent dla prawda/fałsz
const TrueFalseInput: React.FC<TaskInputProps> = ({ currentAnswer, onAnswerChange }) => {
  return (
    <RadioGroup value={currentAnswer} onValueChange={onAnswerChange}>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Prawda" id="true-option" />
          <Label 
            htmlFor="true-option" 
            className="cursor-pointer flex-1 p-4 rounded-lg border hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Prawda</span>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Fałsz" id="false-option" />
          <Label 
            htmlFor="false-option" 
            className="cursor-pointer flex-1 p-4 rounded-lg border hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium">Fałsz</span>
            </div>
          </Label>
        </div>
      </div>
    </RadioGroup>
  );
};

// Komponent dla uzupełniania luki
const FillBlankInput: React.FC<TaskInputProps> = ({ currentTask, currentAnswer, onAnswerChange }) => {
  // Zamieniamy ___ na wizualną lukę
  const questionWithBlank = currentTask.question_text.split('___').map((part: string, index: number, array: string[]) => (
    <React.Fragment key={index}>
      {part}
      {index < array.length - 1 && (
        <span className="inline-block min-w-[100px] border-b-2 border-gray-400 mx-2">&nbsp;</span>
      )}
    </React.Fragment>
  ));

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700 text-lg">
          {questionWithBlank}
        </p>
      </div>
      <Input
        value={currentAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Wpisz brakujące słowo/wyrażenie..."
        className="w-full p-4 text-lg"
      />
      {currentTask.correct_answer?.includes(',') && (
        <p className="text-sm text-gray-500">
          Wskazówka: Może być kilka poprawnych odpowiedzi
        </p>
      )}
    </div>
  );
};

// Komponent dla nieobsługiwanych typów
const UnsupportedTypeInput: React.FC<TaskInputProps> = ({ currentTask, currentAnswer, onAnswerChange }) => {
  return (
    <div className="space-y-2">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
        <p className="text-sm text-yellow-800">
          Ten typ zadania ({currentTask.type}) nie jest jeszcze w pełni obsługiwany.
        </p>
      </div>
      <Textarea
        value={currentAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Wpisz swoją odpowiedź..."
        className="w-full p-4 min-h-24"
      />
    </div>
  );
};

// ====== KOMPONENTY UI ======

// Komponent nagłówka lekcji
const LessonHeader: React.FC<{
  lesson: any;
  currentTaskIndex: number;
  totalTasks: number;
  progress: number;
  onExit: () => void;
}> = ({ lesson, currentTaskIndex, totalTasks, progress, onExit }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
            <p className="text-gray-600">
              Pytanie {currentTaskIndex + 1} z {totalTasks}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onExit}
            size="sm"
          >
            Wyjdź
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
};

// Komponent nawigacji między zadaniami
const TaskNavigation: React.FC<{
  currentTaskIndex: number;
  totalTasks: number;
  currentAnswer: string;
  isSubmitting: boolean;
  xpReward: number;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ currentTaskIndex, totalTasks, currentAnswer, isSubmitting, xpReward, onPrevious, onNext }) => {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentTaskIndex === 0}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Poprzednie
      </Button>

      <div className="text-sm text-gray-500">
        {xpReward} XP za poprawną odpowiedź
      </div>

      <Button
        onClick={onNext}
        disabled={!currentAnswer.trim() || isSubmitting}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
      >
        {isSubmitting ? (
          "Zapisywanie..."
        ) : currentTaskIndex === totalTasks - 1 ? (
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
  );
};

// Komponent postępu odpowiedzi
const AnswerProgress: React.FC<{
  tasks: any[];
  answers: Answer[];
  currentTaskIndex: number;
  currentAnswer: string;
}> = ({ tasks, answers, currentTaskIndex, currentAnswer }) => {
  return (
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
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
  );
};

// Komponent ekranu wyniku
const LessonResults: React.FC<{
  results: any;
  onDashboard: () => void;
  onRetry: () => void;
  onNextLesson: () => void;
}> = ({ results, onDashboard, onRetry, onNextLesson }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
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
              <div className="text-2xl font-bold text-green-600">
                {results.correct_tasks}/{results.total_tasks}
              </div>
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
              onClick={onDashboard}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Powrót do panelu
            </Button>
            
            {results.score < 70 && (
              <Button 
                onClick={onRetry}
                variant="outline"
              >
                Spróbuj ponownie
              </Button>
            )}
            
            <Button 
              onClick={onNextLesson}
              variant="outline"
            >
              Kolejna lekcja
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Komponent modal dla artykułu
const ArticleModal: React.FC<{
  article: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ article, isOpen, onClose }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Materiał pomocniczy</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== GŁÓWNY KOMPONENT ======
const LessonTake: React.FC = () => {
  // ✅ PARAMETRY I NAWIGACJA
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ HOOKI
  const { data: identity, isLoading: identityLoading } = useGetIdentity<{ id: string }>();

  // ✅ STATE
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArticle, setShowArticle] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // ✅ QUERIES
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

  const { data: articlesData } = useList({
    resource: "articles",
    filters: [{ field: "lesson_id", operator: "eq", value: id || "dummy" }],
    sorters: [{ field: "sort_order", order: "asc" }],
    queryOptions: {
      enabled: !!id,
    },
  });

  // ✅ DERIVED STATE
  const lesson = lessonData?.data;
  const tasks = tasksData?.data || [];
  const articles = articlesData?.data || [];
  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? ((currentTaskIndex + 1) / tasks.length) * 100 : 0;

  // ✅ EFFECTS
  useEffect(() => {
    if (currentTask) {
      const existingAnswer = answers.find(a => a.task_id === currentTask.id);
      setCurrentAnswer(existingAnswer?.answer || "");
    }
  }, [currentTaskIndex, currentTask, answers]);

  // ✅ HELPER FUNCTIONS
  const parseOptions = () => {
    if (!currentTask?.options) return [];
    
    console.log("🔍 Debugging options:", {
      type: typeof currentTask.options,
      value: currentTask.options,
      isArray: Array.isArray(currentTask.options)
    });
    
    try {
      let parsedOptions = currentTask.options;
      
      // Jeśli to string, parsuj JSON
      if (typeof currentTask.options === 'string') {
        parsedOptions = JSON.parse(currentTask.options);
      }
      
      // Jeśli to tablica stringów (stary format)
      if (Array.isArray(parsedOptions) && parsedOptions.length > 0 && typeof parsedOptions[0] === 'string') {
        // Pierwszy element to często powtórzenie pytania, pomijamy go
        // Sprawdzamy czy pierwszy element wygląda jak pytanie (dłuższy tekst)
        if (parsedOptions[0].length > 20 || parsedOptions[0].includes('?')) {
          return parsedOptions.slice(1); // Zwracamy tylko odpowiedzi (od 2 elementu)
        }
        // Jeśli nie, zwracamy całą tablicę
        return parsedOptions;
      }
      
      // Jeśli to tablica obiektów (nowy format z TaskCreate)
      if (Array.isArray(parsedOptions)) {
        return parsedOptions;
      }
      
      return [];
    } catch (e) {
      console.error("Błąd parsowania options:", e);
      return [];
    }
  };

  // ✅ EVENT HANDLERS
  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const saveCurrentAnswer = () => {
    if (!currentTask?.id || !currentAnswer.trim()) return;

    const newAnswers = answers.filter(a => a.task_id !== String(currentTask.id));
    newAnswers.push({
      task_id: String(currentTask.id),
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
      const filtered = finalAnswers.filter(a => a.task_id !== (currentTask.id as string));
      filtered.push({ task_id: currentTask.id as string, answer: currentAnswer.trim() });
      finalAnswers.splice(0, finalAnswers.length, ...filtered);
    }

    if (finalAnswers.length !== tasks.length) {
      alert("Proszę odpowiedzieć na wszystkie pytania");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabaseClient.rpc('fn_process_lesson_answers', {
        p_user_id: identity.id,
        p_lesson_id: id,
        p_answers: finalAnswers
      });

      if (error) {
        throw error;
      }

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

  // ✅ RENDER HELPERS - dostosowane do formatu z TaskCreate
  const renderTaskInput = () => {
    if (!currentTask) return null;

    const props = {
      currentTask: { ...currentTask, options: parseOptions() },
      currentAnswer,
      onAnswerChange: handleAnswerChange
    };

    switch (currentTask.type) {
      case 'single_choice':
        return <SingleChoiceInput {...props} />;
      
      case 'multiple_choice':
        return <MultipleChoiceInput {...props} />;
      
      case 'true_false':
        return <TrueFalseInput {...props} />;
      
      case 'fill_blank':
        return <FillBlankInput {...props} />;
      
      default:
        return <UnsupportedTypeInput {...props} />;
    }
  };

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

  // ✅ RESULTS SCREEN
  if (isCompleted && results) {
    return (
      <LessonResults
        results={results}
        onDashboard={() => navigate('/student/dashboard')}
        onRetry={() => window.location.reload()}
        onNextLesson={() => navigate('/student/lessons')}
      />
    );
  }

  // ✅ MAIN RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl">
        
        <LessonHeader
          lesson={lesson}
          currentTaskIndex={currentTaskIndex}
          totalTasks={tasks.length}
          progress={progress}
          onExit={() => navigate('/student/lessons')}
        />

        {currentTask && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentTask.question_text}
              </CardTitle>
              {currentTask.article_id && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedArticleId(currentTask.article_id);
                      setShowArticle(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    📖 Zobacz materiał pomocniczy
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {renderTaskInput()}
              
              {/* Wyświetl wyjaśnienie jeśli użytkownik już odpowiedział */}
              {currentTask.explanation && currentAnswer && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Podpowiedź:</p>
                      <p className="text-blue-800 text-sm">{currentTask.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <TaskNavigation
                currentTaskIndex={currentTaskIndex}
                totalTasks={tasks.length}
                currentAnswer={currentAnswer}
                isSubmitting={isSubmitting}
                xpReward={currentTask.xp_reward}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </CardContent>
          </Card>
        )}

        <AnswerProgress
          tasks={tasks}
          answers={answers}
          currentTaskIndex={currentTaskIndex}
          currentAnswer={currentAnswer}
        />

      </div>
      
      {/* Modal z artykułem */}
      <ArticleModal
        article={articles.find(a => a.id === selectedArticleId)}
        isOpen={showArticle}
        onClose={() => {
          setShowArticle(false);
          setSelectedArticleId(null);
        }}
      />
    </div>
  );
};

export default LessonTake;
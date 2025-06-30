// src/pages/teacher/ui.BadgeCriteriaCreate.tsx
import { useCreate, useList, useNavigation } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { 
  Save, 
  ArrowLeft, 
  Target,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  Trophy,
  Zap
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";

const CRITERIA_TYPES = [
  { 
    value: 'level', 
    label: 'Osiągnięty poziom', 
    description: 'Użytkownik musi osiągnąć określony poziom',
    icon: TrendingUp,
    unit: 'poziom',
    examples: '5, 10, 15'
  },
  { 
    value: 'xp', 
    label: 'Łączne XP', 
    description: 'Użytkownik musi zdobyć określoną liczbę punktów doświadczenia',
    icon: Star,
    unit: 'punktów',
    examples: '1000, 5000, 10000'
  },
  { 
    value: 'streak', 
    label: 'Seria dni', 
    description: 'Użytkownik musi mieć serię aktywności przez określoną liczbę dni',
    icon: Clock,
    unit: 'dni',
    examples: '7, 14, 30'
  },
  { 
    value: 'lessons_completed', 
    label: 'Ukończone lekcje', 
    description: 'Użytkownik musi ukończyć określoną liczbę lekcji',
    icon: CheckCircle,
    unit: 'lekcji',
    examples: '10, 25, 50'
  },
  { 
    value: 'perfect_scores', 
    label: 'Perfekcyjne wyniki', 
    description: 'Użytkownik musi uzyskać 100% w określonej liczbie lekcji',
    icon: Trophy,
    unit: 'wyników',
    examples: '5, 10, 20'
  },
  { 
    value: 'total_tasks', 
    label: 'Wykonane zadania', 
    description: 'Użytkownik musi wykonać określoną liczbę zadań',
    icon: Target,
    unit: 'zadań',
    examples: '50, 100, 200'
  },
];

export default function BadgeCriteriaCreate() {
  const { badgeId } = useParams<{ badgeId: string }>();
  const { mutate: createCriterion, isLoading } = useCreate();
  const { list } = useNavigation();

  // Pobierz dane odznaki
  const { data: badgeData } = useList({
    resource: "badges",
    filters: [
      {
        field: "id",
        operator: "eq",
        value: badgeId,
      },
    ],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const selectedCriteriaType = watch("criteria_type");
  const selectedCriteria = CRITERIA_TYPES.find(ct => ct.value === selectedCriteriaType);

  const onSubmit = (data: any) => {
    createCriterion({
      resource: "badge_criteria",
      values: {
        badge_id: badgeId,
        criteria_type: data.criteria_type,
        criteria_value: parseInt(data.criteria_value),
      },
    }, {
      onSuccess: () => {
        list("badges");
      }
    });
  };

  const badge = badgeData?.data?.[0];

  return (
    <>
      <FlexBox>
        <Lead
          title={`Dodaj kryterium dla: ${badge?.name || 'Ładowanie...'}`}
          description="Utwórz nowe kryterium przyznawania odznaki"
        />
        <Button variant="outline" onClick={() => list("badges")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót
        </Button>
      </FlexBox>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Typ kryterium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="criteria_type">Wybierz typ kryterium *</Label>
              <Select
                onValueChange={(value) => setValue("criteria_type", value)}
              >
                <SelectTrigger className={errors.criteria_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz typ kryterium" />
                </SelectTrigger>
                <SelectContent>
                  {CRITERIA_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.criteria_type && (
                <p className="text-sm text-red-600 mt-1">Wybór typu kryterium jest wymagany</p>
              )}
            </div>

            {selectedCriteria && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <selectedCriteria.icon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">{selectedCriteria.label}</h4>
                </div>
                <p className="text-sm text-blue-800 mb-2">{selectedCriteria.description}</p>
                <p className="text-xs text-blue-600">
                  Przykłady wartości: {selectedCriteria.examples}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Wartość kryterium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="criteria_value">
                Wartość progowa *
                {selectedCriteria && (
                  <span className="text-muted-foreground ml-1">
                    ({selectedCriteria.unit})
                  </span>
                )}
              </Label>
              <Input
                id="criteria_value"
                type="number"
                min="1"
                {...register("criteria_value", { 
                  required: "Wartość jest wymagana",
                  min: { value: 1, message: "Wartość musi być większa od 0" }
                })}
                placeholder={selectedCriteria?.examples.split(', ')[0] || "Wpisz wartość"}
                className={errors.criteria_value ? "border-red-500" : ""}
              />
             {typeof errors.criteria_value === 'string' && (
  <p className="text-sm text-red-600 mt-1">{errors.criteria_value}</p>
)}
            </div>

            {selectedCriteria && watch("criteria_value") && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Podgląd kryterium</h4>
                <p className="text-sm text-green-800">
                  Użytkownik otrzyma odznakę "{badge?.name}" gdy osiągnie{" "}
                  <strong>{selectedCriteria.label.toLowerCase()}</strong> na poziomie{" "}
                  <strong>{watch("criteria_value")} {selectedCriteria.unit}</strong>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Criteria Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Popularne wartości dla tego typu</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCriteria ? (
              <div className="grid grid-cols-3 gap-3">
                {selectedCriteria.examples.split(', ').map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
                    onClick={() => setValue("criteria_value", example)}
                    className="h-12 flex-col gap-1"
                  >
                    <span className="font-bold">{example}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedCriteria.unit}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Wybierz typ kryterium, aby zobaczyć sugestie wartości
              </p>
            )}
          </CardContent>
        </Card>

        <FlexBox>
          <Button
            type="button"
            variant="outline"
            onClick={() => list("badges")}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Tworzenie..." : "Utwórz kryterium"}
          </Button>
        </FlexBox>
      </form>
    </>
  );
}
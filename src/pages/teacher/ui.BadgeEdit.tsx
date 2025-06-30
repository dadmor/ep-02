// src/pages/teacher/ui.BadgeEdit.tsx
import { useUpdate, useOne, useList, useCreate, useDelete, useNavigation } from "@refinedev/core";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Award, 
  Save, 
  ArrowLeft, 
  Plus,
  Trash2,
  Star,
  Trophy,
  Medal,
  Crown,
  Target,
  Zap,
  Loader2
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { useState, useEffect } from "react";

interface BadgeCriterion {
  id?: string;
  criteria_type: string;
  criteria_value: number;
  badge_id?: string;
}

const CRITERIA_TYPES = [
  { value: 'level', label: 'Osiągnięty poziom', description: 'Poziom użytkownika' },
  { value: 'xp', label: 'Łączne XP', description: 'Suma zdobytych punktów doświadczenia' },
  { value: 'streak', label: 'Seria dni', description: 'Liczba kolejnych dni aktywności' },
  { value: 'lessons_completed', label: 'Ukończone lekcje', description: 'Liczba ukończonych lekcji' },
  { value: 'perfect_scores', label: 'Perfekcyjne wyniki', description: 'Liczba lekcji z wynikiem 100%' },
  { value: 'total_tasks', label: 'Wykonane zadania', description: 'Łączna liczba wykonanych zadań' },
];

const BADGE_ICONS = [
  { icon: Award, name: 'award', label: 'Nagroda' },
  { icon: Trophy, name: 'trophy', label: 'Puchar' },
  { icon: Medal, name: 'medal', label: 'Medal' },
  { icon: Crown, name: 'crown', label: 'Korona' },
  { icon: Star, name: 'star', label: 'Gwiazda' },
  { icon: Target, name: 'target', label: 'Cel' },
  { icon: Zap, name: 'zap', label: 'Błyskawica' },
];

export default function BadgeEdit() {
  const { id } = useParams<{ id: string }>();
  const { mutate: updateBadge, isLoading: isUpdating } = useUpdate();
  const { mutate: createCriterion } = useCreate();
  const { mutate: deleteCriterion } = useDelete();
  const { list } = useNavigation();
  
  const [criteria, setCriteria] = useState<BadgeCriterion[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  // Pobierz dane odznaki
  const { data: badgeData, isLoading: badgeLoading } = useOne({
    resource: "badges",
    id: id!,
  });

  // Pobierz kryteria odznaki
  const { data: criteriaData, isLoading: criteriaLoading } = useList({
    resource: "badge_criteria",
    filters: [
      {
        field: "badge_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm();

  const init = useLoading({ 
    isLoading: badgeLoading || criteriaLoading, 
    isError: false 
  });

  // Ustaw dane formularza po załadowaniu
  useEffect(() => {
    if (badgeData?.data) {
      const badge = badgeData.data;
      reset({
        name: badge.name,
        description: badge.description || '',
      });
      
      // Wyciągnij nazwę ikony z URL
      if (badge.icon_url) {
        const iconName = badge.icon_url.split('/').pop()?.replace('.svg', '') || '';
        setSelectedIcon(iconName);
      }
    }
  }, [badgeData, reset]);

  useEffect(() => {
    if (criteriaData?.data) {
      setCriteria(criteriaData.data as BadgeCriterion[]);
    }
  }, [criteriaData]);

  if (init) return init;

  const onSubmit = async (data: any) => {
    try {
      // Aktualizuj odznakę
      await new Promise((resolve, reject) => {
        updateBadge({
          resource: "badges",
          id: id!,
          values: {
            name: data.name,
            description: data.description,
            icon_url: selectedIcon ? `/icons/${selectedIcon}.svg` : null,
          },
        }, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });

      // Usuń stare kryteria i dodaj nowe
      const existingCriteria = criteriaData?.data || [];
      
      // Usuń kryteria które nie są już w liście
      for (const existing of existingCriteria) {
        const stillExists = criteria.find(c => c.id === existing.id);
        if (!stillExists) {
            await new Promise((resolve, reject) => {
                deleteCriterion({
                  resource: "badge_criteria",
                  id: existing.id ?? '',
                }, {
                  onSuccess: (data) => resolve(data),
                  onError: (error) => reject(error),
                });
              });
        }
      }

      // Dodaj nowe kryteria
      for (const criterion of criteria) {
        if (!criterion.id) {
          await new Promise((resolve, reject) => {
            createCriterion({
              resource: "badge_criteria",
              values: {
                badge_id: id!,
                criteria_type: criterion.criteria_type,
                criteria_value: criterion.criteria_value,
              },
            }, {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            });
          });
        }
      }

      list("badges");
    } catch (error) {
      console.error("Błąd podczas aktualizacji odznaki:", error);
    }
  };

  const addCriterion = () => {
    setCriteria([...criteria, { criteria_type: '', criteria_value: 0 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof BadgeCriterion, value: any) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const badge = badgeData?.data;

  return (
    <>
      <FlexBox>
        <Lead
          title={`Edytuj odznakę: ${badge?.name || 'Ładowanie...'}`}
          description="Modyfikuj odznakę i jej kryteria przyznawania"
        />
        <Button variant="outline" onClick={() => list("badges")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do listy
        </Button>
      </FlexBox>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Podstawowe informacje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nazwa odznaki *</Label>
              <Input
                id="name"
                {...register("name", { 
                  required: "Nazwa jest wymagana",
                  minLength: { value: 2, message: "Nazwa musi mieć co najmniej 2 znaki" }
                })}
                placeholder="np. Mistrz Matematyki"
                className={errors.name ? "border-red-500" : ""}
              />
            {errors.name && (
  <p className="text-sm text-red-600 mt-1">{String(errors.name.message)}</p>
)}
            </div>

            <div>
              <Label htmlFor="description">Opis odznaki</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Opisz za co przyznawana jest ta odznaka..."
                rows={3}
              />
            </div>

            <div>
              <Label>Ikona odznaki</Label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-2">
                {BADGE_ICONS.map(({ icon: Icon, name, label }) => (
                  <Button
                    key={name}
                    type="button"
                    variant={selectedIcon === name ? "default" : "outline"}
                    className="h-16 flex-col gap-1"
                    onClick={() => setSelectedIcon(name)}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
              {selectedIcon && (
                <p className="text-sm text-muted-foreground mt-2">
                  Wybrano: {BADGE_ICONS.find(i => i.name === selectedIcon)?.label}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Kryteria przyznawania
              </CardTitle>
              <Button type="button" variant="outline" onClick={addCriterion}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj kryterium
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {criteria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Brak kryteriów</p>
                <p className="text-sm">Dodaj kryteria, które użytkownik musi spełnić</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((criterion, index) => (
                  <Card key={criterion.id || index} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Typ kryterium</Label>
                        <Select
                          value={criterion.criteria_type}
                          onValueChange={(value) => updateCriterion(index, 'criteria_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz typ kryterium" />
                          </SelectTrigger>
                          <SelectContent>
                            {CRITERIA_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-sm text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32">
                        <Label>Wartość</Label>
                        <Input
                          type="number"
                          min="1"
                          value={criterion.criteria_value}
                          onChange={(e) => updateCriterion(index, 'criteria_value', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {criterion.criteria_type && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {CRITERIA_TYPES.find(t => t.value === criterion.criteria_type)?.description}
                        {criterion.criteria_value > 0 && `: ${criterion.criteria_value}`}
                      </div>
                    )}

                    {criterion.id && (
                      <div className="mt-2 text-xs text-blue-600">
                        Istniejące kryterium (ID: {criterion.id.slice(0, 8)}...)
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {watch("name") && (
          <Card>
            <CardHeader>
              <CardTitle>Podgląd odznaki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  {selectedIcon ? (
                    (() => {
                      const IconComponent = BADGE_ICONS.find(i => i.name === selectedIcon)?.icon;
                      return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : <Award className="w-8 h-8 text-white" />;
                    })()
                  ) : (
                    <Award className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{watch("name") || "Nazwa odznaki"}</h3>
                  <p className="text-muted-foreground">{watch("description") || "Brak opisu"}</p>
                  {criteria.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Kryteria: {criteria.length} warunków
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <FlexBox>
          <Button
            type="button"
            variant="outline"
            onClick={() => list("badges")}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Zapisz zmiany
              </>
            )}
          </Button>
        </FlexBox>
      </form>
    </>
  );
}
// src/pages/teacher/ui.BadgeShow.tsx
import { useOne, useList, useNavigation, useDelete } from "@refinedev/core";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Award, 
  Users,
  Calendar,
  Trophy,
  Target,
  Star,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";

const CRITERIA_TYPES = [
  { value: 'level', label: 'Osiągnięty poziom', description: 'Poziom użytkownika', icon: TrendingUp },
  { value: 'xp', label: 'Łączne XP', description: 'Suma zdobytych punktów doświadczenia', icon: Star },
  { value: 'streak', label: 'Seria dni', description: 'Liczba kolejnych dni aktywności', icon: Clock },
  { value: 'lessons_completed', label: 'Ukończone lekcje', description: 'Liczba ukończonych lekcji', icon: CheckCircle },
  { value: 'perfect_scores', label: 'Perfekcyjne wyniki', description: 'Liczba lekcji z wynikiem 100%', icon: Trophy },
  { value: 'total_tasks', label: 'Wykonane zadania', description: 'Łączna liczba wykonanych zadań', icon: Target },
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

export default function BadgeShow() {
  const { id } = useParams<{ id: string }>();
  const { list, edit } = useNavigation();
  const { mutate: deleteBadge } = useDelete();

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

  // Pobierz przyznane odznaki
  const { data: userBadges, isLoading: userBadgesLoading } = useList({
    resource: "user_badges",
    filters: [
      {
        field: "badge_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "awarded_at",
        order: "desc",
      },
    ],
  });

  // Pobierz dane użytkowników do wyświetlenia nazw
  const { data: users } = useList({
    resource: "users",
    pagination: { mode: "off" },
  });

  const init = useLoading({ 
    isLoading: badgeLoading || criteriaLoading || userBadgesLoading, 
    isError: false 
  });

  if (init) return init;

  const badge = badgeData?.data;
  const criteria = criteriaData?.data || [];
  const awardedBadges = userBadges?.data || [];
  const usersList = users?.data || [];

  const getBadgeIcon = (iconUrl?: string) => {
    if (iconUrl) {
      const iconName = iconUrl.split('/').pop()?.replace('.svg', '') || '';
      const IconComponent = BADGE_ICONS.find(i => i.name === iconName)?.icon;
      return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : <Award className="w-8 h-8 text-white" />;
    }
    return <Award className="w-8 h-8 text-white" />;
  };

  const getCriteriaInfo = (criteriaType: string) => {
    return CRITERIA_TYPES.find(t => t.value === criteriaType) || {
      label: criteriaType,
      description: 'Nieznane kryterium',
      icon: AlertCircle
    };
  };

  const getUserName = (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    return user?.username || user?.email || `Użytkownik ${userId.slice(0, 8)}...`;
  };

  const handleDelete = () => {
    if (confirm(`Czy na pewno chcesz usunąć odznakę "${badge?.name}"? Ta akcja jest nieodwracalna i usunie również wszystkie przyznane odznaki.`)) {
      deleteBadge({
        resource: "badges",
        id: id!,
      }, {
        onSuccess: () => {
          list("badges");
        }
      });
    }
  };

  const awardedStats = {
    total: awardedBadges.length,
    thisMonth: awardedBadges.filter(ab => {
      const awardedDate = new Date(ab.awarded_at);
      const now = new Date();
      return awardedDate.getMonth() === now.getMonth() && awardedDate.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: awardedBadges.filter(ab => {
      const awardedDate = new Date(ab.awarded_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return awardedDate >= weekAgo;
    }).length,
  };

  return (
    <>
      <FlexBox>
        <Lead
          title={badge?.name || 'Ładowanie...'}
          description="Szczegóły odznaki i statystyki przyznawania"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => list("badges")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do listy
          </Button>
          <Button variant="outline" onClick={() => edit("badges", id!)}>
            <Edit className="w-4 h-4 mr-2" />
            Edytuj
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń
          </Button>
        </div>
      </FlexBox>

      {/* Badge Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje o odznace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              {getBadgeIcon(badge?.icon_url)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{badge?.name}</h2>
              {badge?.description && (
                <p className="text-muted-foreground mb-4">{badge?.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{awardedStats.total}</div>
                    <div className="text-sm text-muted-foreground">Przyznanych łącznie</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">{awardedStats.thisMonth}</div>
                    <div className="text-sm text-muted-foreground">W tym miesiącu</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">{awardedStats.thisWeek}</div>
                    <div className="text-sm text-muted-foreground">W tym tygodniu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Kryteria przyznawania ({criteria.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criteria.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Brak kryteriów</p>
              <p className="text-sm">Ta odznaka nie ma zdefiniowanych kryteriów</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criteria.map((criterion: any) => {
                const criteriaInfo = getCriteriaInfo(criterion.criteria_type);
                const IconComponent = criteriaInfo.icon;
                
                return (
                  <Card key={criterion.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{criteriaInfo.label}</h4>
                        <p className="text-sm text-muted-foreground">{criteriaInfo.description}</p>
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          {criterion.criteria_value}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {awardedStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Łącznie przyznanych</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(awardedBadges.map(ab => ab.user_id)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unikalnych użytkowników</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {awardedStats.thisMonth}
              </div>
              <div className="text-sm text-muted-foreground">W tym miesiącu</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {criteria.length}
              </div>
              <div className="text-sm text-muted-foreground">Kryteriów</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Awards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ostatnio przyznane ({awardedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {awardedBadges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Brak przyznanych odznak</p>
              <p className="text-sm">Ta odznaka nie została jeszcze nikomu przyznana</p>
            </div>
          ) : (
            <div className="space-y-3">
              {awardedBadges.slice(0, 10).map((awardedBadge: any) => (
                <div key={awardedBadge.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      <Users className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{getUserName(awardedBadge.user_id)}</h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {awardedBadge.user_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(awardedBadge.awarded_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(awardedBadge.awarded_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Przyznana
                  </Badge>
                </div>
              ))}
              
              {awardedBadges.length > 10 && (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">I {awardedBadges.length - 10} więcej...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Awards Timeline */}
      {awardedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline przyznawania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {awardedBadges
                .reduce((acc: any[], curr: any) => {
                  const date = new Date(curr.awarded_at).toDateString();
                  const existingDate = acc.find(item => item.date === date);
                  if (existingDate) {
                    existingDate.count++;
                    existingDate.awards.push(curr);
                  } else {
                    acc.push({
                      date,
                      count: 1,
                      awards: [curr]
                    });
                  }
                  return acc;
                }, [])
                .slice(0, 7)
                .map((dayGroup: any) => (
                  <div key={dayGroup.date} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {new Date(dayGroup.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dayGroup.count} przyznań
                      </div>
                    </div>
                    <Badge variant="outline">
                      {dayGroup.count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => edit("badges", id!)}
            >
              <Edit className="w-5 h-5" />
              <span>Edytuj odznakę</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => {
                // Navigate to users list with badge filter
                window.location.href = `/teacher/students?badge=${id}`;
              }}
            >
              <Users className="w-5 h-5" />
              <span>Zobacz posiadaczy</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => list("badges")}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Powrót do listy</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
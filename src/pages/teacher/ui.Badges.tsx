// src/pages/teacher/ui.Badges.tsx
import { useTable, useNavigation, useDelete, useList } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Award, 
  Users,
  Calendar,
  Trophy,
  Star,
  Medal,
  Crown
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";

export default function TeacherBadges() {
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable({
    resource: "badges",
    sorters: {
      initial: [
        {
          field: "name",
          order: "asc",
        },
      ],
    },
  });

  // Pobierz informacje o przyznanych odznakach
  const { data: userBadges } = useList({
    resource: "user_badges",
    pagination: { mode: "off" },
  });

  // Pobierz kryteria odznak
  const { data: badgeCriteria } = useList({
    resource: "badge_criteria",
    pagination: { mode: "off" },
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteBadge } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const userBadgeList = userBadges?.data || [];
  const criteriaList = badgeCriteria?.data || [];

  const getBadgeIcon = (iconUrl?: string) => {
    if (iconUrl) {
      return <AvatarImage src={iconUrl} />;
    }
    return <Award className="w-6 h-6" />;
  };

  const getBadgeStats = (badgeId: string) => {
    const awardedCount = userBadgeList.filter(ub => ub.badge_id === badgeId).length;
    const criteria = criteriaList.filter(c => c.badge_id === badgeId);
    return { awardedCount, criteriaCount: criteria.length };
  };

  const getCriteriaTypeLabel = (type: string) => {
    switch (type) {
      case 'lessons_completed': return 'Ukończone lekcje';
      case 'perfect_scores': return 'Perfekcyjne wyniki';
      case 'streak_days': return 'Seria dni';
      case 'total_xp': return 'Łączne XP';
      case 'level_reached': return 'Osiągnięty poziom';
      default: return type;
    }
  };

  return (
    <>
      <FlexBox>
        <Lead
          title="Odznaki systemowe"
          description="Zarządzaj odznakami i osiągnięciami dla uczniów"
        />

        <Button onClick={() => create("badges")}>
          <Plus className="w-4 h-4 mr-2" />
          Utwórz nową odznakę
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj odznak..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "name",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak odznak</h3>
            <p className="text-muted-foreground mb-6">
              Nie ma jeszcze żadnych odznak w systemie. Utwórz pierwszą odznakę, aby motywować uczniów.
            </p>
            <Button onClick={() => create("badges")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszą odznakę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((badge: any) => {
            const stats = getBadgeStats(badge.id);
            const criteria = criteriaList.filter(c => c.badge_id === badge.id);
            
            return (
              <Card key={badge.id}>
                <CardHeader>
                  <FlexBox>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        {getBadgeIcon(badge.icon_url)}
                        <AvatarFallback>
                          <Award className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          #{badge.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      {stats.awardedCount}
                    </Badge>
                  </FlexBox>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {badge.description && (
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                    )}

                    <FlexBox>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Przyznano
                      </span>
                      <Badge variant="outline">
                        {stats.awardedCount} razy
                      </Badge>
                    </FlexBox>

                    <FlexBox>
                      <span className="text-sm font-medium">Kryteria</span>
                      <Badge variant="secondary">
                        {stats.criteriaCount} warunków
                      </Badge>
                    </FlexBox>

                    {criteria.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Warunki:</span>
                        {criteria.slice(0, 2).map((criterion: any) => (
                          <div key={criterion.id} className="text-xs p-2 bg-muted rounded">
                            {getCriteriaTypeLabel(criterion.criteria_type)}: {criterion.criteria_value}
                          </div>
                        ))}
                        {criteria.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{criteria.length - 2} więcej...
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      ID: #{badge.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <FlexBox>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => show("badges", badge.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit("badges", badge.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </FlexBox>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(`Czy na pewno chcesz usunąć odznakę "${badge.name}"? Ta akcja jest nieodwracalna.`)
                      ) {
                        deleteBadge({
                          resource: "badges",
                          id: badge.id,
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </GridBox>
      )}

      {/* Badge Statistics */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Statystyki odznak</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.data.length}
                </div>
                <div className="text-sm text-muted-foreground">Wszystkich odznak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userBadgeList.length}
                </div>
                <div className="text-sm text-muted-foreground">Przyznanych łącznie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {criteriaList.length}
                </div>
                <div className="text-sm text-muted-foreground">Kryteriów łącznie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(userBadgeList.map((ub: any) => ub.user_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Uczniów z odznakami</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Badges */}
      {data?.data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Najpopularniejsze odznaki</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.data
                .map((badge: any) => ({
                  ...badge,
                  awardedCount: getBadgeStats(badge.id).awardedCount
                }))
                .sort((a: any, b: any) => b.awardedCount - a.awardedCount)
                .slice(0, 5)
                .map((badge: any, index: number) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        {getBadgeIcon(badge.icon_url)}
                        <AvatarFallback>
                          <Award className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {badge.description || 'Brak opisu'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {badge.awardedCount} przyznań
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Badge Awards */}
      {userBadgeList.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-medium">Ostatnio przyznane odznaki</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBadgeList
                .sort((a: any, b: any) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime())
                .slice(0, 10)
                .map((userBadge: any) => {
                  const badge = data?.data?.find((b: any) => b.id === userBadge.badge_id);
                  return (
                    <div key={userBadge.id} className="flex items-center gap-3 p-3 border rounded">
                      <Avatar className="w-8 h-8">
                        {getBadgeIcon(badge?.icon_url)}
                        <AvatarFallback>
                          <Award className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{badge?.name || 'Nieznana odznaka'}</h4>
                        <p className="text-sm text-muted-foreground">
                          Użytkownik: {userBadge.user_id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(userBadge.awarded_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(userBadge.awarded_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-medium">Szybkie akcje</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("badges")}
            >
              <Star className="w-6 h-6" />
              <span>Utwórz odznakę osiągnięć</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("badges")}
            >
              <Medal className="w-6 h-6" />
              <span>Utwórz odznakę za postępy</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => create("badges")}
            >
              <Crown className="w-6 h-6" />
              <span>Utwórz odznakę specjalną</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="odznak"
      />
    </>
  );
}
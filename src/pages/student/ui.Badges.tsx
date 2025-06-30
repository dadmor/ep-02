// src/pages/student/ui.Badges.tsx
import React from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Star } from "lucide-react";

const StudentBadges: React.FC = () => {
  const { data: identity } = useGetIdentity<{ id: string }>();

  const { data: allBadgesData } = useList({
    resource: "badges",
  });

  const { data: userBadgesData } = useList({
    resource: "user_badges",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
  });

  const { data: badgeCriteriaData } = useList({
    resource: "badge_criteria",
  });

  const allBadges = allBadgesData?.data || [];
  const userBadges = userBadgesData?.data || [];
  const criteria = badgeCriteriaData?.data || [];

  const badgesWithStatus = allBadges.map(badge => {
    const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
    const badgeCriteria = criteria.filter(c => c.badge_id === badge.id);
    
    return {
      ...badge,
      earned: !!userBadge,
      awarded_at: userBadge?.awarded_at,
      criteria: badgeCriteria
    };
  });

  const earnedBadges = badgesWithStatus.filter(b => b.earned);
  const availableBadges = badgesWithStatus.filter(b => !b.earned);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Twoje odznaki</h1>
        <p className="text-gray-600">
          Zdobyte: {earnedBadges.length} / {allBadges.length}
        </p>
      </div>

      {/* Zdobyte odznaki */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Zdobyte odznaki ({earnedBadges.length})
        </h2>
        
        {earnedBadges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <Badge className="bg-green-500">
                    Zdobyta {badge.awarded_at && new Date(badge.awarded_at).toLocaleDateString('pl-PL')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nie zdobyłeś jeszcze żadnych odznak</p>
              <p className="text-sm text-gray-400 mt-2">Ukończ lekcje, żeby zdobyć swoje pierwsze odznaki!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dostępne odznaki */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-500" />
          Do zdobycia ({availableBadges.length})
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBadges.map((badge) => (
            <Card key={badge.id} className="bg-gray-50 border-gray-200 opacity-75">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-700">{badge.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                
                {/* Kryteria */}
                {badge.criteria.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Wymagania:</p>
                    {badge.criteria.map((criterion, index) => (
                      <p key={index}>
                        {criterion.criteria_type === 'level' && `Osiągnij poziom ${criterion.criteria_value}`}
                        {criterion.criteria_type === 'streak' && `${criterion.criteria_value} dni z rzędu`}
                        {criterion.criteria_type === 'xp' && `Zdobądź ${criterion.criteria_value} XP`}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentBadges;
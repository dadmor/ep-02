// src/pages/student/ui.Rankings.tsx
import React from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, User } from "lucide-react";

const StudentRankings: React.FC = () => {
  const { data: identity } = useGetIdentity<{ id: string; username: string }>();

  const { data: rankingsData } = useList({
    resource: "student_rankings",
    pagination: { pageSize: 50 },
    sorters: [{ field: "rank", order: "asc" }],
  });

  const rankings = rankingsData?.data || [];
  const currentUser = rankings.find(r => r.user_id === identity?.id);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <Trophy className="w-6 h-6 text-gray-400" />;
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-500 text-white";
    return "bg-blue-500 text-white";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking uczniów</h1>
        <p className="text-gray-600">Zobacz jak plasują się wszyscy uczniowie</p>
      </div>

      {/* Twoja pozycja */}
      {currentUser && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Twoja pozycja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRankIcon(currentUser.rank)}
                <div>
                  <h3 className="font-bold text-lg">{currentUser.username}</h3>
                  <p className="text-gray-600">
                    Poziom {currentUser.level} • {currentUser.xp} XP • Passa: {currentUser.streak} dni
                  </p>
                </div>
              </div>
              <Badge className={getRankBadgeClass(currentUser.rank)}>
                #{currentUser.rank}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Podium</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {rankings.slice(0, 3).map((student) => (
            <Card 
              key={student.user_id}
              className={`${
                student.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' :
                student.rank === 2 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' :
                'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  {getRankIcon(student.rank)}
                </div>
                <h3 className="font-bold text-lg mb-2">{student.username}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Poziom {student.level}
                </p>
                <div className="space-y-1">
                  <p className="text-sm"><strong>{student.xp}</strong> XP</p>
                  <p className="text-xs text-gray-500">Passa: {student.streak} dni</p>
                </div>
                <Badge className={getRankBadgeClass(student.rank)} size="sm">
                  #{student.rank}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pełny ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-500" />
            Pełny ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankings.map((student) => (
              <div 
                key={student.user_id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  student.user_id === identity?.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Badge className={getRankBadgeClass(student.rank)} size="sm">
                    #{student.rank}
                  </Badge>
                  <div>
                    <h4 className={`font-medium ${
                      student.user_id === identity?.id ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {student.username}
                      {student.user_id === identity?.id && (
                        <span className="text-blue-500 text-sm ml-2">(To Ty!)</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Poziom {student.level} • Passa: {student.streak} dni
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{student.xp} XP</p>
                </div>
              </div>
            ))}
            
            {rankings.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Brak danych rankingowych
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRankings;
// src/pages/teacher/ui.Rankings.tsx
import { useTable, useList } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp,
  Users,
  Star,
  Flame,
  Crown,
  Target,
  BarChart3,
  Calendar,
  RefreshCw
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { useState } from "react";

export default function Rankings() {
  const [rankingType, setRankingType] = useState<string>('xp');

  // Pobierz dane z view student_rankings
  const {
    tableQuery: { data, isLoading, isError ,refetch},
    current,
    setCurrent,
    pageSize,
    setFilters,
    setSorters,

  } = useTable({
    resource: "student_rankings",
    sorters: {
      initial: [
        {
          field: "rank",
          order: "asc",
        },
      ],
    },
  });

  // Pobierz szczegółowe dane uczniów
  const { data: users } = useList({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "student",
      },
    ],
    pagination: { mode: "off" },
  });

  // Pobierz postępy uczniów
  const { data: progress } = useList({
    resource: "progress",
    pagination: { mode: "off" },
  });

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const rankingsList = data?.data || [];
  const usersList = users?.data || [];
  const progressList = progress?.data || [];

  // Funkcje pomocnicze
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUserStats = (userId: string) => {
    const userProgress = progressList.filter(p => p.user_id === userId);
    const avgScore = userProgress.length > 0 
      ? Math.round(userProgress.reduce((sum, p) => sum + p.score, 0) / userProgress.length)
      : 0;
    const completedLessons = userProgress.length;
    return { avgScore, completedLessons };
  };

  const handleSortChange = (sortBy: string) => {
    setRankingType(sortBy);
    let field = 'rank';
    let order: 'asc' | 'desc' = 'asc';

    switch (sortBy) {
      case 'xp':
        field = 'xp';
        order = 'desc';
        break;
      case 'level':
        field = 'level';
        order = 'desc';
        break;
      case 'streak':
        field = 'streak';
        order = 'desc';
        break;
      default:
        field = 'rank';
        order = 'asc';
    }

    setSorters([{ field, order }]);
  };

  // Statystyki ogólne
  const totalStudents = rankingsList.length;
  const avgXP = totalStudents > 0 
    ? Math.round(rankingsList.reduce((sum, r) => sum + (r.xp || 0), 0) / totalStudents)
    : 0;
  const avgLevel = totalStudents > 0 
    ? Math.round(rankingsList.reduce((sum, r) => sum + (r.level || 1), 0) / totalStudents * 10) / 10
    : 1;
  const activeStreaks = rankingsList.filter(r => (r.streak || 0) > 0).length;

  return (
    <>
      <FlexBox>
        <Lead
          title="Rankingi uczniów"
          description="Przeglądaj najlepszych uczniów i ich osiągnięcia"
        />
        
        <Button 
          variant="outline"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Odśwież ranking
        </Button>
      </FlexBox>

      {/* Statystyki ogólne */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <div className="text-sm text-muted-foreground">Uczniów w rankingu</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{avgXP}</div>
                <div className="text-sm text-muted-foreground">Średnie XP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{avgLevel}</div>
                <div className="text-sm text-muted-foreground">Średni poziom</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{activeStreaks}</div>
                <div className="text-sm text-muted-foreground">Aktywnych serii</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Filtry i sortowanie */}
      <Card>
        <CardHeader>
          <CardTitle>Opcje rankingu</CardTitle>
        </CardHeader>
        <CardContent>
          <FlexBox>
            <Input
              placeholder="Szukaj ucznia..."
              className="max-w-sm"
              onChange={(e) => {
                setFilters([
                  {
                    field: "username",
                    operator: "contains",
                    value: e.target.value,
                  },
                ]);
              }}
            />
            
            <Select value={rankingType} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sortuj według..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Pozycja ogólna</SelectItem>
                <SelectItem value="xp">Punkty XP</SelectItem>
                <SelectItem value="level">Poziom</SelectItem>
                <SelectItem value="streak">Seria dni</SelectItem>
              </SelectContent>
            </Select>
          </FlexBox>
        </CardContent>
      </Card>

      {/* Podium - Top 3 */}
      {rankingsList.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Podium zwycięzców
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[2, 1, 3].map(position => {
                const student = rankingsList.find(r => r.rank === position);
                if (!student) return null;
                
                const stats = getUserStats(student.user_id);
                
                return (
                  <Card key={student.user_id} className={`text-center ${position === 1 ? 'order-2 md:order-1 transform md:scale-110' : position === 2 ? 'order-1 md:order-none' : 'order-3'}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankColor(position)}`}>
                          {getRankIcon(position)}
                        </div>
                        
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            {getInitials(student.username || 'UN')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-bold">{student.username}</h3>
                          <Badge variant="outline">Poziom {student.level}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 w-full text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{student.xp}</div>
                            <div className="text-xs text-muted-foreground">XP</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">{student.streak}</div>
                            <div className="text-xs text-muted-foreground">Seria</div>
                          </div>
                        </div>
                        
                        <div className="w-full">
                          <div className="text-sm text-muted-foreground mb-1">
                            Średni wynik: {stats.avgScore}%
                          </div>
                          <Progress value={stats.avgScore} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista rankingowa */}
      {rankingsList.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak danych rankingu</h3>
            <p className="text-muted-foreground mb-6">
              Ranking zostanie wygenerowany gdy uczniowie zaczną rozwiązywać zadania.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pełny ranking uczniów</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankingsList.map((student: any) => {
                const stats = getUserStats(student.user_id);
                const isTopThree = student.rank <= 3;
                
                return (
                  <div 
                    key={student.user_id} 
                    className={`flex items-center gap-4 p-4 border rounded-lg ${isTopThree ? 'bg-gradient-to-r from-yellow-50 to-transparent border-yellow-200' : ''}`}
                  >
                    {/* Pozycja */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${getRankColor(student.rank)}`}>
                      {student.rank <= 3 ? getRankIcon(student.rank) : `#${student.rank}`}
                    </div>

                    {/* Avatar i podstawowe info */}
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback>
                          {getInitials(student.username || 'UN')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{student.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          Poziom {student.level} • {stats.completedLessons} lekcji
                        </p>
                      </div>
                    </div>

                    {/* Statystyki */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{student.xp}</div>
                        <div className="text-xs text-muted-foreground">Punkty XP</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{student.level}</div>
                        <div className="text-xs text-muted-foreground">Poziom</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{student.streak}</div>
                        <div className="text-xs text-muted-foreground">Seria dni</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.avgScore}%</div>
                        <div className="text-xs text-muted-foreground">Śr. wynik</div>
                      </div>
                    </div>

                    {/* Postęp do następnego poziomu */}
                    <div className="w-32">
                      <div className="text-xs text-muted-foreground mb-1">
                        Poziom {student.level + 1}
                      </div>
                      <Progress 
                        value={((student.xp % 1000) / 1000) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki szczegółowe */}
      {rankingsList.length > 0 && (
        <GridBox className="grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Rozkład poziomów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(level => {
                  const count = rankingsList.filter(r => r.level === level).length;
                  const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                  
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <div className="w-16 text-sm">Poziom {level}</div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <div className="w-12 text-sm text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Najaktywniejsze serie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankingsList
                  .filter(r => r.streak > 0)
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.user_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.username || 'UN')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{student.username}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        🔥 {student.streak} dni
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </GridBox>
      )}

      {/* Pagination */}
      {rankingsList.length > 0 && (
        <PaginationSwith
          current={current}
          pageSize={pageSize}
          total={data?.total || 0}
          setCurrent={setCurrent}
          itemName="uczniów"
        />
      )}
    </>
  );
}
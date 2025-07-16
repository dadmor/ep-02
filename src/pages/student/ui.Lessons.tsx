// src/pages/student/ui.Lessons.tsx - Z PAGINACJĄ
import React, { useState, useMemo } from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 

  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  education_level: string;
  grade: string;
}

interface ProgressRecord {
  lesson_id: string;
  score: number;
  attempts_count: number;
}

const ITEMS_PER_PAGE = 20;

const StudentLessons: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: identity } = useGetIdentity<{ id: string }>();
  
  // Pobierz parametry z URL
  const urlSubject = searchParams.get('subject') || '';
  const urlTopic = searchParams.get('topic') || '';
  const urlLevel = searchParams.get('level') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSearch = searchParams.get('search') || '';

  // Stan lokalny
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Buduj filtry dla Refine
  const filters = useMemo(() => {
    const baseFilters: any[] = [];
    
    if (urlSubject) {
      baseFilters.push({ field: "subject", operator: "eq", value: urlSubject });
    }
    
    if (urlTopic) {
      baseFilters.push({ field: "topic", operator: "eq", value: urlTopic });
    }
    
    if (urlLevel) {
      baseFilters.push({ field: "education_level", operator: "eq", value: urlLevel });
    }
    
    // Dla Supabase używamy operatora 'ilike' dla wyszukiwania tekstowego
    if (urlSearch) {
      baseFilters.push({ 
        field: "title", 
        operator: "ilike", 
        value: `%${urlSearch}%` 
      });
    }
    
    return baseFilters;
  }, [urlSubject, urlTopic, urlLevel, urlSearch]);

  // Pobieranie lekcji z paginacją
  const { data: lessonsData, isLoading } = useList<Lesson>({
    resource: "lessons",
    filters,
    pagination: {
      current: urlPage,
      pageSize: ITEMS_PER_PAGE,
      mode: "server" // Ważne dla wydajności!
    },
    sorters: [{ field: "created_at", order: "asc" }],
  });

  // Pobieranie tylko statystyk przedmiotów (bez paginacji)
  const { data: allSubjectsData } = useList<Lesson>({
    resource: "lessons",
    pagination: { 
      pageSize: 1000,
      mode: "off" // Wyłącz paginację dla tego zapytania
    }
  });

  const { data: progressData } = useList<ProgressRecord>({
    resource: "progress",
    filters: [{ field: "user_id", operator: "eq", value: identity?.id }],
    pagination: { pageSize: 1000 } // Pobierz wszystkie postępy
  });

  const lessons = lessonsData?.data || [];
  const totalCount = lessonsData?.total || 0;
  const progressRecords = progressData?.data || [];
  const allLessons = allSubjectsData?.data || [];



  // Oblicz dostępne opcje filtrów
  const availableFilters = useMemo(() => {
    const subjects = [...new Set(allLessons.map(l => l.subject).filter(Boolean))];
    const topics = urlSubject 
      ? [...new Set(allLessons.filter(l => l.subject === urlSubject).map(l => l.topic).filter(Boolean))]
      : [];
    const levels = [...new Set(allLessons.map(l => l.education_level).filter(Boolean))];
    
    return { subjects, topics, levels };
  }, [allLessons, urlSubject]);

  // Obliczenia paginacji
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = urlPage < totalPages;
  const hasPrevPage = urlPage > 1;

  // Funkcje pomocnicze
  const getLessonProgress = (lessonId: string | undefined) => {
    if (!lessonId) return undefined;
    return progressRecords.find(p => p.lesson_id === lessonId);
  };

  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Resetuj stronę jeśli zmieniamy filtry
    if (!('page' in newParams)) {
      params.set('page', '1');
    }
    
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchQuery });
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const hasActiveFilters = urlSubject || urlTopic || urlLevel || urlSearch;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Nagłówek */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lekcje</h1>
        <p className="text-gray-600">
          Znaleziono {totalCount} lekcji
          {urlSubject && ` z przedmiotu: ${urlSubject}`}
          {urlTopic && ` (${urlTopic})`}
        </p>
      </div>

      {/* Pasek wyszukiwania i filtrów */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Szukaj lekcji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>
          
          <Button type="submit" onClick={handleSearch}>
            Szukaj
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtry
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {[urlSubject, urlTopic, urlLevel, urlSearch].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Wyczyść
            </Button>
          )}
        </div>

        {/* Rozwijane filtry */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Przedmioty */}
              <div>
                <label className="text-sm font-medium mb-2 block">Przedmiot</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!urlSubject ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateUrlParams({ subject: null, topic: null })}
                  >
                    Wszystkie
                  </Button>
                  {availableFilters.subjects.map(subject => (
                    <Button
                      key={subject}
                      variant={urlSubject === subject ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateUrlParams({ subject, topic: null })}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Działy - tylko gdy wybrany przedmiot */}
              {urlSubject && availableFilters.topics.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Dział</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!urlTopic ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateUrlParams({ topic: null })}
                    >
                      Wszystkie
                    </Button>
                    {availableFilters.topics.map(topic => (
                      <Button
                        key={topic}
                        variant={urlTopic === topic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateUrlParams({ topic })}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Poziomy */}
              <div>
                <label className="text-sm font-medium mb-2 block">Poziom</label>
                <div className="flex gap-2">
                  <Button
                    variant={!urlLevel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateUrlParams({ level: null })}
                  >
                    Wszystkie
                  </Button>
                  <Button
                    variant={urlLevel === 'podstawowa' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateUrlParams({ level: 'podstawowa' })}
                  >
                    Podstawowa
                  </Button>
                  <Button
                    variant={urlLevel === 'rozszerzona' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateUrlParams({ level: 'rozszerzona' })}
                  >
                    Rozszerzona
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista lekcji */}
      <div className="space-y-3 mb-8">
        {lessons.length > 0 ? (
          lessons.map((lesson) => {
            if (!lesson.id) return null;
            
            const progress = getLessonProgress(String(lesson.id));
            const isCompleted = progress && progress.score >= 70;
            
            return (
              <Card 
                key={lesson.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
                onClick={() => navigate(`/student/lessons/${lesson.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-lg">{lesson.title}</h4>
                        {isCompleted && (
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            ✓ Ukończone
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium">{lesson.subject}</span>
                        {lesson.topic && (
                          <>
                            <span>•</span>
                            <span>{lesson.topic}</span>
                          </>
                        )}
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {lesson.education_level === 'rozszerzona' ? 'Rozszerzenie' : 'Podstawa'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-4">
                      {progress && (
                        <div className="text-right">
                          <div className="text-lg font-semibold">{progress.score}%</div>
                          <div className="text-xs text-gray-500">{progress.attempts_count} prób</div>
                        </div>
                      )}
                      <Button>
                        {isCompleted ? 'Powtórz' : 'Rozpocznij'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Nie znaleziono lekcji spełniających kryteria wyszukiwania.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
              >
                Wyczyść filtry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Strona {urlPage} z {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUrlParams({ page: '1' })}
              disabled={urlPage === 1}
            >
              Pierwsza
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUrlParams({ page: String(urlPage - 1) })}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
              Poprzednia
            </Button>
            
            {/* Numery stron */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum = idx + 1;
                
                // Inteligentne pokazywanie numerów stron
                if (totalPages > 5) {
                  if (urlPage > 3) {
                    pageNum = urlPage - 2 + idx;
                  }
                  if (urlPage > totalPages - 3) {
                    pageNum = totalPages - 4 + idx;
                  }
                }
                
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === urlPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateUrlParams({ page: String(pageNum) })}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUrlParams({ page: String(urlPage + 1) })}
              disabled={!hasNextPage}
            >
              Następna
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUrlParams({ page: String(totalPages) })}
              disabled={urlPage === totalPages}
            >
              Ostatnia
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLessons;
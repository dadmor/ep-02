// src/pages/teacher/ui.ArticleShow.tsx
import { useShow, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  BookOpen,
  Calendar,
  User,
  Hash,
  Clock
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import ReactMarkdown from 'react-markdown';

type Identity = {
  id: string;
  email?: string;
  username?: string;
  role: 'teacher' | 'student';
};

export default function ArticleShow() {
  const { data: identity } = useGetIdentity<Identity>();
  const { goBack, edit, list } = useNavigation();
  const { mutate: deleteArticle } = useDelete();

  const {
    queryResult: { data, isLoading, isError },
  } = useShow({
    resource: "articles",
    meta: {
      populate: ["lesson"],
    },
  });

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const article = data?.data;
  const lesson = article?.lesson;

  if (!article) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Artykuł nie został znaleziony</h3>
          <p className="text-muted-foreground mb-4">
            Artykuł o podanym ID nie istnieje lub został usunięty.
          </p>
          <Button onClick={() => list("articles")}>
            Wróć do listy artykułów
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = () => {
    // Sprawdź czy article i article.id istnieją
    if (!article?.id) {
      console.error("Nie można usunąć artykułu - brak ID");
      return;
    }

    if (confirm("Czy na pewno chcesz usunąć ten artykuł? Ta akcja jest nieodwracalna.")) {
      deleteArticle({
        resource: "articles",
        id: article.id,
      }, {
        onSuccess: () => {
          list("articles");
        },
      });
    }
  };

  const handleEdit = () => {
    if (!article?.id) {
      console.error("Nie można edytować artykułu - brak ID");
      return;
    }
    edit("articles", article.id);
  };

  const handleEditLesson = () => {
    if (!lesson?.id) {
      console.error("Nie można edytować lekcji - brak ID");
      return;
    }
    edit("lessons", lesson.id);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Podgląd artykułu
            </h1>
            <p className="text-muted-foreground">
              {article.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            disabled={!article?.id}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edytuj
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!article?.id}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <Badge variant="outline">
                  <Hash className="w-3 h-3 mr-1" />
                  {article.sort_order || 'N/A'}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
            </div>
            <Badge variant="secondary">
              ID: {article.id?.toString().slice(0, 8) || 'N/A'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lesson && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Lekcja
                </div>
                <Badge variant="outline" className="w-fit">
                  {lesson.title}
                </Badge>
              </div>
            )}

            {lesson?.subject && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Przedmiot</div>
                <Badge variant="secondary" className="w-fit">
                  {lesson.subject}
                </Badge>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Utworzony
              </div>
              <div className="text-sm text-muted-foreground">
                {article.created_at ? new Date(article.created_at).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Nie określono'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Długość
              </div>
              <div className="text-sm text-muted-foreground">
                {article.content ? `${article.content.length} znaków` : 'Brak treści'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <CardTitle>Treść artykułu</CardTitle>
        </CardHeader>
        <CardContent>
          {article.content ? (
            <div className="prose prose-sm max-w-5xl">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Ten artykuł nie ma jeszcze treści.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statystyki artykułu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {article.content ? article.content.split(' ').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Słów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {article.content ? article.content.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Znaków</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {article.content ? article.content.split('\n').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Linii</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {article.content ? Math.ceil(article.content.split(' ').length / 200) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Min. czytania</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Information */}
      {lesson && (
        <Card>
          <CardHeader>
            <CardTitle>Informacje o lekcji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FlexBox>
                <span className="font-medium">Tytuł lekcji:</span>
                <span>{lesson.title}</span>
              </FlexBox>
              
              {lesson.description && (
                <FlexBox>
                  <span className="font-medium">Opis:</span>
                  <span className="text-muted-foreground">{lesson.description}</span>
                </FlexBox>
              )}
              
              {lesson.subject && (
                <FlexBox>
                  <span className="font-medium">Przedmiot:</span>
                  <Badge variant="secondary">{lesson.subject}</Badge>
                </FlexBox>
              )}
              
              {lesson.difficulty_level && (
                <FlexBox>
                  <span className="font-medium">Poziom trudności:</span>
                  <Badge variant="outline">{lesson.difficulty_level}</Badge>
                </FlexBox>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Kolejność w lekcji: {article.sort_order || 'Nie ustawiono'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEditLesson}
                disabled={!lesson?.id}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edytuj lekcję
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
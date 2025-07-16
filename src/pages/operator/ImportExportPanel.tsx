// src/pages/operator/ImportExportPanel.tsx
import React, { useState } from "react";
import { Upload, Download, FileJson, AlertCircle, Wand2, ArrowRight, BookOpen, Users } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentManager } from "./contentManager";

export const ImportExportPanel: React.FC = () => {
  const { data: identity } = useGetIdentity<{ id: string }>();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const contentManager = new ContentManager(identity?.id || "");

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await contentManager.importFromFile(file);
      setResult(result);
    } catch (error: any) {
      setResult({
        success: false,
        errors: [`Błąd importu: ${error.message}`],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await contentManager.exportToFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matura-content-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setResult({
        success: true,
        message: "Eksport zakończony pomyślnie"
      });
    } catch (error: any) {
      console.error("Export error:", error);
      setResult({
        success: false,
        errors: [`Błąd eksportu: ${error.message}`]
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadExample = () => {
    const example = contentManager.getExampleStructure();
    const blob = new Blob([JSON.stringify(example, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "przykład-struktury-matura.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-6 h-6" />
            Import / Eksport treści edukacyjnych
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="file"
                accept=".json"
                id="import-file"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
              <Button
                onClick={() =>
                  document.getElementById("import-file")?.click()
                }
                disabled={importing}
                className="w-full flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {importing ? "Importowanie..." : "Importuj z JSON"}
              </Button>
            </div>
            <div>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Eksportowanie..." : "Eksportuj do JSON"}
              </Button>
            </div>
          </div>

          {/* Link do generatora promptów */}
          <div className="border-t pt-4">
            <Link to="/operator/prompts">
              <Button variant="outline" className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Przejdź do generatora promptów AI
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Przykładowa struktura */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Struktura pliku v2.0</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={downloadExample}
              >
                Pobierz przykład
              </Button>
            </div>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer hover:text-gray-800">
                Pokaż wymaganą strukturę JSON
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded overflow-x-auto text-xs">
{`{
  "version": "2.0.0",
  "exportedAt": "2024-01-15T10:00:00Z",
  "metadata": {
    "description": "Kurs dla liceum ogólnokształcącego",
    "targetAudience": "liceum"
  },
  "classes": [{
    "name": "Matematyka podstawowa - klasa 1",
    "grade": "1",
    "education_year": 9999,
    "description": "Pierwszy rok matematyki",
    "lessons": [{
      "title": "Zbiory liczbowe",
      "description": "Wprowadzenie do zbiorów",
      "subject": "matematyka",
      "education_level": "podstawowy",
      "grade": "1",
      "topic": "Liczby rzeczywiste",
      "sequenceNumber": 1,
      "articles": [{
        "title": "Teoria zbiorów",
        "content": "# Zawartość w Markdown",
        "sort_order": 1
      }],
      "tasks": [{
        "type": "single_choice",
        "question_text": "Pytanie",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "A",
        "xp_reward": 10
      }]
    }]
  }],
  "badges": [{
    "name": "Maturzysta",
    "description": "Ukończ kurs",
    "criteria": [{
      "criteria_type": "class_completion",
      "criteria_value": 100
    }]
  }]
}`}
              </pre>
            </details>
          </div>

          {result && (
            <div
              className={`p-4 rounded ${
                result.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {result.success ? (
                <div>
                  <p className="text-green-700 font-semibold">
                    {result.message || "Import zakończony pomyślnie!"}
                  </p>
                  {result.classesImported !== undefined && (
                    <ul className="mt-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Klasy: {result.classesImported}
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Lekcje: {result.lessonsImported}
                      </li>
                      <li>Artykuły: {result.articlesImported}</li>
                      <li>Zadania: {result.tasksImported}</li>
                    </ul>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Wystąpiły błędy podczas operacji
                  </p>
                  <ul className="mt-2 text-sm text-red-600">
                    {result.errors?.map((error: string, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informacje o strukturze systemu */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Struktura systemu edukacyjnego
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p className="text-sm font-semibold">
            System oparty na polskim liceum ogólnokształcącym:
          </p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li><strong>Klasy</strong> - reprezentują kombinację: przedmiot + poziom + rok nauki</li>
            <li><strong>Poziomy</strong> - podstawowy (obowiązkowy) i rozszerzony (dla chętnych)</li>
            <li><strong>Przedmioty</strong> - zgodne z podstawą programową MEN</li>
            <li><strong>Działy</strong> - grupowanie lekcji przez pole 'topic'</li>
            <li><strong>System XP</strong> - motywacja przez punkty doświadczenia</li>
          </ul>
          <p className="text-sm mt-3">
            Przykład: "Matematyka rozszerzona - klasa 2" to osobna klasa w systemie
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
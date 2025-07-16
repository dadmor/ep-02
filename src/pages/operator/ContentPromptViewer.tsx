// src/pages/operator/ContentPromptViewer.tsx
import React, { useState } from "react";
import {
  Copy,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "class-structure",
    name: "Struktura klasy (przedmiot + poziom)",
    description: "Generuje kompletną strukturę dla klasy w danym roku",
    variables: ["subject", "level", "grade", "lessonCount"],
    template: `Stwórz KOMPLETNY plik JSON dla importu do systemu edukacyjnego.

Parametry:
- Przedmiot: {{subject}}
- Poziom: {{level}} (podstawowy/rozszerzony)
- Rok nauki: klasa {{grade}} (1-4)
- Liczba lekcji: {{lessonCount}}

KRYTYCZNE: Wygeneruj PEŁNY PLIK JSON zaczynający się od głównego obiektu z polami version, exportedAt, metadata, classes!

Wymagana struktura (DOKŁADNIE TAK):
{
  "version": "2.0.0",
  "exportedAt": "2024-01-15T10:00:00Z",
  "metadata": {
    "description": "Kurs {{subject}} na poziomie {{level}} dla klasy {{grade}} liceum",
    "targetAudience": "liceum"
  },
  "classes": [
    {
      "name": "{{subject}} {{level}} - klasa {{grade}}",
      "grade": "{{grade}}",
      "education_year": 9999,
      "description": "Szczegółowy opis programu nauczania",
      "lessons": [
        // Tu wygeneruj {{lessonCount}} lekcji
        {
          "title": "Tytuł lekcji",
          "description": "Opis lekcji",
          "subject": "{{subject}}",
          "education_level": "{{level}}",
          "grade": "{{grade}}",
          "topic": "Nazwa działu",
          "sequenceNumber": 1,
          "estimatedTime": 45,
          "difficulty": "easy/medium/hard",
          "articles": [
            {
              "title": "Tytuł artykułu",
              "content": "# Nagłówek\\n\\nTreść artykułu w Markdown...",
              "sort_order": 1,
              "contentType": "theory"
            }
          ],
          "tasks": [
            {
              "type": "single_choice",
              "question_text": "Treść pytania",
              "options": ["Opcja A", "Opcja B", "Opcja C", "Opcja D"],
              "correct_answer": "Opcja A",
              "explanation": "Wyjaśnienie odpowiedzi",
              "xp_reward": 10,
              "difficulty": "easy"
            }
          ]
        }
      ]
    }
  ],
  "badges": []
}

WYMAGANIA:
1. MUSI być kompletny plik JSON od { do } z wszystkimi polami
2. MUSI zawierać pola: version, exportedAt, metadata, classes, badges
3. Każda lekcja z pełnymi artykułami (treść w Markdown) i zadaniami
4. Minimum 2-3 artykuły i 3-5 zadań na lekcję
5. Zgodność z podstawą programową MEN`,
  },
  {
    id: "lesson-full",
    name: "Pełna lekcja maturalna",
    description: "Generuje kompletną lekcję z teorią i zadaniami",
    variables: ["subject", "level", "grade", "topic", "lessonTitle"],
    template: `Stwórz kompletną lekcję maturalną dla polskiego liceum w formacie JSON.

Parametry:
- Przedmiot: {{subject}}
- Poziom: {{level}} (podstawowy/rozszerzony)
- Klasa: {{grade}} (1-4)
- Dział (topic): {{topic}}
- Temat lekcji: {{lessonTitle}}

WAŻNE - Struktura systemu:
- Lekcja należy do klasy typu "{{subject}} {{level}} - klasa {{grade}}"
- Pole 'topic' grupuje lekcje w działy
- System motywacyjny: XP za zadania

Wymagania:
1. Zgodność z podstawą programową dla matury
2. 2-3 artykuły (teoria, przykłady, podsumowanie)
3. Minimum 8 zadań różnego typu
4. Zadania maturalne z różnym poziomem trudności
5. Każde zadanie z wyjaśnieniem rozwiązania

Struktura JSON:
{
  "title": "{{lessonTitle}}",
  "description": "Opis lekcji",
  "subject": "{{subject}}",
  "education_level": "{{level}}",
  "grade": "{{grade}}",
  "topic": "{{topic}}",
  "estimatedTime": 45,
  "difficulty": "medium",
  "articles": [
    {
      "title": "Tytuł artykułu",
      "content": "Treść w Markdown",
      "sort_order": 1,
      "contentType": "theory"
    }
  ],
  "tasks": [
    {
      "type": "single_choice",
      "question_text": "Treść pytania",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Wyjaśnienie",
      "xp_reward": 10,
      "difficulty": "medium"
    }
  ]
}`,
  },
  {
    id: "topic-lessons",
    name: "Lekcje dla działu",
    description: "Generuje serię lekcji pokrywających cały dział",
    variables: ["subject", "level", "grade", "topic", "lessonCount"],
    template: `Wygeneruj serię {{lessonCount}} lekcji dla działu w liceum.

Parametry:
- Przedmiot: {{subject}}
- Poziom: {{level}}
- Klasa: {{grade}}
- Dział (topic): {{topic}}

KONTEKST:
- Lekcje dla klasy: "{{subject}} {{level}} - klasa {{grade}}"
- Wszystkie lekcje mają to samo pole 'topic' = "{{topic}}"
- Sekwencja lekcji od podstaw do zaawansowanych zagadnień

Wygeneruj listę lekcji z progresją trudności.
Każda lekcja powinna:
- Budować na poprzednich
- Mieć jasno określony cel
- Zawierać teorię i praktykę
- Przygotowywać do matury

Format JSON:
{
  "topic": "{{topic}}",
  "lessons": [
    {
      "sequenceNumber": 1,
      "title": "Tytuł lekcji",
      "description": "Opis",
      "subject": "{{subject}}",
      "education_level": "{{level}}",
      "grade": "{{grade}}",
      "topic": "{{topic}}",
      "estimatedTime": 45,
      "difficulty": "easy",
      "keyPoints": ["punkt1", "punkt2"],
      "prerequisites": []
    }
  ]
}`,
  },
  {
    id: "tasks-matura",
    name: "Zadania typu maturalnego",
    description: "Generuje zestaw zadań w stylu egzaminu maturalnego",
    variables: ["subject", "level", "topic", "taskCount", "taskTypes"],
    template: `Wygeneruj {{taskCount}} zadań typu maturalnego.

Przedmiot: {{subject}}
Poziom: {{level}}
Temat: {{topic}}
Typy zadań: {{taskTypes}}

WYMAGANIA MATURALNE:
- Zadania zgodne z formatem CKE
- Dla poziomu podstawowego: zadania zamknięte i krótkie otwarte
- Dla poziomu rozszerzonego: także zadania z rozwiązaniami rozbudowanymi
- Punktacja XP: easy=10, medium=15, hard=20

Format JSON:
{
  "tasks": [
    {
      "type": "single_choice",
      "question_text": "Treść zadania zgodna z arkuszem maturalnym",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "Szczegółowe rozwiązanie krok po kroku",
      "xp_reward": 15,
      "difficulty": "medium",
      "maturaTags": ["typ-arkusz-2024", "dział-{{topic}}"],
      "skillTags": ["umiejętność1", "umiejętność2"]
    }
  ]
}`,
  },
  {
    id: "yearly-plan",
    name: "Plan roczny przedmiotu",
    description: "Generuje rozkład materiału na cały rok szkolny",
    variables: ["subject", "level", "grade"],
    template: `Stwórz plan roczny dla przedmiotu w liceum.

Parametry:
- Przedmiot: {{subject}}
- Poziom: {{level}}
- Klasa: {{grade}}

KONTEKST EDUKACYJNY:
- Polski system edukacji (liceum 4-letnie)
- Przygotowanie do matury
- Klasa w systemie: "{{subject}} {{level}} - klasa {{grade}}"
- Rok szkolny: wrzesień - czerwiec

Wygeneruj:
1. Podział na działy (topics) na cały rok
2. Liczbę lekcji w każdym dziale
3. Cele edukacyjne
4. Powiązania z wymaganiami maturalnymi

Format JSON:
{
  "className": "{{subject}} {{level}} - klasa {{grade}}",
  "grade": "{{grade}}",
  "yearlyHours": 120,
  "topics": [
    {
      "name": "Nazwa działu",
      "description": "Opis działu",
      "lessonCount": 10,
      "months": "wrzesień-październik",
      "maturaRelevance": "wysokie/średnie/niskie",
      "objectives": ["cel1", "cel2"],
      "keySkills": ["umiejętność1", "umiejętność2"]
    }
  ],
  "maturaPreparation": {
    "examType": "{{level}}",
    "focusAreas": ["obszar1", "obszar2"],
    "expectedOutcomes": ["wynik1", "wynik2"]
  }
}`,
  },
];

// Przedmioty zgodne z polskim systemem edukacji
const SUBJECTS = [
  { value: "matematyka", label: "Matematyka" },
  { value: "polski", label: "Język polski" },
  { value: "angielski", label: "Język angielski" },
  { value: "historia", label: "Historia" },
  { value: "biologia", label: "Biologia" },
  { value: "chemia", label: "Chemia" },
  { value: "fizyka", label: "Fizyka" },
  { value: "geografia", label: "Geografia" },
  { value: "wos", label: "Wiedza o społeczeństwie" },
  { value: "informatyka", label: "Informatyka" },
];

const LEVELS = [
  { value: "podstawowy", label: "Poziom podstawowy" },
  { value: "rozszerzony", label: "Poziom rozszerzony" },
];

const GRADES = [
  { value: "1", label: "Klasa 1" },
  { value: "2", label: "Klasa 2" },
  { value: "3", label: "Klasa 3" },
  { value: "4", label: "Klasa 4" },
];

export const ContentPromptViewer: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["templates"])
  );

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    const newVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      newVars[v] = variables[v] || "";
    });
    setVariables(newVars);
    generatePrompt(template, newVars);
  };

  const generatePrompt = (
    template: PromptTemplate,
    vars: Record<string, string>
  ) => {
    let prompt = template.template;
    Object.entries(vars).forEach(([key, value]) => {
      prompt = prompt.replace(
        new RegExp(`{{${key}}}`, "g"),
        value || `[${key}]`
      );
    });
    setGeneratedPrompt(prompt);
  };

  const updateVariable = (key: string, value: string) => {
    const newVars = { ...variables, [key]: value };
    setVariables(newVars);
    if (selectedTemplate) {
      generatePrompt(selectedTemplate, newVars);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert("Prompt został skopiowany do schowka!");
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getVariableInput = (variable: string) => {
    switch (variable) {
      case "subject":
        return (
          <Select
            value={variables[variable]}
            onValueChange={(value) => updateVariable(variable, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz przedmiot" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "level":
        return (
          <Select
            value={variables[variable]}
            onValueChange={(value) => updateVariable(variable, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz poziom" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "grade":
        return (
          <Select
            value={variables[variable]}
            onValueChange={(value) => updateVariable(variable, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz klasę" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "taskTypes":
        return (
          <input
            type="text"
            value={variables[variable] || ""}
            onChange={(e) => updateVariable(variable, e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="np. single_choice, multiple_choice, open_question"
          />
        );

      case "lessonCount":
      case "taskCount":
        return (
          <input
            type="number"
            value={variables[variable] || ""}
            onChange={(e) => updateVariable(variable, e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder={`Liczba (np. ${
              variable === "lessonCount" ? "10" : "8"
            })`}
            min="1"
            max="50"
          />
        );

      default:
        return (
          <input
            type="text"
            value={variables[variable] || ""}
            onChange={(e) => updateVariable(variable, e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder={`Wpisz ${variable}`}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Generator Promptów dla Treści Maturalnych
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista szablonów */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <button
                  onClick={() => toggleSection("templates")}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <h3 className="font-semibold">Szablony promptów</h3>
                  {expandedSections.has("templates") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has("templates") && (
                  <div className="mt-2 space-y-2">
                    {PROMPT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`w-full text-left p-3 rounded border transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edytor zmiennych i podgląd */}
            <div className="lg:col-span-2 space-y-4">
              {selectedTemplate ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Parametry szablonu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium mb-1">
                            {variable.charAt(0).toUpperCase() +
                              variable.slice(1).replace(/([A-Z])/g, " $1")}
                          </label>
                          {getVariableInput(variable)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Wygenerowany prompt
                        <Button
                          onClick={copyToClipboard}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Kopiuj
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={generatedPrompt}
                        readOnly
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Wybierz szablon z listy po lewej stronie</p>
                  <p className="text-sm mt-2">
                    Szablony są dostosowane do polskiego systemu edukacji
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacja o użyciu */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Jak używać generatora
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-3">
          <ol className="text-sm list-decimal list-inside space-y-2">
            <li>Wybierz szablon odpowiedni do twojego celu</li>
            <li>Wypełnij parametry (przedmiot, poziom, klasę)</li>
            <li>Skopiuj wygenerowany prompt</li>
            <li>Użyj w AI (np. ChatGPT, Claude) do wygenerowania treści</li>
            <li>Zaimportuj wygenerowany JSON przez panel Import/Eksport</li>
          </ol>
          <p className="text-sm mt-4 font-medium">
            Pamiętaj: System używa struktury gdzie "klasa" = przedmiot + poziom
            + rok
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

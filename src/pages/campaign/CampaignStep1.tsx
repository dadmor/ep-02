// pages/campaign/CampaignStep1.tsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { useFormSchemaStore, useLLMOperation, type LLMOperation } from "@/utility/formSchemaStore";

export const CampaignStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  
  const llmAnalysis = useLLMOperation("campaign-wizard", "analyze-website");

  useEffect(() => {
    // Rejestracja pełnego schematu 5-krokowego
    register({
      id: "campaign-wizard",
      title: "Kreator kampanii marketingowej",
      schema: {
        step1: {
          title: "Analiza strony",
          type: "object",
          properties: {
            url: {
              type: "url",
              title: "Adres strony internetowej",
              placeholder: "https://twojafirma.pl"
            }
          },
          required: ["url"]
        },
        step2: {
          title: "Przegląd analizy",
          type: "object",
          properties: {
            description: { type: "textarea", title: "Opis", readOnly: true },
            keywords: { type: "tags", title: "Słowa kluczowe", readOnly: true },
            industry: { type: "text", title: "Branża", readOnly: true }
          }
        },
        step3: {
          title: "Dostosowanie branży",
          type: "object",
          properties: {
            industry: {
              type: "text",
              title: "Branża (edytowalna)",
              placeholder: "Dostosuj branżę..."
            }
          },
          required: ["industry"]
        },
        step4: {
          title: "Podgląd kampanii",
          type: "object",
          properties: {
            title: { type: "text", title: "Tytuł kampanii", readOnly: true },
            targetAudience: { type: "textarea", title: "Grupa docelowa", readOnly: true },
            budgetRecommendation: { type: "number", title: "Budżet (PLN)", readOnly: true },
            notes: { type: "textarea", title: "Notatki strategiczne", readOnly: true }
          }
        },
        step5: {
          title: "Finalizacja",
          type: "object",
          properties: {
            title: {
              type: "text",
              title: "Tytuł kampanii",
              placeholder: "Edytuj tytuł..."
            },
            targetAudience: {
              type: "textarea",
              title: "Grupa docelowa",
              placeholder: "Opisz grupę docelową..."
            },
            budgetRecommendation: {
              type: "number",
              title: "Budżet (PLN)",
              placeholder: "Wprowadź budżet..."
            },
            notes: {
              type: "textarea",
              title: "Notatki strategiczne",
              placeholder: "Dodaj notatki..."
            }
          },
          required: ["title", "targetAudience", "budgetRecommendation", "notes"]
        }
      }
    });

    // Rejestracja operacji LLM dla analizy strony
    const websiteAnalysisOperation: LLMOperation = {
      id: "analyze-website",
      name: "Analiza strony internetowej",
      config: {
        endpoint: "https://diesel-power-backend.onrender.com/api/chat"
      },
      prompt: {
        system: "Jesteś ekspertem od analizy stron internetowych i marketingu cyfrowego.",
        user: `
Przeanalizuj stronę internetową: {{url}}

Wygeneruj JSON:
{
  "description": "<opis działalności 30-100 słów>",
  "keywords": ["słowo1", "słowo2", "słowo3"],
  "industry": "<konkretna branża>"
}

Wymagania:
- Opis: główne działania/usługi firmy
- Keywords: 5-10 słów kluczowych związanych z branżą
- Industry: konkretna branża (np. "e-commerce mody", "usługi finansowe")
        `,
        responseFormat: 'json'
      },
      inputMapping: (data) => ({ url: data.url }),
      outputMapping: (llmResult, currentData) => ({
        ...currentData,
        description: llmResult.description,
        keywords: llmResult.keywords,
        industry: llmResult.industry,
        originalIndustry: llmResult.industry
      }),
      validation: (result) => !!(result.description && result.keywords && result.industry)
    };

    llmAnalysis.registerOperation(websiteAnalysisOperation);

    // FIXED: Properly return cleanup function that won't cause infinite loops
    return () => {
      // Only unregister if component is actually unmounting
      llmAnalysis.unregisterOperation();
    };
  }, []); // FIXED: Added empty dependency array to prevent re-running

  const handleAnalyze = async () => {
    setUrlError("");
    
    if (!url.trim()) {
      setUrlError("Podaj adres URL strony");
      return;
    }

    try {
      setData("campaign-wizard", { url: url.trim() });
      await llmAnalysis.executeOperation({ url: url.trim() });
      navigate("/campaign/step2");
    } catch (error) {
      console.error("Błąd analizy:", error);
    }
  };

  return (
    <>
      <Lead
        title="Kreator kampanii"
        description="1 z 5 - Analiza strony internetowej"
      />

      {urlError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-800 text-sm">{urlError}</span>
        </div>
      )}

      {llmAnalysis.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-800 text-sm">Błąd: {llmAnalysis.error}</span>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://twojafirma.pl"
          disabled={llmAnalysis.loading}
          className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          onClick={handleAnalyze}
          disabled={llmAnalysis.loading || !url.trim()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          {llmAnalysis.loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analizuję stronę...
            </>
          ) : (
            "Analizuj stronę"
          )}
        </button>
      </div>
    </>
  );
};
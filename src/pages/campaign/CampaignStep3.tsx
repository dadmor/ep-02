// pages/campaign/CampaignStep3.tsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore, useLLMOperation, type LLMOperation } from "@/utility/formSchemaStore";

export const CampaignStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("campaign-wizard");
  const [industry, setIndustry] = useState(formData.industry || "");
  
  const llmCampaignGeneration = useLLMOperation("campaign-wizard", "generate-campaign");

  useEffect(() => {
    // Rejestracja operacji LLM dla generowania kampanii
    const campaignGenerationOperation: LLMOperation = {
      id: "generate-campaign",
      name: "Generowanie kampanii marketingowej",
      config: {
        endpoint: "https://diesel-power-backend.onrender.com/api/chat"
      },
      prompt: {
        system: "Jesteś ekspertem od marketingu cyfrowego. Tworzysz strategie marketingowe.",
        user: `
Na podstawie analizy strony wygeneruj strategię marketingową:

URL: {{url}}
Opis: {{description}}
Słowa kluczowe: {{keywords}}
Branża: {{industry}}

Wygeneruj JSON:
{
  "title": "<kreatywny tytuł kampanii>",
  "targetAudience": "<szczegółowy opis grupy docelowej - demografia, zainteresowania, zachowania>",
  "budgetRecommendation": <liczba - budżet miesięczny PLN>,
  "notes": "<szczegółowe notatki strategiczne: kanały, timing, content marketing, SEO/SEM, social media, KPI, testy A/B, konkurencja, USP - min 300 słów>"
}

Wymagania:
- Tytuł: angażujący i strategiczny
- Grupa docelowa: bardzo konkretna (wiek, płeć, wykształcenie, zainteresowania)
- Budżet: realistyczny dla branży (1000-50000 PLN)
- Notatki: bardzo szczegółowe z konkretnymi działaniami
        `,
        responseFormat: 'json'
      },
      inputMapping: (data) => ({
        url: data.url,
        description: data.description,
        keywords: Array.isArray(data.keywords) ? data.keywords.join(", ") : data.keywords,
        industry: data.industry
      }),
      outputMapping: (llmResult, currentData) => ({
        ...currentData,
        title: llmResult.title,
        targetAudience: llmResult.targetAudience,
        budgetRecommendation: llmResult.budgetRecommendation,
        notes: llmResult.notes
      }),
      validation: (result) => !!(result.title && result.targetAudience && result.budgetRecommendation && result.notes)
    };

    llmCampaignGeneration.registerOperation(campaignGenerationOperation);

    // FIXED: Properly return cleanup function with empty dependency array
    return () => {
      llmCampaignGeneration.unregisterOperation();
    };
  }, []); // FIXED: Added empty dependency array

  const handleNext = async () => {
    if (!industry.trim()) return;

    try {
      // Zapisz zaktualizowaną branżę
      setData("campaign-wizard", { ...formData, industry: industry.trim() });
      
      // Generuj kampanię z zaktualizowaną branżą
      await llmCampaignGeneration.executeOperation({ 
        ...formData, 
        industry: industry.trim() 
      });
      
      navigate("/campaign/step4");
    } catch (error) {
      console.error("Błąd generowania kampanii:", error);
    }
  };

  return (
    <>
      <Lead
        title="Kreator kampanii"
        description="3 z 5 - Dostosuj branżę"
      />

      {llmCampaignGeneration.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-800 text-sm">Błąd: {llmCampaignGeneration.error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branża
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Dostosuj branżę..."
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Automatycznie wykryto: <strong>{formData.originalIndustry}</strong>
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/campaign/step2")}>
            Wstecz
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={llmCampaignGeneration.loading || !industry.trim()}
          >
            {llmCampaignGeneration.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generuję kampanię...
              </>
            ) : (
              "Generuj kampanię"
            )}
          </Button>
        </div>
      </div>

      {llmCampaignGeneration.loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 text-sm">
            ⚡ Generuję strategię marketingową na podstawie analizy strony...
          </span>
        </div>
      )}
    </>
  );
};
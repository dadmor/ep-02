// pages/campaign/CampaignStep2.tsx - Przegląd analizy
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/formSchemaStore";

export const CampaignStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("campaign-wizard");

  return (
    <>
      <Lead
        title="Kreator kampanii"
        description="2 z 5 - Przegląd danych ze strony"
      />

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <span className="text-green-800 text-sm">✓ Analiza zakończona pomyślnie</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.url}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opis</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.description}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Słowa kluczowe</label>
            <div className="flex flex-wrap gap-2">
              {formData.keywords?.map((keyword: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branża</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">{formData.industry}</div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/campaign/step1")}>
            Wstecz
          </Button>
          <Button onClick={() => navigate("/campaign/step3")}>
            Kontynuuj
          </Button>
        </div>
      </div>
    </>
  );
};
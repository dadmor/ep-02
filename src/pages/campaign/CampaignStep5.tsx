// pages/campaign/CampaignStep5.tsx - Finalizacja
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/formSchemaStore";

export const CampaignStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("campaign-wizard");
  
  const [title, setTitle] = useState(formData.title || "");
  const [targetAudience, setTargetAudience] = useState(formData.targetAudience || "");
  const [budgetRecommendation, setBudgetRecommendation] = useState(formData.budgetRecommendation || 0);
  const [notes, setNotes] = useState(formData.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = "Tytuł jest wymagany";
    if (!targetAudience.trim()) newErrors.targetAudience = "Grupa docelowa jest wymagana";
    if (!budgetRecommendation || budgetRecommendation < 500) newErrors.budgetRecommendation = "Budżet musi być co najmniej 500 PLN";
    if (!notes.trim()) newErrors.notes = "Notatki są wymagane";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSaving(true);
      
      // Zapisz finalne dane
      setData("campaign-wizard", {
        ...formData,
        title: title.trim(),
        targetAudience: targetAudience.trim(),
        budgetRecommendation,
        notes: notes.trim()
      });

      // Tutaj można zapisać do bazy danych
      await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja zapisu
      
      setSaving(false);
      alert("Kampania została zapisana pomyślnie!");
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Lead
        title="Kreator kampanii"
        description="5 z 5 - Finalizacja i zapis kampanii"
      />

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tytuł kampanii <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wprowadź tytuł kampanii..."
            className={`w-full h-12 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupa docelowa <span className="text-red-500">*</span>
          </label>
          <textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Opisz grupę docelową..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.targetAudience ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.targetAudience && <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budżet (PLN) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={budgetRecommendation}
            onChange={(e) => setBudgetRecommendation(parseInt(e.target.value) || 0)}
            placeholder="Minimum 500 PLN"
            min={500}
            className={`w-full h-12 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.budgetRecommendation ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.budgetRecommendation && <p className="mt-1 text-sm text-red-600">{errors.budgetRecommendation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notatki strategiczne <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dodaj notatki strategiczne..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.notes ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/campaign/step4")} disabled={saving}>
            Wstecz
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Zapisuję...
              </>
            ) : (
              "Zapisz kampanię"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
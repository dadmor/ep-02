// pages/campaign/CampaignDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { NarrowCol } from "@/components/layout/NarrowCol";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/formSchemaStore";

export const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const campaignData = getData("campaign-wizard");

  const hasSavedCampaign = campaignData && campaignData.title;

  return (
    <>
      <Lead
        title="Kampanie marketingowe"
        description="Zarządzaj swoimi kampaniami i twórz nowe strategie"
      />

      <div className="space-y-6">
        {/* Kreator nowej kampanii */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Kreator kampanii AI</h2>
              <p className="text-gray-600">Stwórz kampanię w 5 krokach z pomocą sztucznej inteligencji</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Automatyczna analiza strony WWW
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Generowanie grupy docelowej
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sugestie budżetu i strategii
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analiza branży i konkurencji
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pełna edycja i dostosowanie
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Eksport gotowej strategii
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={() => navigate("/campaign/step1")}
              className="w-full md:w-auto"
              size="lg"
            >
              🚀 Rozpocznij nową kampanię
            </Button>
          </div>
        </div>

        {/* Zapisana kampania */}
        {hasSavedCampaign && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ostatnia kampania</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Zapisana
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tytuł kampanii</p>
                <p className="font-medium text-gray-900">{campaignData.title}</p>
              </div>
              
              {campaignData.industry && (
                <div>
                  <p className="text-sm text-gray-600">Branża</p>
                  <p className="text-gray-900">{campaignData.industry}</p>
                </div>
              )}
              
              {campaignData.budgetRecommendation && (
                <div>
                  <p className="text-sm text-gray-600">Budżet</p>
                  <p className="text-gray-900">{campaignData.budgetRecommendation.toLocaleString()} PLN</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => navigate("/campaign/step4")}
              >
                👁️ Podgląd
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/campaign/step5")}
              >
                ✏️ Edytuj
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/campaign/step1")}
              >
                🔄 Nowa wersja
              </Button>
            </div>
          </div>
        )}

        {/* Przydatne linki */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Przydatne narzędzia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/website-analyses")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Analizy stron</span>
              </div>
              <p className="text-sm text-gray-600">Zobacz wszystkie przeprowadzone analizy</p>
            </button>

            <button
              onClick={() => navigate("/marketing-strategies")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">Strategie</span>
              </div>
              <p className="text-sm text-gray-600">Zarządzaj strategiami marketingowymi</p>
            </button>

            <button
              onClick={() => navigate("/google-ads-campaigns")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium">Google Ads</span>
              </div>
              <p className="text-sm text-gray-600">Kampanie reklamowe Google</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
// pages/campaign/index.ts
import { Route } from "react-router";
import { CampaignStep1 } from "./CampaignStep1";
import { CampaignStep2 } from "./CampaignStep2";
import { CampaignStep3 } from "./CampaignStep3";
import { CampaignStep4 } from "./CampaignStep4";
import { CampaignStep5 } from "./CampaignStep5";
import { CampaignDashboard } from "./CampaignDashboard";

// Komponenty
export { CampaignStep1 } from './CampaignStep1';
export { CampaignStep2 } from './CampaignStep2';
export { CampaignStep3 } from './CampaignStep3';
export { CampaignStep4 } from './CampaignStep4';
export { CampaignStep5 } from './CampaignStep5';
export { CampaignDashboard } from './CampaignDashboard';

// Routes - zwracamy JSX bezpośrednio, nie funkcję komponenta
export const campaignRoutes = [
  <Route key="campaign-dashboard" path="/campaign" element={<CampaignDashboard />} />,
  <Route key="campaign-step1" path="/campaign/step1" element={<CampaignStep1 />} />,
  <Route key="campaign-step2" path="/campaign/step2" element={<CampaignStep2 />} />,
  <Route key="campaign-step3" path="/campaign/step3" element={<CampaignStep3 />} />,
  <Route key="campaign-step4" path="/campaign/step4" element={<CampaignStep4 />} />,
  <Route key="campaign-step5" path="/campaign/step5" element={<CampaignStep5 />} />,
];

// Resource definition - opcjonalnie, jeśli chcesz mieć kampanię jako resource w Refine
export const campaignResource = {
  name: "campaigns",
  list: "/campaign", // Dashboard kampanii
  create: "/campaign/step1",
  edit: "/campaign/step1", // Można też przekierować na odpowiedni krok edycji
  show: "/campaign/step4", // Pokazuje podgląd kampanii
  meta: {
    canDelete: false, // Kampanie nie są usuwane przez standardowe CRUD
    label: "Kampanie",
  },
};
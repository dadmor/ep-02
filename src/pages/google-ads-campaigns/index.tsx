import { Route } from "react-router";
import { GoogleAdsCampaignList } from "./list";
import { GoogleAdsCampaignCreate } from "./create";
import { GoogleAdsCampaignEdit } from "./edit";
import { GoogleAdsCampaignShow } from "./show";


// Komponenty
export { GoogleAdsCampaignCreate } from './create';
export { GoogleAdsCampaignEdit } from './edit';
export { GoogleAdsCampaignList } from './list';
export { GoogleAdsCampaignShow } from './show';

// Resource definition
export const googleAdsCampaignResource = {
  name: "google_ads_campaigns",
  list: "/google-ads-campaigns",
  create: "/google-ads-campaigns/create",
  edit: "/google-ads-campaigns/edit/:id",
  show: "/google-ads-campaigns/show/:id",
  meta: {
    canDelete: true,
    label: "Google Ads Campaigns",
  },
};

// Routes
export const googleAdsCampaignRoutes = [
  <Route key="google-ads-campaigns-list" path="/google-ads-campaigns" element={<GoogleAdsCampaignList />} />,
  <Route key="google-ads-campaigns-create" path="/google-ads-campaigns/create" element={<GoogleAdsCampaignCreate />} />,
  <Route key="google-ads-campaigns-edit" path="/google-ads-campaigns/edit/:id" element={<GoogleAdsCampaignEdit />} />,
  <Route key="google-ads-campaigns-show" path="/google-ads-campaigns/show/:id" element={<GoogleAdsCampaignShow />} />,
];
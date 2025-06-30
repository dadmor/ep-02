// ========================================
// src/pages/contractor/index.tsx - UPDATED WITH REAL COMPONENTS
// ========================================
import React from "react";
import { Route } from "react-router-dom";
import { RoleGuard } from "@/components/RoleGuard";
import { BarChart3, Hammer, DollarSign, User, Folder } from "lucide-react";

// Import komponentów
import { ContractorDashboard } from "./dashboard";
import { ContractorProfile } from "./profile";
import { ContractorPortfolio } from "./portfolio";
import { ContractorPortfolioItemView } from "./portfolio-item-view";
import { ContractorAvailableRequests } from "./available-requests";
import { ContractorMyOffers } from "./my-offers";
import { ContractorPortfolioItemCreate } from "./portfolio-item-create";

// ✅ NOWE: Import prawdziwych komponentów
import { ContractorOfferCreate } from "./offer-create";
import { ContractorOfferEdit } from "./offer-edit";
import { ContractorOfferShow } from "./offer-show";
import { ContractorRequestDetails } from "./request-details";

// Export wszystkich komponentów
export { ContractorDashboard } from "./dashboard";
export { ContractorProfile } from "./profile";
export { ContractorPortfolio } from "./portfolio";
export { ContractorPortfolioItemView } from "./portfolio-item-view";
export { ContractorAvailableRequests } from "./available-requests";
export { ContractorMyOffers } from "./my-offers";
export { ContractorOfferCreate } from "./offer-create";
export { ContractorOfferEdit } from "./offer-edit";
export { ContractorOfferShow } from "./offer-show";
export { ContractorRequestDetails } from "./request-details";

// Komponenty do implementacji w przyszłości
export const ContractorCompletedProjects = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ukończone Projekty</h1>
      <p>Komponent do implementacji - historia ukończonych projektów</p>
    </div>
  );
};

export const ContractorPortfolioItemEdit = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edytuj Projekt Portfolio</h1>
      <p>Komponente do implementacji - formularz edycji projektu</p>
    </div>
  );
};

// Helper function do tworzenia chronionej trasy
const createProtectedRoute = (key: string, path: string, element: React.ReactElement) => (
  <Route
    key={key}
    path={path}
    element={
      <RoleGuard allowedRoles={["contractor"]}>
        {element}
      </RoleGuard>
    }
  />
);

// Resource definitions dla Refine
export const contractorResources = [
  {
    name: "dashboard_contractor",
    list: "/contractor",
    meta: {
      label: "Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["contractor"],
    },
  },
  {
    name: "service_requests",
    list: "/contractor/available-requests",
    show: "/contractor/request/:id",
    meta: {
      label: "Dostępne zlecenia",
      icon: <Hammer className="h-4 w-4" />,
      roles: ["contractor"],
    },
  },
  {
    name: "contractor_offers",
    list: "/contractor/my-offers",
    create: "/contractor/offer/create/:requestId",
    edit: "/contractor/offer/edit/:id",
    show: "/contractor/offer/:id",
    meta: {
      label: "Moje oferty",
      icon: <DollarSign className="h-4 w-4" />,
      roles: ["contractor"],
    },
  },
  {
    name: "contractor_profiles",
    list: "/contractor/profile",
    edit: "/contractor/profile/edit",
    meta: {
      label: "Profil",
      icon: <User className="h-4 w-4" />,
      roles: ["contractor"],
    },
  },
  {
    name: "contractor_portfolio_items",
    list: "/contractor/portfolio",
    create: "/contractor/portfolio/create",
    edit: "/contractor/portfolio/edit/:id",
    show: "/contractor/portfolio/:id",
    meta: {
      label: "Portfolio",
      icon: <Folder className="h-4 w-4" />,
      roles: ["contractor"],
    },
  },
];

// Routes dla wykonawców z RoleGuard
export const contractorRoutes = [
  createProtectedRoute("contractor-dashboard", "/contractor", <ContractorDashboard />),
  createProtectedRoute("contractor-available-requests", "/contractor/available-requests", <ContractorAvailableRequests />),
  createProtectedRoute("contractor-my-offers", "/contractor/my-offers", <ContractorMyOffers />),
  createProtectedRoute("contractor-profile", "/contractor/profile", <ContractorProfile />),
  createProtectedRoute("contractor-portfolio", "/contractor/portfolio", <ContractorPortfolio />),
  createProtectedRoute("contractor-portfolio-view", "/contractor/portfolio/:id", <ContractorPortfolioItemView />),
  createProtectedRoute("contractor-completed-projects", "/contractor/completed-projects", <ContractorCompletedProjects />),
  
  // ✅ NOWE: Prawdziwe komponenty zamiast placeholder'ów
  createProtectedRoute("contractor-request-details", "/contractor/request/:id", <ContractorRequestDetails />),
  createProtectedRoute("contractor-offer-create", "/contractor/offer/create/:requestId", <ContractorOfferCreate />),
  createProtectedRoute("contractor-offer-show", "/contractor/offer/:id", <ContractorOfferShow />),
  createProtectedRoute("contractor-offer-edit", "/contractor/offer/edit/:id", <ContractorOfferEdit />),
  
  createProtectedRoute("contractor-portfolio-item-create", "/contractor/portfolio/create", <ContractorPortfolioItemCreate />),
  createProtectedRoute("contractor-portfolio-item-edit", "/contractor/portfolio/edit/:id", <ContractorPortfolioItemEdit />),
];
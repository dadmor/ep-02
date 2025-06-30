// src/pages/auditor/index.tsx
import React from "react";
import { Route } from "react-router-dom";
import { RoleGuard } from "@/components/RoleGuard";
import { BarChart3, ClipboardList, DollarSign, User, Folder } from "lucide-react";

// Import komponentów
import { AuditorDashboard } from "./dashboard";
import { AuditorProfile } from "./profile";
import { AuditorPortfolio } from "./portfolio/portfolio";
import { AvailableRequests } from "./available-requests";
import { MyOffers } from "./my-offers";
import { CompletedAudits } from "./completed-audits";
import { PortfolioItemCreate } from "./portfolio/portfolio-item-create";
import { RequestDetails } from "./request-details";
import { OfferCreate } from "./offer-create";
import { OfferShow } from "./offer-show";
import { OfferEdit } from "./offer-edit";
import { PortfolioItemEdit } from "./portfolio/portfolio-item-edit";

// Export wszystkich komponentów
export { AuditorDashboard } from "./dashboard";
export { AuditorProfile } from "./profile";
export { AuditorPortfolio } from "./portfolio/portfolio";
export { AvailableRequests } from "./available-requests";
export { MyOffers } from "./my-offers";
export { CompletedAudits } from "./completed-audits";
export { RequestDetails } from "./request-details";
export { OfferCreate } from "./offer-create";
export { OfferShow } from "./offer-show";
export { OfferEdit } from "./offer-edit";
export { PortfolioItemEdit } from "./portfolio/portfolio-item-edit";



// Helper function do tworzenia chronionej trasy
const createProtectedRoute = (key: string, path: string, element: React.ReactElement) => (
  <Route
    key={key}
    path={path}
    element={
      <RoleGuard allowedRoles={["auditor"]}>
        {element}
      </RoleGuard>
    }
  />
);

// Resource definitions dla Refine
export const auditorResources = [
  {
    name: "dashboard_auditor",
    list: "/auditor",
    meta: {
      label: "Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["auditor"],
    },
  },
  {
    name: "audit_requests",
    list: "/auditor/available-requests",
    show: "/auditor/request/:id",
    meta: {
      label: "Dostępne zlecenia",
      icon: <ClipboardList className="h-4 w-4" />,
      roles: ["auditor"],
    },
  },
  {
    name: "auditor_offers",
    list: "/auditor/my-offers",
    create: "/auditor/offer/create/:requestId",
    edit: "/auditor/offer/edit/:id",
    show: "/auditor/offer/:id",
    meta: {
      label: "Moje oferty",
      icon: <DollarSign className="h-4 w-4" />,
      roles: ["auditor"],
    },
  },
  {
    name: "auditor_profiles",
    list: "/auditor/profile",
    edit: "/auditor/profile/edit",
    meta: {
      label: "Profil",
      icon: <User className="h-4 w-4" />,
      roles: ["auditor"],
    },
  },
  {
    name: "auditor_portfolio_items",
    list: "/auditor/portfolio",
    create: "/auditor/portfolio/create",
    edit: "/auditor/portfolio/edit/:id",
    show: "/auditor/portfolio/:id",
    meta: {
      label: "Portfolio",
      icon: <Folder className="h-4 w-4" />,
      roles: ["auditor"],
    },
  },
];

// Routes dla audytora z RoleGuard
export const auditorRoutes = [
  createProtectedRoute("auditor-dashboard", "/auditor", <AuditorDashboard />),
  createProtectedRoute("auditor-available-requests", "/auditor/available-requests", <AvailableRequests />),
  createProtectedRoute("auditor-my-offers", "/auditor/my-offers", <MyOffers />),
  createProtectedRoute("auditor-profile", "/auditor/profile", <AuditorProfile />),
  createProtectedRoute("auditor-portfolio", "/auditor/portfolio", <AuditorPortfolio />),
  createProtectedRoute("auditor-completed-audits", "/auditor/completed-audits", <CompletedAudits />),
  createProtectedRoute("auditor-request-details", "/auditor/request/:id", <RequestDetails />),
  createProtectedRoute("auditor-offer-create", "/auditor/offer/create/:requestId", <OfferCreate />),
  createProtectedRoute("auditor-offer-show", "/auditor/offer/:id", <OfferShow />),
  createProtectedRoute("auditor-offer-edit", "/auditor/offer/edit/:id", <OfferEdit />),
  createProtectedRoute("portfolio-item-create", "/auditor/portfolio/create", <PortfolioItemCreate />),
  createProtectedRoute("portfolio-item-edit", "/auditor/portfolio/edit/:id", <PortfolioItemEdit />),
];
// src/pages/beneficiary/index.tsx
import React from "react";
import { Route } from "react-router-dom";
import { RoleGuard } from "@/components/RoleGuard";
import { BarChart3, Wrench, ClipboardList, Phone, Plus } from "lucide-react";

// Import komponentów
import { AuditRequestCreate } from "./audit-request-create";
import { AuditRequestEdit } from "./audit-request-edit";
import { ServiceRequestCreate } from "./service-request-create";
import { ServiceRequestEdit } from "./service-request-edit";
import { MyRequests } from "./my-requests";
import { BeneficiaryDashboard } from "./dashboard";
import { ContactOperator } from "./contact-operator";
import { RequestDetails } from "./request-details";

// Export wszystkich komponentów
export { BeneficiaryDashboard } from "./dashboard";
export { ServiceRequestCreate } from "./service-request-create";
export { ServiceRequestEdit } from "./service-request-edit";
export { AuditRequestCreate } from "./audit-request-create";
export { AuditRequestEdit } from "./audit-request-edit";
export { MyRequests } from "./my-requests";
export { ContactOperator } from "./contact-operator";
export { RequestDetails } from "./request-details";

// Helper function do tworzenia chronionej trasy
const createProtectedRoute = (
  key: string,
  path: string,
  element: React.ReactElement
) => (
  <Route
    key={key}
    path={path}
    element={<RoleGuard allowedRoles={["beneficiary"]}>{element}</RoleGuard>}
  />
);

// Resource definitions dla Refine
export const beneficiaryResources = [
  {
    name: "dashboard",
    list: "/beneficiary",
    meta: {
      label: "Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["beneficiary"], // DODANE
    },
  },
  {
    name: "my_requests",
    list: "/beneficiary/my-requests",
    meta: {
      label: "Moje zapytania",
      icon: <ClipboardList className="h-4 w-4" />,
      roles: ["beneficiary"], // DODANE
    },
  },
  {
    name: "audit_request",
    list: "/beneficiary/audit-request/create",
    create: "/beneficiary/audit-request/create",
    edit: "/beneficiary/audit-request/edit/:id",
    meta: {
      label: "Zapytanie o audyt",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["beneficiary"], // DODANE
      canDelete: false,
    },
  },
  {
    name: "service_request", 
    list: "/beneficiary/service-request/create",
    create: "/beneficiary/service-request/create",
    edit: "/beneficiary/service-request/edit/:id",
    meta: {
      label: "Zapytanie o usługę",
      icon: <Wrench className="h-4 w-4" />,
      roles: ["beneficiary"], // DODANE
      canDelete: false,
    },
  },
  {
    name: "contact_operator",
    list: "/beneficiary/contact-operator",
    meta: {
      label: "Kontakt z operatorem",
      icon: <Phone className="h-4 w-4" />,
      roles: ["beneficiary"], // DODANE
    },
  },
];

// Routes dla beneficjenta z RoleGuard
export const beneficiaryRoutes = [
  createProtectedRoute(
    "beneficiary-dashboard",
    "/beneficiary",
    <BeneficiaryDashboard />
  ),
  createProtectedRoute(
    "beneficiary-contact-operator",
    "/beneficiary/contact-operator",
    <ContactOperator />
  ),
  createProtectedRoute(
    "beneficiary-my-requests",
    "/beneficiary/my-requests",
    <MyRequests />
  ),
  createProtectedRoute(
    "beneficiary-service-requests",
    "/beneficiary/service-requests",
    <MyRequests />
  ),
  createProtectedRoute(
    "beneficiary-audit-requests",
    "/beneficiary/audit-requests",
    <MyRequests />
  ),
  createProtectedRoute(
    "service-request-create",
    "/beneficiary/service-request/create",
    <ServiceRequestCreate />
  ),
  createProtectedRoute(
    "service-request-edit",
    "/beneficiary/service-request/edit/:id",
    <ServiceRequestEdit />
  ),
  createProtectedRoute(
    "service-request-show",
    "/beneficiary/service-request/show/:id",
    <RequestDetails />
  ),
  createProtectedRoute(
    "audit-request-create",
    "/beneficiary/audit-request/create",
    <AuditRequestCreate />
  ),
  createProtectedRoute(
    "audit-request-edit",
    "/beneficiary/audit-request/edit/:id",
    <AuditRequestEdit />
  ),
  createProtectedRoute(
    "audit-request-show",
    "/beneficiary/audit-request/show/:id",
    <RequestDetails />
  ),
  createProtectedRoute(
    "request-details",
    "/beneficiary/requests/:id",
    <RequestDetails />
  ),
];
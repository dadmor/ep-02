// ========================================
// src/pages/operator/index.tsx - Kompletny plik
// ========================================

import React from "react";
import { Route } from "react-router-dom";
import { RoleGuard } from "@/components/RoleGuard";
import { BarChart3 } from "lucide-react";

// Import komponentów
import { OperatorDashboard } from "./dashboard";

// Export wszystkich komponentów
export { OperatorDashboard } from "./dashboard";

// Helper function do tworzenia chronionej trasy
const createProtectedRoute = (key: string, path: string, element: React.ReactElement) => (
  <Route
    key={key}
    path={path}
    element={
      <RoleGuard allowedRoles={["operator"]}>
        {element}
      </RoleGuard>
    }
  />
);

// Resource definitions dla Refine
export const operatorResources = [
  {
    name: "dashboard_operator",
    list: "/operator",
    meta: {
      label: "Dashboard (o)",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["operator"],
    },
  },
];

// Routes dla operatorów z RoleGuard
export const operatorRoutes = [
  createProtectedRoute("operator-dashboard", "/operator", <OperatorDashboard />),
];
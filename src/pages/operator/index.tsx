// ====================================================
// src/pages/operator/index.tsx
// ====================================================
import React from "react";
import { Route } from "react-router-dom";
import { FileJson, Wand2, GraduationCap } from "lucide-react";

// Import komponentów
import { ImportExportPanel } from "./ImportExportPanel";
import { ContentPromptViewer } from "./ContentPromptViewer";
import { EducationLevelsPanel } from "./EducationLevelsPanel";

// Export komponentów
export { ImportExportPanel } from "./ImportExportPanel";
export { ContentPromptViewer } from "./ContentPromptViewer";
export { EducationLevelsPanel } from "./EducationLevelsPanel";

// Resource definitions dla Refine - operator
export const operatorResources = [
  {
    name: "operator",
    list: "/operator",
    meta: {
      label: "Import / Eksport",
      icon: <FileJson className="h-4 w-4" />,
      roles: ["operator"],
    },
  },
  {
    name: "operator-levels",
    list: "/operator/levels",
    meta: {
      label: "Poziomy edukacyjne",
      icon: <GraduationCap className="h-4 w-4" />,
      roles: ["operator"],
    },
  },
  {
    name: "operator-prompts",
    list: "/operator/prompts",
    meta: {
      label: "Generator Promptów",
      icon: <Wand2 className="h-4 w-4" />,
      roles: ["operator"],
    },
  },
];

// Routes dla operator
export const operatorRoutes = [
  <Route
    key="operator"
    path="/operator"
    element={<ImportExportPanel />}
  />,
  <Route
    key="operator-levels"
    path="/operator/levels"
    element={<EducationLevelsPanel />}
  />,
  <Route
    key="operator-prompts"
    path="/operator/prompts"
    element={<ContentPromptViewer />}
  />,
];
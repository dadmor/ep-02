// src/App.tsx - TYLKO DODAJ LANDING PAGE, reszta bez zmian
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Layout } from "./components/layout";
import { authProvider, supabaseClient } from "./utility";

import { authRoutes } from "./pages/auth";
// DODAJ TYLKO TĘ LINIĘ:
import { LandingPage } from "./pages/landing";

// Import zorganizowanych teacher exports - BEZ ZMIAN
import {
  teacherResources,
  teacherRoutes,
} from "./pages/teacher";

// Import student exports - BEZ ZMIAN
import {
  studentResources,
  studentRoutes,
} from "./pages/student";

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        liveProvider={liveProvider(supabaseClient)}
        authProvider={authProvider}
        routerProvider={routerBindings}
        resources={[
          ...teacherResources,
          ...studentResources,
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          useNewQueryKeys: true,
        }}
      >
        <Routes>
          {/* Landing page - poza kontrolą auth */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes - BEZ ZMIAN */}
          {...authRoutes}

          {/* Protected routes wrapper - BEZ ZMIAN - USUŃ /app/* */}
          <Route
            element={
              <Authenticated
                key="protected-layout"
                fallback={<CatchAllNavigate to="/login" />}
              >
                <Layout>
                  <Outlet />
                </Layout>
              </Authenticated>
            }
          >
            {/* Teacher routes - BEZ ZMIAN */}
            {...teacherRoutes}

            {/* Student routes - BEZ ZMIAN */}
            {...studentRoutes}

            {/* 404 - BEZ ZMIAN */}
            <Route path="*" element={<ErrorComponent />} />
          </Route>
        </Routes>
  
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  );
}

export default App;
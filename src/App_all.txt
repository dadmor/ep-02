import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Layout } from "./components/layout";
import { authProvider, supabaseClient } from "./utility";
import {
  websiteAnalysisResource,
  websiteAnalysisRoutes,
} from "./pages/website-analyses";
import {
  marketingStrategyResource,
  marketingStrategyRoutes,
} from "./pages/marketing-strategies";
import {
  googleAdsCampaignResource,
  googleAdsCampaignRoutes,
} from "./pages/google-ads-campaigns";
import { profileResource, profileRoutes } from "./pages/profiles";
import { authRoutes } from "./pages/auth";

// Import kampanii
import {
  campaignResource,
  campaignRoutes,
} from "./pages/campaign";

// Import zorganizowanych beneficiary exports
import {
  beneficiaryResources,
  beneficiaryRoutes,
} from "./pages/beneficiary";

// Import zorganizowanych auditor exports
import {
  auditorResources,
  auditorRoutes,
} from "./pages/auditor";

// Import zorganizowanych contractor exports
import {
  contractorResources,
  contractorRoutes,
} from "./pages/contractor";

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider(supabaseClient)}
        liveProvider={liveProvider(supabaseClient)}
        authProvider={authProvider}
        routerProvider={routerBindings}
        resources={[
          websiteAnalysisResource,
          marketingStrategyResource,
          googleAdsCampaignResource,
          profileResource,
          campaignResource, // Dodany resource kampanii
          // Dodaj beneficiary resources
          ...beneficiaryResources,
          // Dodaj auditor resources
          ...auditorResources,
          // Dodaj contractor resources
          ...contractorResources,
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          useNewQueryKeys: true,
        }}
      >
        <Routes>
          {/* Public routes */}
          {...authRoutes}

          {/* Protected routes wrapper */}
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
            {/* Default redirect */}
            <Route
              index
              element={<NavigateToResource resource="campaigns" />}
            />

            {/* Existing routes */}
            {...websiteAnalysisRoutes}
            {...marketingStrategyRoutes}
            {...googleAdsCampaignRoutes}
            {...profileRoutes}

            {/* Campaign routes - dodane routes kampanii */}
            {...campaignRoutes}

            {/* Beneficiary routes - używamy zorganizowanych routes */}
            {...beneficiaryRoutes}

            {/* Auditor routes - używamy zorganizowanych routes */}
            {...auditorRoutes}

            {/* Contractor routes - używamy zorganizowanych routes */}
            {...contractorRoutes}

            {/* 404 */}
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
import { Route } from "react-router";
import { MarketingStrategyList } from "./list";
import { MarketingStrategyCreate } from "./create";
import { MarketingStrategyEdit } from "./edit";
import { MarketingStrategyShow } from "./show";

// Komponenty
export { MarketingStrategyCreate } from './create';
export { MarketingStrategyEdit } from './edit';
export { MarketingStrategyList } from './list';
export { MarketingStrategyShow } from './show';

// Resource definition
export const marketingStrategyResource = {
  name: "marketing_strategies",
  list: "/marketing-strategies",
  create: "/marketing-strategies/create",
  edit: "/marketing-strategies/edit/:id",
  show: "/marketing-strategies/show/:id",
  meta: {
    canDelete: true,
    label: "Marketing Strategies",
  },
};

// Routes
export const marketingStrategyRoutes = [
  <Route key="marketing-strategies-list" path="/marketing-strategies" element={<MarketingStrategyList />} />,
  <Route key="marketing-strategies-create" path="/marketing-strategies/create" element={<MarketingStrategyCreate />} />,
  <Route key="marketing-strategies-edit" path="/marketing-strategies/edit/:id" element={<MarketingStrategyEdit />} />,
  <Route key="marketing-strategies-show" path="/marketing-strategies/show/:id" element={<MarketingStrategyShow />} />,
];
import { Route } from "react-router";
import { ProfileList } from "./list";
import { ProfileCreate } from "./create";
import { ProfileEdit } from "./edit";
import { ProfileShow } from "./show";


// Komponenty
export { ProfileCreate } from './create';
export { ProfileEdit } from './edit';
export { ProfileList } from './list';
export { ProfileShow } from './show';

// Resource definition
export const profileResource = {
  name: "profiles",
  list: "/profiles",
  create: "/profiles/create",
  edit: "/profiles/edit/:id",
  show: "/profiles/show/:id",
  meta: {
    canDelete: true,
    label: "Profiles",
  },
};

// Routes
export const profileRoutes = [
  <Route key="profiles-list" path="/profiles" element={<ProfileList />} />,
  <Route key="profiles-create" path="/profiles/create" element={<ProfileCreate />} />,
  <Route key="profiles-edit" path="/profiles/edit/:id" element={<ProfileEdit />} />,
  <Route key="profiles-show" path="/profiles/show/:id" element={<ProfileShow />} />,
];
// pages/categories/index.js - wszystko w jednym miejscu
import { Route } from "react-router";
import { CategoryList } from "./list";
import { CategoryCreate } from "./create";
import { CategoryEdit } from "./edit";
import { CategoryShow } from "./show";

// Komponenty
export { CategoryCreate } from './create';
export { CategoryEdit } from './edit';
export { CategoryList } from './list';
export { CategoryShow } from './show';

export const categoryResource = {
  name: "categories",
  list: "/categories",
  create: "/categories/create",
  edit: "/categories/edit/:id",
  show: "/categories/show/:id",
  meta: {
    canDelete: true,
    label: "Categories",
  },
};

export const categoryRoutes = [
  <Route key="categories-list" path="/categories" element={<CategoryList />} />,
  <Route key="categories-create" path="/categories/create" element={<CategoryCreate />} />,
  <Route key="categories-edit" path="/categories/edit/:id" element={<CategoryEdit />} />,
  <Route key="categories-show" path="/categories/show/:id" element={<CategoryShow />} />,
];
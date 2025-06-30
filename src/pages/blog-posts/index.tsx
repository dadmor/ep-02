// pages/blog-posts/index.js
import { Route } from "react-router";
import { BlogPostList } from "./list";
import { BlogPostCreate } from "./create";
import { BlogPostEdit } from "./edit";
import { BlogPostShow } from "./show";

// Komponenty
export { BlogPostCreate } from './create';
export { BlogPostEdit } from './edit';
export { BlogPostList } from './list';
export { BlogPostShow } from './show';

// Resource definition
export const blogPostResource = {
  name: "blog_posts",
  list: "/blog-posts",
  create: "/blog-posts/create",
  edit: "/blog-posts/edit/:id",
  show: "/blog-posts/show/:id",
  meta: {
    canDelete: true,
    label: "Blog Posts",
  },
};

// Routes - zwracamy JSX bezpośrednio, nie funkcję komponenta
// pages/blog-posts/index.js
export const blogPostRoutes = [
  <Route key="blog-posts-list" path="/blog-posts" element={<BlogPostList />} />,
  <Route key="blog-posts-create" path="/blog-posts/create" element={<BlogPostCreate />} />,
  <Route key="blog-posts-edit" path="/blog-posts/edit/:id" element={<BlogPostEdit />} />,
  <Route key="blog-posts-show" path="/blog-posts/show/:id" element={<BlogPostShow />} />,
];
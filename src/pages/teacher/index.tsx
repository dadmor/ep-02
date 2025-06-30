// src/pages/teacher/index.tsx - POPRAWIONY dla rzeczywistej bazy danych
import React from "react";
import { Route } from "react-router-dom";

// Import komponentów
import { TeacherDashboard } from "./dashboard";
import TeacherLessons from "./ui.Lessons";
import LessonCreate from "./ui.LessonCreate";
import LessonEdit from "./ui.LessonEdit";
import LessonShow from "./ui.LessonShow";
import TeacherClasses from "./ui.Classes";
import ClassCreate from "./ui.ClassCreate";
import ClassEdit from "./ui.ClassEdit";
import ClassShow from "./ui.ClassShow";
import TeacherStudents from "./ui.Students";
import StudentProgress from "./ui.StudentProgress";
import TeacherArticles from "./ui.Articles";
import ArticleCreate from "./ui.ArticleCreate";
// import ArticleEdit from "./ui.ArticleEdit";
import ArticleShow from "./ui.ArticleShow";
import TeacherTasks from "./ui.Tasks";
import TaskCreate from "./ui.TaskCreate";
// import TaskEdit from "./ui.TaskEdit";
// import TaskShow from "./ui.TaskShow";
import TeacherBadges from "./ui.Badges";
// import BadgeCreate from "./ui.BadgeCreate";
// import BadgeEdit from "./ui.BadgeEdit";
// import ClassEnrollments from "./ui.ClassEnrollments";
import ErrorAnalysis from "./ui.ErrorAnalysis";
import Rankings from "./ui.Rankings";

// Export wszystkich komponentów
export { TeacherDashboard } from "./dashboard";
export { default as TeacherLessons } from "./ui.Lessons";
export { default as LessonCreate } from "./ui.LessonCreate";
export { default as LessonEdit } from "./ui.LessonEdit";
export { default as LessonShow } from "./ui.LessonShow";
export { default as TeacherClasses } from "./ui.Classes";
export { default as ClassCreate } from "./ui.ClassCreate";
export { default as ClassEdit } from "./ui.ClassEdit";
export { default as ClassShow } from "./ui.ClassShow";
export { default as TeacherStudents } from "./ui.Students";
export { default as StudentProgress } from "./ui.StudentProgress";
export { default as TeacherArticles } from "./ui.Articles";
export { default as ArticleCreate } from "./ui.ArticleCreate";
// export { default as ArticleEdit } from "./ui.ArticleEdit";
export { default as ArticleShow } from "./ui.ArticleShow";
export { default as TeacherTasks } from "./ui.Tasks";
export { default as TaskCreate } from "./ui.TaskCreate";
// export { default as TaskEdit } from "./ui.TaskEdit";
// export { default as TaskShow } from "./ui.TaskShow";
export { default as TeacherBadges } from "./ui.Badges";
// export { default as BadgeCreate } from "./ui.BadgeCreate";
// export { default as BadgeEdit } from "./ui.BadgeEdit";
// export { default as ClassEnrollments } from "./ui.ClassEnrollments";
export { default as ErrorAnalysis } from "./ui.ErrorAnalysis";
export { default as Rankings } from "./ui.Rankings";

// Resource definitions dla Refine - dostosowane do RZECZYWISTEJ bazy
export const teacherResources = [
  {
    name: "lessons",
    list: "/teacher/lessons",
    create: "/teacher/lessons/create",
    edit: "/teacher/lessons/edit/:id",
    show: "/teacher/lessons/:id",
    meta: {
      label: "Lekcje",
      icon: "📚",
    },
  },
  {
    name: "articles",
    list: "/teacher/articles",
    create: "/teacher/articles/create",
    edit: "/teacher/articles/edit/:id",
    show: "/teacher/articles/:id",
    meta: {
      label: "Artykuły",
      icon: "📄",
    },
  },
  {
    name: "tasks",
    list: "/teacher/tasks",
    create: "/teacher/tasks/create",
    edit: "/teacher/tasks/edit/:id",
    show: "/teacher/tasks/:id",
    meta: {
      label: "Zadania",
      icon: "📝",
    },
  },
  {
    name: "classes", 
    list: "/teacher/classes",
    create: "/teacher/classes/create",
    edit: "/teacher/classes/edit/:id", 
    show: "/teacher/classes/:id",
    meta: {
      label: "Klasy",
      icon: "🎓",
    },
  },
  {
    name: "users",
    list: "/teacher/students",
    show: "/teacher/students/:id",
    meta: {
      label: "Uczniowie",
      icon: "👥",
    },
  },
  {
    name: "progress",
    list: "/teacher/progress",
    show: "/teacher/progress/:id",
    meta: {
      label: "Postępy uczniów",
      icon: "📊",
    },
  },
  {
    name: "badges",
    list: "/teacher/badges",
    create: "/teacher/badges/create",
    edit: "/teacher/badges/edit/:id",
    meta: {
      label: "Odznaki",
      icon: "🏆",
    },
  },
  {
    name: "class_enrollments",
    list: "/teacher/enrollments",
    create: "/teacher/enrollments/create",
    meta: {
      label: "Zapisy do klas",
      icon: "📋",
    },
  },
  {
    name: "error_analysis",
    list: "/teacher/errors",
    meta: {
      label: "Analiza błędów",
      icon: "🔍",
    },
  },
  {
    name: "rankings",
    list: "/teacher/rankings",
    meta: {
      label: "Rankingi",
      icon: "🏅",
    },
  },
];

// Routes dla teacher - kompletne
export const teacherRoutes = [
  <Route key="teacher-dashboard" path="/teacher" element={<TeacherDashboard />} />,
  <Route key="teacher-dashboard-explicit" path="/teacher/dashboard" element={<TeacherDashboard />} />,
  
  // Lessons
  <Route key="teacher-lessons" path="/teacher/lessons" element={<TeacherLessons />} />,
  <Route key="teacher-lessons-create" path="/teacher/lessons/create" element={<LessonCreate />} />,
  <Route key="teacher-lessons-edit" path="/teacher/lessons/edit/:id" element={<LessonEdit />} />,
  <Route key="teacher-lessons-show" path="/teacher/lessons/:id" element={<LessonShow />} />,
  
  // Articles
  <Route key="teacher-articles" path="/teacher/articles" element={<TeacherArticles />} />,
  <Route key="teacher-articles-create" path="/teacher/articles/create" element={<ArticleCreate />} />,
  // <Route key="teacher-articles-edit" path="/teacher/articles/edit/:id" element={<ArticleEdit />} />,
  <Route key="teacher-articles-show" path="/teacher/articles/:id" element={<ArticleShow />} />,
  
  // Tasks
  <Route key="teacher-tasks" path="/teacher/tasks" element={<TeacherTasks />} />,
  <Route key="teacher-tasks-create" path="/teacher/tasks/create" element={<TaskCreate />} />,
  // <Route key="teacher-tasks-edit" path="/teacher/tasks/edit/:id" element={<TaskEdit />} />,
  // <Route key="teacher-tasks-show" path="/teacher/tasks/:id" element={<TaskShow />} />,
  
  // Classes
  <Route key="teacher-classes" path="/teacher/classes" element={<TeacherClasses />} />,
  <Route key="teacher-classes-create" path="/teacher/classes/create" element={<ClassCreate />} />,
  <Route key="teacher-classes-edit" path="/teacher/classes/edit/:id" element={<ClassEdit />} />,
  <Route key="teacher-classes-show" path="/teacher/classes/:id" element={<ClassShow />} />,
  
  // Students
  <Route key="teacher-students" path="/teacher/students" element={<TeacherStudents />} />,
  <Route key="teacher-students-show" path="/teacher/students/:id" element={<StudentProgress />} />,
  
  // Progress
  <Route key="teacher-progress" path="/teacher/progress" element={<StudentProgress />} />,
  
  // Badges
  <Route key="teacher-badges" path="/teacher/badges" element={<TeacherBadges />} />,
  // <Route key="teacher-badges-create" path="/teacher/badges/create" element={<BadgeCreate />} />,
  // <Route key="teacher-badges-edit" path="/teacher/badges/edit/:id" element={<BadgeEdit />} />,
  
  // Enrollments
    // <Route key="teacher-enrollments" path="/teacher/enrollments" element={<ClassEnrollments />} />,
  
  // Error Analysis
  <Route key="teacher-errors" path="/teacher/errors" element={<ErrorAnalysis />} />,
  
  // Rankings
  <Route key="teacher-rankings" path="/teacher/rankings" element={<Rankings />} />,
];
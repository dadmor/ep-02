// src/pages/teacher/index.tsx - NAPRAWIONY z komponentami odznak
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
import ClassEnrollments from "./ui.ClassEnrollments";
import ClassLessons from "./ui.ClassLessons";
import TeacherStudents from "./ui.Students";
import StudentProgress from "./ui.StudentProgress";
import TeacherArticles from "./ui.Articles";
import ArticleCreate from "./ui.ArticleCreate";
import ArticleShow from "./ui.ArticleShow";
import TeacherTasks from "./ui.Tasks";
import TaskCreate from "./ui.TaskCreate";
import TaskEdit from "./ui.TaskEdit";
import TaskShow from "./ui.TaskShow";
import TeacherBadges from "./ui.Badges";
import BadgeCreate from "./ui.BadgeCreate";  // DODANE
import BadgeEdit from "./ui.BadgeEdit";      // DODANE
import BadgeShow from "./ui.BadgeShow";      // DODANE
import ErrorAnalysis from "./ui.ErrorAnalysis";
import Rankings from "./ui.Rankings";
import ArticleEdit from "./ui.ArticleEdit";
import { ro } from "date-fns/locale";

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
export { default as ClassEnrollments } from "./ui.ClassEnrollments";
export { default as ClassLessons } from "./ui.ClassLessons";
export { default as TeacherStudents } from "./ui.Students";
export { default as StudentProgress } from "./ui.StudentProgress";
export { default as TeacherArticles } from "./ui.Articles";
export { default as ArticleCreate } from "./ui.ArticleCreate";
export { default as ArticleShow } from "./ui.ArticleShow";
export { default as TeacherTasks } from "./ui.Tasks";
export { default as TaskCreate } from "./ui.TaskCreate";
export { default as TaskEdit } from "./ui.TaskEdit";
export { default as TaskShow } from "./ui.TaskShow";
export { default as TeacherBadges } from "./ui.Badges";
export { default as BadgeCreate } from "./ui.BadgeCreate";    // DODANE
export { default as BadgeEdit } from "./ui.BadgeEdit";        // DODANE  
export { default as BadgeShow } from "./ui.BadgeShow";        // DODANE
export { default as ErrorAnalysis } from "./ui.ErrorAnalysis";
export { default as Rankings } from "./ui.Rankings";
export { default as ArticleEdit } from "./ui.ArticleEdit";

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
      roles: ["teacher"],
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
      roles: ["teacher"],
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
      roles: ["teacher"],
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
      roles: ["teacher"],
    },
  },
  {
    name: "users",
    list: "/teacher/students",
    show: "/teacher/students/:id",
    meta: {
      label: "Uczniowie",
      icon: "👥",
      roles: ["teacher"],
    },
  },
  {
    name: "progress",
    list: "/teacher/progress",
    show: "/teacher/progress/:id",
    meta: {
      label: "Postępy uczniów",
      icon: "📊",
      roles: ["teacher"],
    },
  },
  {
    name: "badges",
    list: "/teacher/badges",
    create: "/teacher/badges/create",
    edit: "/teacher/badges/edit/:id",
    show: "/teacher/badges/:id",        // DODANE show
    meta: {
      label: "Odznaki",
      icon: "🏆",
      roles: ["teacher"],
    },
  },
  {
    name: "class_enrollments",
    list: "/teacher/enrollments",
    create: "/teacher/enrollments/create",
    meta: {
      label: "Zapisy do klas",
      icon: "📋",
      roles: ["teacher"],
    },
  },
  {
    name: "class_lessons",
    list: "/teacher/class-lessons",
    create: "/teacher/class-lessons/create",
    meta: {
      label: "Lekcje w klasach",
      icon: "📖",
      roles: ["teacher"],
    },
  },
  {
    name: "error_analysis",
    list: "/teacher/errors",
    meta: {
      label: "Analiza błędów",
      icon: "🔍",
      roles: ["teacher"],
    },
  },
  {
    name: "rankings",
    list: "/teacher/rankings",
    meta: {
      label: "Rankingi",
      icon: "🏅",
      roles: ["teacher"],
    },
  },
];

// Routes dla teacher - kompletne z nowymi komponentami
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
  <Route key="teacher-articles-edit" path="/teacher/articles/edit/:id" element={<ArticleEdit />} />,
  <Route key="teacher-articles-show" path="/teacher/articles/:id" element={<ArticleShow />} />,
  
  // Tasks
  <Route key="teacher-tasks" path="/teacher/tasks" element={<TeacherTasks />} />,
  <Route key="teacher-tasks-create" path="/teacher/tasks/create" element={<TaskCreate />} />,
  <Route key="teacher-tasks-edit" path="/teacher/tasks/edit/:id" element={<TaskEdit />} />,
  <Route key="teacher-tasks-show" path="/teacher/tasks/:id" element={<TaskShow />} />,
  
  // Classes
  <Route key="teacher-classes" path="/teacher/classes" element={<TeacherClasses />} />,
  <Route key="teacher-classes-create" path="/teacher/classes/create" element={<ClassCreate />} />,
  <Route key="teacher-classes-edit" path="/teacher/classes/edit/:id" element={<ClassEdit />} />,
  <Route key="teacher-classes-show" path="/teacher/classes/:id" element={<ClassShow />} />,
  
  // Class Management - NOWE KOMPONENTY
  <Route key="teacher-class-enrollments" path="/teacher/classes/:id/enrollments" element={<ClassEnrollments />} />,
  <Route key="teacher-class-lessons" path="/teacher/classes/:id/lessons" element={<ClassLessons />} />,
  
  // Alternative routes for class management
  <Route key="teacher-enrollments" path="/teacher/enrollments" element={<ClassEnrollments />} />,
  <Route key="teacher-class-lessons-alt" path="/teacher/class-lessons" element={<ClassLessons />} />,
  
  // Students
  <Route key="teacher-students" path="/teacher/students" element={<TeacherStudents />} />,
  <Route key="teacher-students-show" path="/teacher/students/:id" element={<StudentProgress />} />,
  
  // Progress
  <Route key="teacher-progress" path="/teacher/progress" element={<StudentProgress />} />,
  
  // Badges - POPRAWIONE I DODANE
  <Route key="teacher-badges" path="/teacher/badges" element={<TeacherBadges />} />,
  <Route key="teacher-badges-create" path="/teacher/badges/create" element={<BadgeCreate />} />,
  <Route key="teacher-badges-edit" path="/teacher/badges/edit/:id" element={<BadgeEdit />} />,
  <Route key="teacher-badges-show" path="/teacher/badges/:id" element={<BadgeShow />} />,
  
  // Error Analysis
  <Route key="teacher-errors" path="/teacher/errors" element={<ErrorAnalysis />} />,
  
  // Rankings
  <Route key="teacher-rankings" path="/teacher/rankings" element={<Rankings />} />,
];
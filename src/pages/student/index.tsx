// ====================================================
// src/pages/student/index.tsx
// ====================================================
import React from "react";
import { Route } from "react-router-dom";
import { Book, TrendingUp, Trophy, Medal } from "lucide-react";

// Import komponentów
import { StudentDashboard } from "./dashboard";
import StudentLessons from "./ui.Lessons";
import LessonTake from "./ui.LessonTake";
import StudentProgress from "./ui.Progress";
import StudentBadges from "./ui.Badges";
import StudentRankings from "./ui.Rankings";

// Export wszystkich komponentów
export { StudentDashboard } from "./dashboard";
export { default as StudentLessons } from "./ui.Lessons";
export { default as LessonTake } from "./ui.LessonTake";
export { default as StudentProgress } from "./ui.Progress";
export { default as StudentBadges } from "./ui.Badges";
export { default as StudentRankings } from "./ui.Rankings";

// Resource definitions dla Refine - student
export const studentResources = [
  {
    name: "student-lessons",
    list: "/student/lessons",
    show: "/student/lessons/:id",
    meta: {
      label: "Lekcje",
      icon: <Book className="h-4 w-4" />,
      roles: ["student"],
    },
  },
  {
    name: "student-progress",
    list: "/student/progress",
    meta: {
      label: "Moje postępy",
      icon: <TrendingUp className="h-4 w-4" />,
      roles: ["student"],
    },
  },
  {
    name: "student-badges",
    list: "/student/badges",
    meta: {
      label: "Odznaki",
      icon: <Trophy className="h-4 w-4" />,
      roles: ["student"],
    },
  },
  {
    name: "student-rankings",
    list: "/student/rankings",
    meta: {
      label: "Ranking",
      icon: <Medal className="h-4 w-4" />,
      roles: ["student"],
    },
  },
];

// Routes dla student
export const studentRoutes = [
  <Route key="student-dashboard" path="/student" element={<StudentDashboard />} />,
  <Route key="student-dashboard-explicit" path="/student/dashboard" element={<StudentDashboard />} />,
  
  // Lessons
  <Route key="student-lessons" path="/student/lessons" element={<StudentLessons />} />,
  <Route key="student-lesson-take" path="/student/lessons/:id" element={<LessonTake />} />,
  
  // Progress
  <Route key="student-progress" path="/student/progress" element={<StudentProgress />} />,
  
  // Badges
  <Route key="student-badges" path="/student/badges" element={<StudentBadges />} />,
  
  // Rankings
  <Route key="student-rankings" path="/student/rankings" element={<StudentRankings />} />,
];
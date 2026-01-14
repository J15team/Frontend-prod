/**
 * App Component
 * アプリケーションのメインコンポーネント
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ScrollToTop } from '@/components/common/ScrollToTop/ScrollToTop';
import { LandingView } from '@/views/landing/LandingView';
import { MemberDetailView } from '@/views/landing/MemberDetailView';
import { RootView } from '@/views/RootView';
import { SignupView } from '@/views/auth/SignupView';
import { SigninView } from '@/views/auth/SigninView';
import { AdminSigninView } from '@/views/auth/AdminSigninView';
import { TokenRefreshView } from '@/views/auth/TokenRefreshView';
import { GitHubCallbackView } from '@/views/auth/GitHubCallbackView';
import { GitHubConnectCallbackView } from '@/views/auth/GitHubConnectCallbackView';
import { SubjectsView } from '@/views/subjects/SubjectsView';
import { SubjectManagementView } from '@/views/subjects/SubjectManagementView';
import { SectionsView } from '@/views/sections/SectionsView';
import { SectionManagementView } from '@/views/sections/SectionManagementView';
import { ProgressInspectorView } from '@/views/progress/ProgressInspectorView';
import { ProfileView } from '@/views/profile/ProfileView';
import { AdminUsersView } from '@/views/admin/AdminUsersView';
import { AdminLayout } from '@/views/admin/AdminLayout';
import { AdminDashboardView } from '@/views/admin/AdminDashboardView';
import { TagManagementView } from '@/views/admin/TagManagementView';
import { RankingView } from '@/views/ranking/RankingView';
import { ForbiddenView } from '@/views/error/ForbiddenView';
import { AdminKeyRequiredView } from '@/views/error/AdminKeyRequiredView';
import { ProtectedRoute } from '@/components/common/ProtectedRoute/ProtectedRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
        {/* ランディングページ（公開） */}
        <Route path="/" element={<LandingView />} />
        <Route path="/team/:memberId" element={<MemberDetailView />} />

        {/* 認証ルート */}
        <Route path="/auth/signup" element={<SignupView />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/auth/signin" element={<SigninView />} />
        <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/auth/admin-signin" element={<AdminSigninView />} />
        <Route path="/auth/token-refresh" element={<TokenRefreshView />} />
        <Route path="/auth/github/callback" element={<GitHubCallbackView />} />
        <Route path="/github/connect/callback" element={<GitHubConnectCallbackView />} />

        {/* エラーページ */}
        <Route path="/error/forbidden" element={<ForbiddenView />} />
        <Route path="/error/admin-key-required" element={<AdminKeyRequiredView />} />

        {/* 保護されたルート */}
        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <SubjectsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/manage"
          element={<Navigate to="/admin/subjects" replace />}
        />
        <Route
          path="/subjects/:subjectId/sections"
          element={
            <ProtectedRoute>
              <SectionsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sections/manage"
          element={<Navigate to="/admin/sections" replace />}
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressInspectorView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <RankingView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminDashboardView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/endpoints"
          element={
            <ProtectedRoute requireAdmin={true}>
              <RootView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <SubjectManagementView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sections"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <SectionManagementView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tags"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <TagManagementView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsersView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ScrollToTop />
      </Router>
    </ThemeProvider>
  );
};

export default App;

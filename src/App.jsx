import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import UserListPage from './pages/UserListPage';
import UserCreatePage from './pages/UserCreatePage';
import UserEditPage from './pages/UserEditPage';
import UserDetailPage from './pages/UserDetailPage';
import CourseListPage from './pages/CourseListPage';
import CourseCreatePage from './pages/CourseCreatePage';
import CourseEditPage from './pages/CourseEditPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CategoryListPage from './pages/CategoryListPage';
import LessonListPage from './pages/LessonListPage';
import LessonCreatePage from './pages/LessonCreatePage';
import LessonEditPage from './pages/LessonEditPage';
import LessonDetailPage from './pages/LessonDetailPage';
import AllLessonsPage from './pages/AllLessonsPage';

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute>
          <CourseListPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/create" element={
        <ProtectedRoute>
          <CourseCreatePage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug" element={
        <ProtectedRoute>
          <CourseDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug/edit" element={
        <ProtectedRoute>
          <CourseEditPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug/lessons" element={
        <ProtectedRoute>
          <LessonListPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug/lessons/create" element={
        <ProtectedRoute>
          <LessonCreatePage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug/lessons/:id" element={
        <ProtectedRoute>
          <LessonDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:slug/lessons/:id/edit" element={
        <ProtectedRoute>
          <LessonEditPage />
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <CategoryListPage />
        </ProtectedRoute>
      } />
      <Route path="/lessons" element={
        <ProtectedRoute>
          <AllLessonsPage />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['administrator']}>
          <UserListPage />
        </ProtectedRoute>
      } />
      <Route path="/users/create" element={
        <ProtectedRoute allowedRoles={['administrator']}>
          <UserCreatePage />
        </ProtectedRoute>
      } />
      <Route path="/users/:id" element={
        <ProtectedRoute allowedRoles={['administrator']}>
          <UserDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/users/:id/edit" element={
        <ProtectedRoute allowedRoles={['administrator']}>
          <UserEditPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

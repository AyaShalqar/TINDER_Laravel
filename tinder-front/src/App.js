import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage'; 
import WelcomePage from './pages/WelcomePage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

const AppContent = () => {
  const auth = React.useContext(AuthContext);
  const location = useLocation();

  const showNavbar = !(location.pathname === '/' && !auth.isAuthenticated);
  const containerStyle = showNavbar 
    ? { padding: '20px', marginTop: '60px' } 
    : { padding: '0', margin: '0', width: '100vw', height: '100vh', overflow: 'hidden' };

  if (auth.loading && location.pathname !== '/') {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <>
      {showNavbar && <Navbar />}
      <div 
        className={showNavbar ? "container" : ""}
        style={containerStyle}
      >
        <Routes>
          <Route 
            path="/" 
            element={auth.isAuthenticated ? <Navigate to="/home" replace /> : <WelcomePage />} 
          />
          <Route 
            path="/login" 
            element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />} 
          />
          <Route 
            path="/register" 
            element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to="/home" replace />} 
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat" element={<ChatPage />} /> 
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
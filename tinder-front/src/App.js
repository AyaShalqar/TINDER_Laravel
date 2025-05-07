// src/App.js
import React from 'react';
// Keep BrowserRouter as Router from react-router-dom if that's what you have
// If you use BrowserRouter directly, ensure it's imported as `BrowserRouter`
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext'; // Assuming AuthContext exports isAuthenticated, loading
import Navbar from './components/Navbar'; // Assuming this path is correct
import ProtectedRoute from './components/ProtectedRoute'; // Assuming this path is correct

// Import your page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // This will be your main authenticated page
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MatchesPage from './pages/MatchesPage';
import WelcomePage from './pages/WelcomePage'; // <-- Import WelcomePage
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

// This component will decide what to show at the root path "/"
// const RootHandler = () => {
//   const auth = React.useContext(AuthContext); // Get the whole context
//   const location = useLocation();

//   if (auth.loading) {
//     return <div className="app-loading">Loading application...</div>; // Centered loading
//   }

//   // If on root path "/"
//   if (location.pathname === '/') {
//     return auth.isAuthenticated ? <Navigate to="/home" replace /> : <WelcomePage />;
//   }
  
//   // For /login and /register, redirect if already authenticated
//   if ((location.pathname === '/login' || location.pathname === '/register') && auth.isAuthenticated) {
//       return <Navigate to="/home" replace />;
//   }
  
//   // Fallback for other unhandled cases by this component (though Routes below should handle them)
//   return null; 
// };


function App() {
  return (
    // Ensure BrowserRouter (or Router if aliased) is the outermost component from react-router-dom
    <BrowserRouter>
      <AuthProvider>
        {/* Inner component to access context and location for conditional rendering */}
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// New component to handle conditional rendering of Navbar and container styles
// This component is inside AuthProvider so it can access auth context
const AppContent = () => {
  const auth = React.useContext(AuthContext);
  const location = useLocation();

  // Show Navbar unless on WelcomePage (root path AND not authenticated)
  const showNavbar = !(location.pathname === '/' && !auth.isAuthenticated);

  // Adjust container style for WelcomePage (full screen)
  const containerStyle = showNavbar 
    ? { padding: '20px', marginTop: '60px' } // Adjust marginTop if your Navbar height is different
    : { padding: '0', margin: '0', width: '100vw', height: '100vh', overflow: 'hidden' };

  if (auth.loading && location.pathname !== '/') { // Show full page loading unless it's root handled by RootHandler
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <>
      {showNavbar && <Navbar />}
      <div 
        className={showNavbar ? "container" : ""} // Apply "container" class only if navbar is shown
        style={containerStyle}
      >
        <Routes>
          {/* Root path handled by WelcomePage or redirect to /home */}
          <Route 
            path="/" 
            element={auth.isAuthenticated ? <Navigate to="/home" replace /> : <WelcomePage />} 
          />
          
          {/* Auth routes: redirect if already logged in */}
          <Route 
            path="/login" 
            element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />} 
          />
          <Route 
            path="/register" 
            element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to="/home" replace />} 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/matches" element={<MatchesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
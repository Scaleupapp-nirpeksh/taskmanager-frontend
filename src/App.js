import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Box,
} from '@mui/material';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationBell from './components/Dashboard/NotificationBell';
import { NotificationProvider } from './components/Dashboard/NotificationContext';

// Updated code without lazy loading
import Expense from './pages/Expense';
import Category from './pages/Category';
import DocumentList from './components/Dashboard/DocumentList';
import DocumentEdit from './components/Dashboard/DocumentEdit';
import DocumentView from './components/Dashboard/DocumentView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('token'))
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <NotificationProvider>
      <Router>
        {/* Navigation Bar */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Foundry
            </Typography>
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ mt: 5 }}>
          {!isAuthenticated && (
            <Box textAlign="center" mb={5}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to Foundry
              </Typography>
              <Typography variant="h5" color="textSecondary">
                The all-in-one platform to manage your startup's finances, contributions, and
                projects
              </Typography>
            </Box>
          )}

          {/* Routes */}
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
            />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/category" element={<Category />} />
                <Route path="/documents" element={<DocumentList />} />
                <Route path="/documents/new" element={<DocumentEdit />} />
                <Route path="/documents/:id" element={<DocumentView />} />
                <Route path="/documents/:id/edit" element={<DocumentEdit />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </Container>
      </Router>
    </NotificationProvider>
  );
}

export default App;

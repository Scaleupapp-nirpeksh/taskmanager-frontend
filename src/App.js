// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Typography, Box } from '@mui/material';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Expense from './pages/Expense';
import Category from './pages/Category';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  // Set up state for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

  // Effect to listen for token changes in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Update logout function to also update state
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false); // Update state to re-render
  };

  return (
    <Router>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Foundry
          </Typography>
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
        <Box textAlign="center" mb={5}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Foundry
          </Typography>
          <Typography variant="h5" color="textSecondary">
            The all-in-one platform to manage your startup's finances, contributions, and projects
          </Typography>
        </Box>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

          {/* Protected Routes */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expense" element={<Expense />} />
              <Route path="/category" element={<Category />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

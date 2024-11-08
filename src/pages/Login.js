import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, TextField, Button, Card, Typography, Box, Alert } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token); // Save token in localStorage
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: { xs: 2, sm: 4 }, mt: { xs: 3, sm: 5 } }}>
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 4 }, boxShadow: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center" 
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            alignItems: 'stretch' 
          }}
        >
          <TextField 
            label="Email" 
            name="email" 
            type="email" 
            variant="outlined" 
            fullWidth 
            onChange={handleChange} 
            required 
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          />
          <TextField 
            label="Password" 
            name="password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            onChange={handleChange} 
            required 
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            type="submit" 
            fullWidth 
            sx={{ 
              py: { xs: 1.5, sm: 2 }, 
              fontSize: { xs: '0.875rem', sm: '1rem' } 
            }}
          >
            Login
          </Button>
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default Login;

// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, TextField, Button, Card, Typography, Box, Alert } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

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
    <Container maxWidth="sm">
      <Card variant="outlined" sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Email" 
            name="email" 
            type="email" 
            variant="outlined" 
            fullWidth 
            onChange={handleChange} 
            required 
          />
          <TextField 
            label="Password" 
            name="password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            onChange={handleChange} 
            required 
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Login
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default Login;

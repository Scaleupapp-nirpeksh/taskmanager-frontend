// frontend/src/pages/Signup.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Container, TextField, Button, Card, Typography, Box, Alert } from '@mui/material';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone_number: '', password: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login'); // Redirect to login after success
      }, 1000); // Wait 1 second before redirecting
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Card variant="outlined" sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom align="center">
          Sign Up
        </Typography>
        {success && <Alert severity="success">Registration successful! Redirecting to login...</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Name" 
            name="name" 
            variant="outlined" 
            fullWidth 
            onChange={handleChange} 
            required 
          />
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
            label="Phone Number" 
            name="phone_number" 
            type="tel" 
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
            Register
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Log In</Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default Signup;

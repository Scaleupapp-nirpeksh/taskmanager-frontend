import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container,
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const Category = () => {
  const [formData, setFormData] = useState({ category_name: '', subcategory_name: '' });
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await api.post('/categories', formData);
      setSuccess(true);
      setFormData({ category_name: '', subcategory_name: '' });
      fetchCategories(); // Refresh category list after creation
    } catch (err) {
      setError('Failed to create category. Please try again.');
    }
  };

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.category_name]) {
      acc[category.category_name] = [];
    }
    acc[category.category_name].push(category.subcategory_name);
    return acc;
  }, {});

  return (
    <Container maxWidth="md">
      <Card variant="outlined" sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Category
        </Typography>
        {success && <Alert severity="success">Category created successfully!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Category Name"
            name="category_name"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.category_name}
            required
          />
          <TextField
            label="Subcategory Name"
            name="subcategory_name"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.subcategory_name}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Create Category
          </Button>
        </Box>

        {/* Display Categories and Subcategories */}
        <Box mt={5}>
          <Typography variant="h5" gutterBottom>
            All Categories
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Category</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Subcategories</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(groupedCategories).map((categoryName) => (
                  <TableRow key={categoryName}>
                    <TableCell sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                      {categoryName}
                    </TableCell>
                    <TableCell>
                      {groupedCategories[categoryName].length > 0 ? (
                        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                          {groupedCategories[categoryName].map((subcategoryName, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>
                              {subcategoryName}
                            </li>
                          ))}
                        </Box>
                      ) : (
                        'No Subcategories'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </Container>
  );
};

export default Category;

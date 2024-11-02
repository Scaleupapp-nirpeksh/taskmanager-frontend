import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, Autocomplete } from '@mui/material';
import api from '../../services/api';

const CategoryForm = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [subcategorySuggestions, setSubcategorySuggestions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/task-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (e, newValue) => {
    if (!newValue) {
      setCategoryName(''); // Clear the category name if there's no input
      setSelectedCategoryId(null);
      setSubcategorySuggestions([]);
      return;
    }
  
    setCategoryName(newValue);
  
    // Find matching category from the existing list
    const matchingCategory = categories.find(cat => 
      cat.categoryName && cat.categoryName.toLowerCase() === newValue.toLowerCase()
    );
  
    if (matchingCategory) {
      setSelectedCategoryId(matchingCategory._id);
      setSubcategorySuggestions(matchingCategory.subcategories);
    } else {
      setSelectedCategoryId(null);
      setSubcategorySuggestions([]);
    }
  };
  

  const handleSubcategoryChange = (e, newValue) => {
    setSubcategory(newValue);

    if (subcategorySuggestions.length > 0) {
      const filteredSuggestions = subcategorySuggestions.filter(sub =>
        sub.toLowerCase().startsWith(newValue.toLowerCase())
      );
      setSubcategorySuggestions(filteredSuggestions);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim() || !subcategory.trim()) {
      alert("Both category and at least one subcategory are required.");
      return;
    }
  
    // Check for duplicate category-subcategory combination in the frontend
    const existingCategory = categories.find(cat => cat.categoryName.toLowerCase() === categoryName.toLowerCase());
    if (existingCategory && existingCategory.subcategories.includes(subcategory)) {
      alert("This category-subcategory combination already exists.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const categoryData = {
        categoryName,
        subcategories: [subcategory],
      };
  
      await api.post('/task-categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCategoryName('');
      setSubcategory('');
      fetchCategories(); // Refresh category list after addition
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };
  

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Manage Categories and Subcategories</Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
        {/* Increased width for Category Input */}
        <Autocomplete
          freeSolo
          options={categories.map(cat => cat.categoryName)}
          value={categoryName}
          onChange={handleCategoryChange}
          onInputChange={(e, newValue) => handleCategoryChange(e, newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Category Name" fullWidth sx={{ width: '300px' }} />
          )}
        />

        {/* Increased width for Subcategory Input */}
        <Autocomplete
          freeSolo
          options={subcategorySuggestions}
          value={subcategory}
          onChange={handleSubcategoryChange}
          onInputChange={(e, newValue) => handleSubcategoryChange(e, newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Subcategory" fullWidth sx={{ width: '300px' }} />
          )}
        />

        {/* Save Button */}
        <Button variant="contained" color="primary" onClick={handleSaveCategory} sx={{ height: '56px' }}>
          Save
        </Button>
      </Box>

      {/* Display Categories and Subcategories Table with reduced width */}
      <Box sx={{ maxWidth: '600px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Existing Categories and Subcategories</Typography>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>Subcategories</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.categoryName}</TableCell>
                <TableCell>
                  <Table size="small">
                    <TableBody>
                      {category.subcategories.map((sub, index) => (
                        <TableRow key={index}>
                          <TableCell>{sub}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default CategoryForm;

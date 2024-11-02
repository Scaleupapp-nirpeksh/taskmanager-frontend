import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, TextField, Button, Card, Typography, Box, MenuItem, Alert, InputAdornment, Slider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { format } from 'date-fns';

const Expense = () => {
  const [formData, setFormData] = useState({
    expense_name: '',
    amount: '',
    date: '',
    category: '',
    subcategory: '',
    assigned_to: '',
    notes: '',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    user: '',
    category: '',
    subcategory: '',
    minAmount: 0,
    maxAmount: 100000000,
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchUsers();
    fetchExpenses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
  
      // Group by unique category name and collect subcategories
      const groupedCategories = response.data.reduce((acc, item) => {
        const { category_name, subcategory_name } = item;
  
        if (!acc[category_name]) {
          acc[category_name] = {
            category_name,
            subcategories: [],
          };
        }
        // Add unique subcategories to the category's subcategories array
        if (!acc[category_name].subcategories.includes(subcategory_name)) {
          acc[category_name].subcategories.push(subcategory_name);
        }
        return acc;
      }, {});
  
      // Convert grouped object to an array
      const uniqueCategories = Object.values(groupedCategories);
      setCategories(uniqueCategories);
  
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };
  

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const response = await api.get('/expenses', {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Fetched expenses:", response.data);  // Debug log
      setExpenses(response.data.expenses || response.data); // Set expenses state
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('You are not logged in');
        return;
      }
  
      const response = await api.post('/expenses', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setSuccess(true);
      setFormData({
        expense_name: '',
        amount: '',
        date: '',
        category: '',
        subcategory: '',
        assigned_to: '',
        notes: '',
      });
      fetchExpenses(); // Refresh expenses after adding a new one
    } catch (err) {
      setError('Failed to create expense. Please try again.');
      console.error(err);
    }
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: '' });
  
    // Find the selected category and set its subcategories
    const selectedCat = categories.find(cat => cat.category_name === selectedCategory);
    setSubcategories(selectedCat ? selectedCat.subcategories : []);
  };
  

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAmountChange = (event, newValue) => {
    setFilters({ ...filters, minAmount: newValue[0], maxAmount: newValue[1] });
  };

  return (
    <Container maxWidth="lg">
      {/* Create Expense Form */}
      <Card variant="outlined" sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Expense
        </Typography>
        {success && <Alert severity="success">Expense created successfully!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Expense Name"
            name="expense_name"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.expense_name}
            required
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.amount}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.date}
            InputLabelProps={{ shrink: true }}
            required
          />
            <TextField
              label="Category"
              name="category"
              variant="outlined"
              select
              fullWidth
              onChange={handleCategoryChange}
              value={formData.category}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.category_name} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            If your category or subcategory is not listed, please create it in the <a href="/category">Create Category</a> page.
          </Typography>
            <TextField
                label="Subcategory"
                name="subcategory"
                variant="outlined"
                select
                fullWidth
                onChange={handleChange}
                value={formData.subcategory}
                required
              >
                {subcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </TextField>

          <TextField
            label="Assigned To"
            name="assigned_to"
            variant="outlined"
            select
            fullWidth
            onChange={handleChange}
            value={formData.assigned_to}
            required
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user.name}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            name="notes"
            multiline
            rows={3}
            variant="outlined"
            fullWidth
            onChange={handleChange}
            value={formData.notes}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Create Expense
          </Button>
        </Box>
      </Card>

    </Container>
  );
};

export default Expense;

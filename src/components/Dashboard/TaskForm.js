import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  Paper,
  Autocomplete,
} from '@mui/material';
import api from '../../services/api';

const TaskForm = ({ onTaskCreated }) => {
  // State variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);
  const [categorySuccessMessage, setCategorySuccessMessage] = useState('');
  const [subcategorySuccessMessage, setSubcategorySuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New state variables for input values
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [subcategoryInputValue, setSubcategoryInputValue] = useState('');

  // Fetch users and categories on component mount
  useEffect(() => {
    const fetchUsersAndCategories = async () => {
      try {
        const token = localStorage.getItem('token');

        const userResponse = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(userResponse.data);

        const categoryResponse = await api.get('/task-categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchUsersAndCategories();
  }, []);

  // Create new category
  const createNewCategory = async (categoryName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/task-categories/',
        { categoryName, subcategories: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update categories state
      setCategories((prevCategories) => [...prevCategories, response.data]);
      setCategorySuccessMessage(`Category "${categoryName}" created successfully!`);
    } catch (error) {
      console.error('Failed to create category:', error);
      setErrorMessage(
        `Failed to create category "${categoryName}": ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Create new subcategory
  const createNewSubcategory = async (categoryName, subcategoryName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/task-categories/',
        { categoryName, subcategories: [subcategoryName] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update categories and subcategories state
      setCategories((prevCategories) =>
        prevCategories.map((cat) => (cat.categoryName === categoryName ? response.data : cat))
      );
      setSubcategories((prevSubcategories) => [...prevSubcategories, subcategoryName]);

      setSubcategorySuccessMessage(
        `Subcategory "${subcategoryName}" added to category "${categoryName}" successfully!`
      );
    } catch (error) {
      console.error('Failed to create subcategory:', error);
      setErrorMessage(
        `Failed to create subcategory "${subcategoryName}": ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Handle task creation
  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/tasks/create',
        { title, description, category, subcategory, deadline, status, assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTaskCreated();
      // Reset form fields
      setTitle('');
      setDescription('');
      setCategory('');
      setCategoryInputValue('');
      setSubcategory('');
      setSubcategoryInputValue('');
      setDeadline('');
      setStatus('To Do');
      setAssignedTo('');
      setSuccessMessage(true);
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrorMessage(`Failed to create task: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: '600px', mx: 'auto', p: 4, mt: 5, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Create New Task
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title */}
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          variant="outlined"
        />

        {/* Description */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
        />

        {/* Category */}
        <Autocomplete
          freeSolo
          options={categories.map((cat) => cat.categoryName)}
          value={category}
          inputValue={categoryInputValue}
          onInputChange={(event, newInputValue) => {
            setCategoryInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            setCategory(newValue);
            setCategoryInputValue(newValue || '');
            const selectedCategory = categories.find((cat) => cat.categoryName === newValue);
            if (selectedCategory) {
              setSubcategories(selectedCategory.subcategories);
              setSubcategory('');
              setSubcategoryInputValue('');
            } else {
              setSubcategories([]);
              setSubcategory('');
              setSubcategoryInputValue('');
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              variant="outlined"
              onBlur={() => {
                const newValue = categoryInputValue.trim();
                if (newValue && !categories.some((cat) => cat.categoryName === newValue)) {
                  if (window.confirm(`Category "${newValue}" does not exist. Would you like to create it?`)) {
                    createNewCategory(newValue);
                    setCategory(newValue);
                  } else {
                    setCategory('');
                    setCategoryInputValue('');
                    setSubcategories([]);
                    setSubcategory('');
                    setSubcategoryInputValue('');
                  }
                }
              }}
            />
          )}
        />

        {/* Subcategory */}
        <Autocomplete
          freeSolo
          options={subcategories}
          value={subcategory}
          inputValue={subcategoryInputValue}
          onInputChange={(event, newInputValue) => {
            setSubcategoryInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            setSubcategory(newValue);
            setSubcategoryInputValue(newValue || '');
          }}
          disabled={!category}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subcategory"
              variant="outlined"
              onBlur={() => {
                const newSubcategory = subcategoryInputValue.trim();
                if (
                  newSubcategory &&
                  !subcategories.includes(newSubcategory) &&
                  category
                ) {
                  if (
                    window.confirm(
                      `Subcategory "${newSubcategory}" does not exist under category "${category}". Would you like to create it?`
                    )
                  ) {
                    createNewSubcategory(category, newSubcategory);
                    setSubcategory(newSubcategory);
                  } else {
                    setSubcategory('');
                    setSubcategoryInputValue('');
                  }
                }
              }}
            />
          )}
        />

        {/* Deadline */}
        <TextField
          label="Deadline"
          type="date"
          value={deadline.slice(0, 10)}
          onChange={(e) => setDeadline(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />

        {/* Status */}
        <FormControl fullWidth variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        {/* Assigned To */}
        <FormControl fullWidth variant="outlined">
          <InputLabel>Assigned To</InputLabel>
          <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} label="Assigned To">
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Create Task Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateTask}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          Create Task
        </Button>

        {/* Success and Error Messages */}
        {/* Task Creation Success */}
        <Snackbar
          open={successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
            Task created successfully!
          </Alert>
        </Snackbar>

        {/* Category Creation Success */}
        <Snackbar
          open={Boolean(categorySuccessMessage)}
          autoHideDuration={3000}
          onClose={() => setCategorySuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setCategorySuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {categorySuccessMessage}
          </Alert>
        </Snackbar>

        {/* Subcategory Creation Success */}
        <Snackbar
          open={Boolean(subcategorySuccessMessage)}
          autoHideDuration={3000}
          onClose={() => setSubcategorySuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSubcategorySuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {subcategorySuccessMessage}
          </Alert>
        </Snackbar>

        {/* Error Messages */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={5000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
};

export default TaskForm;

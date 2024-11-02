import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Typography, Paper } from '@mui/material';
import api from '../../services/api';

const TaskForm = ({ onTaskCreated }) => {
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
        console.error("Failed to fetch data:", error);
      }
    };
    fetchUsersAndCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategoryName = e.target.value;
    setCategory(selectedCategoryName);
  
    const categoryObj = categories.find(cat => cat.categoryName === selectedCategoryName);
    setSubcategories(categoryObj ? categoryObj.subcategories : []);
    setSubcategory('');
  };
  
  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/tasks/create',
        { title, description, category, subcategory, deadline, status, assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTaskCreated();
      setTitle('');
      setDescription('');
      setCategory('');
      setSubcategory('');
      setDeadline('');
      setStatus('To Do');
      setAssignedTo('');
      setSuccessMessage(true);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ maxWidth: '600px', mx: 'auto', p: 4, mt: 5, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Create New Task
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth variant="outlined" />
        
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} variant="outlined" />

        <FormControl fullWidth variant="outlined">
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={handleCategoryChange} label="Category">
            {categories.map(cat => (
              <MenuItem key={cat._id} value={cat.categoryName}>{cat.categoryName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined" disabled={!category}>
          <InputLabel>Subcategory</InputLabel>
          <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} label="Subcategory">
            {subcategories.map((sub, index) => (
              <MenuItem key={index} value={sub}>{sub}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Deadline"
          type="date"
          value={deadline.slice(0, 10)}
          onChange={(e) => setDeadline(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel>Assigned To</InputLabel>
          <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} label="Assigned To">
            {users.map(user => (
              <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleCreateTask} sx={{ py: 1.5, fontSize: '1rem' }}>
          Create Task
        </Button>

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
      </Box>
    </Paper>
  );
};

export default TaskForm;

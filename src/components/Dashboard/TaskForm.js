// src/components/Dashboard/TaskForm.js
import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import api from '../../services/api';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/tasks', { title, description, deadline }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onTaskCreated();
      setTitle('');
      setDescription('');
      setDeadline('');
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
      <TextField label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} fullWidth />
      <Button variant="contained" color="primary" onClick={handleCreateTask}>Create Task</Button>
    </Box>
  );
};

export default TaskForm;

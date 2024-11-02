// src/components/Dashboard/TaskTab.js
import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TaskList from './TaskList'; 
import TaskForm from './TaskForm'; 
import api from '../../services/api'; 
import CategoryForm from './CategoryForm'; 

const TaskTab = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Task List" />
        <Tab label="Create Task" />
        <Tab label="Manage Categories" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <TaskList tasks={tasks} />}
        {activeTab === 1 && <TaskForm onTaskCreated={fetchTasks} />}
        {activeTab === 2 && <CategoryForm />}
      </Box>
    </Box>
  );
};

export default TaskTab;

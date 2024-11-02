import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
} from '@mui/material';
import TaskListView from './TaskListView';
import TaskStatusView from './TaskStatusView';
import TaskCalendarView from './TaskCalendarView';
import api from '../../services/api';
import TaskForm from './TaskForm';
import CategoryForm from './CategoryForm';

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [view, setView] = useState(0); // 0 = List View, 1 = Status View, 2 = Calendar View
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false); // Overdue toggle state
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    category: '',
    subcategory: '',
    dueDateRange: { start: '', end: '' },
  });

  const handleUpdateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = showOnlyOverdue ? '/tasks/overdue' : '/tasks';
      const params = showOnlyOverdue
        ? {}
        : {
            ...filters,
            startDate: filters.dueDateRange.start,
            endDate: filters.dueDateRange.end,
          };

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/task-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchCategories();
  }, [filters, showOnlyOverdue]);

  const handleViewChange = (event, newValue) => setView(newValue);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find((cat) => cat._id === categoryId);
    setFilters((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: '', // Reset subcategory when category changes
    }));
    setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  };

  const handleDateRangeChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      dueDateRange: { ...prev.dueDateRange, [type]: value },
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      assignedTo: '',
      category: '',
      subcategory: '',
      dueDateRange: { start: '', end: '' },
    });
    setSubcategories([]); // Clear subcategories when filters reset
  };

  const toggleOverdueTasks = () => setShowOnlyOverdue((prev) => !prev);

  return (
    <Box sx={{ mt: 3 }}>
      <Tabs value={view} onChange={(event, newValue) => setView(newValue)}>
        <Tab label="Create Task" />
        <Tab label="Status View" />
        <Tab label="Calendar View" />
        <Tab label="List View" />
        <Tab label="Manage Category" />
      </Tabs>

      {/* Conditionally render the Filters Section only if view is neither "Create Task" (3) nor "Create Category" (4) */}
      {view !== 0 && view !== 4 && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={filters.status} onChange={handleFilterChange}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={filters.category} onChange={handleCategoryChange}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} disabled={!filters.category}>
            <InputLabel>Subcategory</InputLabel>
            <Select name="subcategory" value={filters.subcategory} onChange={handleFilterChange}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {subcategories.map((subcat, index) => (
                <MenuItem key={index} value={subcat}>
                  {subcat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dueDateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
          />

          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.dueDateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
          />

          <Button variant="contained" color="primary" onClick={fetchTasks}>
            Apply Filters
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>

          <FormControlLabel
            control={<Switch checked={showOnlyOverdue} onChange={toggleOverdueTasks} />}
            label="Show Only Overdue Tasks"
          />
        </Box>
      )}

      {/* Render View Based on Selection */}
      <Box sx={{ mt: 3 }}>
        {view === 3 && <TaskListView tasks={tasks} showOnlyOverdue={showOnlyOverdue} onUpdateTasks={handleUpdateTasks} />}
        {view === 1 && <TaskStatusView tasks={tasks} showOnlyOverdue={showOnlyOverdue} />}
        {view === 2 && <TaskCalendarView tasks={tasks} showOnlyOverdue={showOnlyOverdue} />}
        {view === 0 && <TaskForm onTaskCreated={fetchTasks} />} {/* Pass fetchTasks to TaskForm */}
        {view === 4 && <CategoryForm />}
      </Box>
    </Box>
  );
};

export default TaskListPage;

import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Badge,
} from '@mui/material';
import TaskDetailDialog from './TaskDetailDialog';

const statusColors = {
  'To Do': '#ff9800',
  'In Progress': '#2196f3',
  'Completed': '#4caf50',
};

const TaskListView = ({ tasks, showOnlyOverdue, onUpdateTasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(5);

  // Open Task Dialog
  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  // Close Task Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task._id !== taskId);
    onUpdateTasks(updatedTasks);
  };

  // Edit Task
  const handleEditTask = (updatedTask) => {
    const updatedTasks = tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task));
    onUpdateTasks(updatedTasks);
  };

  // Filter and Search Logic
  const filteredTasks = tasks
    .filter(
      (task) =>
        (!showOnlyOverdue || (new Date(task.deadline) < new Date() && task.status !== 'Completed')) &&
        (!filterStatus || task.status === filterStatus) &&
        (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  // Handle Pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <Box>
      {/* Search and Filter Section */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          label="Search Tasks"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tasks Per Page</InputLabel>
          <Select
            value={tasksPerPage}
            onChange={(e) => {
              setTasksPerPage(parseInt(e.target.value, 10));
              setCurrentPage(1); // Reset to the first page when tasks per page changes
            }}
            label="Tasks Per Page"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Task Counter */}
      <Box mb={2}>
        <Typography variant="subtitle1">
          Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}.
        </Typography>
      </Box>

      {/* Task List */}
      <List>
        {paginatedTasks.map((task) => (
          <React.Fragment key={task._id}>
            <ListItem onClick={() => handleOpenDialog(task)} sx={{ cursor: 'pointer' }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {task.title}
                    </Typography>
                    {new Date(task.deadline) < new Date() && task.status !== 'Completed' && (
                      <Badge badgeContent="Overdue" color="error" sx={{ ml: 2 }} />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" gutterBottom>{task.description}</Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Assigned to: {task.assignedTo?.name || 'Unassigned'}
                        
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mx: 2, whiteSpace: 'nowrap' }}
                      >
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: statusColors[task.status],
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: '5px',
                          fontSize: '0.875rem',
                          minWidth: '80px',
                          textAlign: 'center',
                        }}
                      >
                        {task.status}
                      </Box>
                    </Box>
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={openDialog}
          onClose={handleCloseDialog}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      )}
    </Box>
  );
};

export default TaskListView;

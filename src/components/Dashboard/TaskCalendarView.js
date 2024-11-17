import React, { useState, useEffect } from 'react';
import { Box, Dialog, Typography, Paper, Tooltip, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskDetailDialog from './TaskDetailDialog';

// Setup moment localizer
const localizer = momentLocalizer(moment);

// Define color codes for statuses
const statusColors = {
  'To Do': '#ffecb3', // light yellow
  'In Progress': '#c8e6c9', // light green
  'Completed': '#bbdefb', // light blue
};

const TaskCalendarView = ({ tasks, onUpdateTasks }) => {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    // Map tasks to calendar events
    const filteredTasks = tasks
      .filter((task) => (filterStatus ? task.status === filterStatus : true))
      .filter((task) => (filterUser ? task.assignedTo?.name === filterUser : true));

    const mappedEvents = filteredTasks.map((task) => ({
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      task, // Embed full task data for easy access on click
    }));

    setEvents(mappedEvents);
  }, [tasks, filterStatus, filterUser]);

  // Handle task click to open Task Detail Dialog
  const handleSelectEvent = (event) => {
    setSelectedTask(event.task);
  };

  // Close Task Detail Dialog
  const handleCloseDialog = () => {
    setSelectedTask(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={3}>
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
          <InputLabel>Assigned User</InputLabel>
          <Select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            label="Assigned User"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {[...new Set(tasks.map((task) => task.assignedTo?.name).filter(Boolean))].map((user) => (
              <MenuItem key={user} value={user}>
                {user}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Legends for Task Status */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {Object.keys(statusColors).map((status) => (
          <Chip
            key={status}
            label={status}
            sx={{
              bgcolor: statusColors[status],
              color: '#333',
              fontWeight: 'bold',
            }}
          />
        ))}
      </Box>

      {/* Calendar Component */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        style={{
          height: '80vh',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f4f6f8',
          padding: '1rem',
        }}
        components={{
          event: ({ event }) => (
            <Tooltip
              title={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{event.task.title}</Typography>
                  <Typography variant="body2">Description: {event.task.description}</Typography>
                  <Typography variant="body2">Assigned to: {event.task.assignedTo?.name || 'Unassigned'}</Typography>
                  <Typography variant="body2">Deadline: {new Date(event.task.deadline).toLocaleDateString()}</Typography>
                </Box>
              }
              arrow
            >
              <Paper
                sx={{
                  bgcolor: statusColors[event.task.status] || '#e0e0e0',
                  padding: '4px 8px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { boxShadow: 2, bgcolor: '#e3f2fd' },
                }}
                onClick={() => handleSelectEvent(event)}
              >
                {new Date(event.task.deadline) < new Date() && event.task.status !== 'Completed' && (
                  <WarningIcon color="error" sx={{ fontSize: '1rem', mr: 1 }} />
                )}
                <Typography variant="body2" sx={{ fontSize: '0.85em', color: '#0d47a1', fontWeight: 'bold' }}>
                  {event.title}
                </Typography>
              </Paper>
            </Tooltip>
          ),
        }}
      />

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={handleCloseDialog}
          onDelete={(taskId) => {
            setEvents((prev) => prev.filter((event) => event.task._id !== taskId));
            handleCloseDialog();
          }}
          onEdit={(updatedTask) => {
            setEvents((prev) =>
              prev.map((event) =>
                event.task._id === updatedTask._id ? { ...event, task: updatedTask } : event
              )
            );
            handleCloseDialog();
          }}
        />
      )}
    </Box>
  );
};

export default TaskCalendarView;

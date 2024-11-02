import React, { useState } from 'react';
import { List, ListItem, ListItemText, Divider, Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TaskDetailDialog from './TaskDetailDialog';

const statusColors = {
  'To Do': '#ff9800',
  'In Progress': '#2196f3',
  'Completed': '#4caf50',
};

const TaskListView = ({ tasks, showOnlyOverdue, onUpdateTasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task._id !== taskId);
    onUpdateTasks(updatedTasks);
  };

  const handleEditTask = (updatedTask) => {
    const updatedTasks = tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task));
    onUpdateTasks(updatedTasks);
  };

  return (
    <>
      <List>
        {tasks
          .filter((task) => !showOnlyOverdue || (new Date(task.deadline) < new Date() && task.status !== 'Completed'))
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .map((task) => (
            <React.Fragment key={task._id}>
              <ListItem onClick={() => handleOpenDialog(task)} sx={{ cursor: 'pointer' }}>
                <ListItemText
                  primary={<Typography variant="h6">{task.title}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2" gutterBottom>{task.description}</Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">Assigned to: {task.assignedTo?.name || 'Unassigned'}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mx: 2 }}>
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </Typography>
                        {new Date(task.deadline) < new Date() && task.status !== 'Completed' && (
                          <WarningIcon color="error" sx={{ ml: 1 }} />
                        )}
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
                            marginLeft: 'auto',
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

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={openDialog}
          onClose={handleCloseDialog}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      )}
    </>
  );
};

export default TaskListView;

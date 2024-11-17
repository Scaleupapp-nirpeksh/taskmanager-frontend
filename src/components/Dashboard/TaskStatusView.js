import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tooltip, Button } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../services/api';
import TaskDetailDialog from './TaskDetailDialog';

const TaskStatusView = ({ tasks, showOnlyOverdue, onUpdateTasks }) => {
  const [taskColumns, setTaskColumns] = useState({
    'To Do': [],
    'In Progress': [],
    'Completed': [],
  });
  const [showOldCompletedTasks, setShowOldCompletedTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Helper function to sort tasks by due date
  const sortTasksByDueDate = (tasks) => {
    return tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  // Group and process tasks
  useEffect(() => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const groupedTasks = tasks.reduce(
      (acc, task) => {
        if (task.status === 'Completed' && new Date(task.deadline) < oneMonthAgo) {
          if (showOldCompletedTasks) {
            acc['Completed'].push(task); // Show old tasks if toggled
          }
        } else {
          acc[task.status].push(task);
        }
        return acc;
      },
      { 'To Do': [], 'In Progress': [], 'Completed': [] }
    );

    // Sort tasks in each column by due date
    Object.keys(groupedTasks).forEach((status) => {
      groupedTasks[status] = sortTasksByDueDate(groupedTasks[status]);
    });

    setTaskColumns(groupedTasks);
  }, [tasks, showOldCompletedTasks]);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn !== destColumn) {
      const sourceTasks = Array.from(taskColumns[sourceColumn]);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.status = destColumn;

      const destinationTasks = Array.from(taskColumns[destColumn]);
      destinationTasks.splice(destination.index, 0, movedTask);

      setTaskColumns((prev) => ({
        ...prev,
        [sourceColumn]: sourceTasks,
        [destColumn]: destinationTasks,
      }));

      try {
        const token = localStorage.getItem('token');
        await api.put(`/tasks/${movedTask._id}`, { status: destColumn }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onUpdateTasks();
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDialog = () => {
    setSelectedTask(null);
  };

  const getColumnStyles = (status) => {
    switch (status) {
      case 'To Do':
        return { bgcolor: '#ffebee', borderColor: '#f44336', color: '#b71c1c' };
      case 'In Progress':
        return { bgcolor: '#e3f2fd', borderColor: '#2196f3', color: '#0d47a1' };
      case 'Completed':
        return { bgcolor: '#e8f5e9', borderColor: '#4caf50', color: '#1b5e20' };
      default:
        return {};
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'space-between', mt: 4 }}>
        {['To Do', 'In Progress', 'Completed'].map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  ...getColumnStyles(status),
                  flex: 1,
                  minHeight: '80vh',
                  p: 2,
                  boxShadow: 3,
                  borderRadius: 2,
                  border: 1,
                  borderColor: getColumnStyles(status).borderColor,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: getColumnStyles(status).color,
                    textTransform: 'uppercase',
                  }}
                >
                  {status}
                </Typography>
                {taskColumns[status].map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleTaskClick(task)}
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: '#fff',
                          borderRadius: 1,
                          boxShadow: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          border: `2px solid ${getColumnStyles(status).borderColor}`,
                          '&:hover': {
                            boxShadow: 4,
                            bgcolor: '#fafafa',
                          },
                        }}
                      >
                        {new Date(task.deadline) < new Date() && task.status !== 'Completed' && (
                          <Tooltip title="Overdue">
                            <WarningIcon color="error" sx={{ mr: 1, position: 'absolute', top: 8, right: 8 }} />
                          </Tooltip>
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {task.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            Assigned to: <strong>{task.assignedTo?.name || 'Unassigned'}</strong>
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {status === 'Completed' && (
                  <Button
                    onClick={() => setShowOldCompletedTasks(!showOldCompletedTasks)}
                    sx={{ mt: 2, color: getColumnStyles('Completed').color }}
                  >
                    {showOldCompletedTasks ? 'Collapse Old Tasks' : 'Show Old Tasks'}
                  </Button>
                )}
                {provided.placeholder}
              </Paper>
            )}
          </Droppable>
        ))}
      </Box>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={handleCloseDialog}
          onDelete={(taskId) => {
            setTaskColumns((prev) => ({
              ...prev,
              [selectedTask.status]: prev[selectedTask.status].filter((t) => t._id !== taskId),
            }));
            handleCloseDialog();
          }}
          onEdit={(updatedTask) => {
            setTaskColumns((prev) => ({
              ...prev,
              [updatedTask.status]: prev[updatedTask.status].map((t) =>
                t._id === updatedTask._id ? updatedTask : t
              ),
            }));
            handleCloseDialog();
          }}
        />
      )}
    </DragDropContext>
  );
};

export default TaskStatusView;

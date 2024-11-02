import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../services/api';
import TaskDetailDialog from './TaskDetailDialog'; // Import the TaskDetailDialog component

const TaskStatusView = ({ tasks, showOnlyOverdue, onUpdateTasks }) => {
  const [taskColumns, setTaskColumns] = useState({
    'To Do': [],
    'In Progress': [],
    'Completed': [],
  });
  const [selectedTask, setSelectedTask] = useState(null); // State to hold selected task for dialog

  useEffect(() => {
    const groupedTasks = tasks.reduce(
      (acc, task) => {
        acc[task.status] = [...(acc[task.status] || []), task];
        return acc;
      },
      { 'To Do': [], 'In Progress': [], 'Completed': [] }
    );
    setTaskColumns(groupedTasks);
  }, [tasks]);

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
                  flex: 1,
                  minHeight: '80vh',
                  p: 2,
                  bgcolor: '#f4f5f7',
                  boxShadow: 3,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}>
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
                          boxShadow: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
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

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { Delete, Save, NoteAdd, Cancel } from '@mui/icons-material';
import api from '../../services/api';

const TaskDetailDialog = ({ task, open, onClose, onDelete, onEdit }) => {
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.deadline);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?._id || '');
  const [notes, setNotes] = useState(task.notes || []);
  const [newNote, setNewNote] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedTask = await api.put(
        `/tasks/${task._id}`,
        { status, deadline: dueDate, assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onEdit(updatedTask.data);
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(task._id);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/tasks/${task._id}/notes`,
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, response.data]);
      setNewNote('');
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={{ p: 2 }}>
      <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd' }}>
        {task.title}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#fafafa' }}>
        <Box sx={{ my: 2, borderRadius: 2, p: 2, bgcolor: 'white', boxShadow: 1 }}>
          <Typography variant="body1"><strong>Category:</strong> {task.category?.categoryName}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}><strong>Subcategory:</strong> {task.subcategory}</Typography>
          <Typography sx={{ mb: 2, color: '#666' }}>Description: {task.description}</Typography>

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} sx={{ bgcolor: '#f5f5f5' }}>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            value={dueDate.slice(0, 10)}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            sx={{ mt: 2, bgcolor: '#f5f5f5' }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} sx={{ bgcolor: '#f5f5f5' }}>
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary">Notes</Typography>
            {notes.map((note, index) => (
              <Box
                key={index}
                sx={{
                  my: 1,
                  p: 2,
                  bgcolor: '#f9f9f9',
                  borderRadius: '8px',
                  borderLeft: '4px solid #3f51b5',
                }}
              >
                <Typography variant="body2">{note.content}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Added by {note.createdByName} on {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <TextField
                label="Add a Note"
                multiline
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                fullWidth
                sx={{ mr: 1, bgcolor: '#f5f5f5' }}
              />
              <IconButton color="primary" onClick={handleAddNote} sx={{ p: 1.5 }}>
                <NoteAdd />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
        <IconButton onClick={handleDelete} sx={{ color: '#e57373' }}>
          <Delete />
        </IconButton>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <Cancel />
        </IconButton>
        <IconButton onClick={handleSave} sx={{ color: '#64b5f6' }}>
          <Save />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog;

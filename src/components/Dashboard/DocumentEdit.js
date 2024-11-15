// src/pages/DocumentEdit.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Delete } from '@mui/icons-material';
import api from '../../services/api'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const DocumentEdit = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = Boolean(id);

  useEffect(() => {
    fetchAllUsers();
    if (isEditing) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    }
  };

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      const { title, content, collaborators, attachments } = response.data;
      setTitle(title);
      setContent(content);
      setCollaborators(
        collaborators.map((collab) => ({
          user: collab.user._id,
          name: collab.user.name,
          permission: collab.permission,
        }))
      );
      setExistingAttachments(attachments);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      enqueueSnackbar('Failed to fetch document', { variant: 'error' });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    collaborators.forEach((collab, idx) => {
      formData.append(`collaborators[${idx}][user]`, collab.user);
      formData.append(`collaborators[${idx}][permission]`, collab.permission);
    });
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      if (isEditing) {
        await api.put(`/documents/${id}`, formData);
        enqueueSnackbar('Document updated successfully', { variant: 'success' });
      } else {
        await api.post('/documents', formData);
        enqueueSnackbar('Document created successfully', { variant: 'success' });
      }
      navigate('/documents');
    } catch (error) {
      console.error('Failed to save document:', error);
      enqueueSnackbar('Failed to save document', { variant: 'error' });
    }
  };

  const handleFileChange = (e) => {
    setAttachments([...attachments, ...e.target.files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  const handleRemoveExistingAttachment = async (attachment) => {
    if (!window.confirm('Are you sure you want to remove this attachment?')) return;

    try {
      await api.delete(`/documents/${id}/attachments/${attachment.key}`);
      setExistingAttachments(
        existingAttachments.filter((att) => att.key !== attachment.key)
      );
      enqueueSnackbar('Attachment removed', { variant: 'success' });
    } catch (error) {
      console.error('Failed to remove attachment:', error);
      enqueueSnackbar('Failed to remove attachment', { variant: 'error' });
    }
  };

  const handleCollaboratorPermissionChange = (index, permission) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators[index].permission = permission;
    setCollaborators(updatedCollaborators);
  };

  const handleRemoveCollaborator = (index) => {
    setCollaborators(collaborators.filter((_, idx) => idx !== index));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Document' : 'Create New Document'}
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Content
        </Typography>
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={(event, editor) => {
            setContent(editor.getData());
          }}
          config={{
            ckfinder: {
              uploadUrl: `${api.defaults.baseURL}/upload/editor-image`,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          }}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Collaborators
        </Typography>
        <Autocomplete
          multiple
          options={allUsers}
          getOptionLabel={(option) => option.name}
          value={collaborators.map((collab) => ({
            _id: collab.user,
            name: collab.name,
          }))}
          onChange={(event, newValue) => {
            const existingIds = collaborators.map((collab) => collab.user);
            const newCollaborators = newValue
              .filter((user) => !existingIds.includes(user._id))
              .map((user) => ({
                user: user._id,
                name: user.name,
                permission: 'write', // Default permission
              }));
            setCollaborators([...collaborators, ...newCollaborators]);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Add Collaborators" placeholder="Search users" />
          )}
          sx={{ mt: 1 }}
        />

        {/* Collaborators Table */}
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Permission</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collaborators.map((collab, idx) => (
              <TableRow key={idx}>
                <TableCell>{collab.name}</TableCell>
                <TableCell>
                  <Select
                    value={collab.permission}
                    onChange={(e) =>
                      handleCollaboratorPermissionChange(idx, e.target.value)
                    }
                  >
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="write">Write</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveCollaborator(idx)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {collaborators.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No collaborators added.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Attachments
        </Typography>
        <Button variant="contained" component="label" sx={{ mt: 1 }}>
          Upload Files
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>
        <Box sx={{ mt: 1 }}>
          {/* Existing Attachments */}
          {existingAttachments.map((attachment, idx) => (
            <Chip
              key={idx}
              label={attachment.filename}
              onDelete={() => handleRemoveExistingAttachment(attachment)}
              sx={{ mr: 1, mt: 1 }}
            />
          ))}
          {/* New Attachments */}
          {attachments.map((file, idx) => (
            <Chip
              key={idx}
              label={file.name}
              onDelete={() => handleRemoveAttachment(idx)}
              sx={{ mr: 1, mt: 1 }}
            />
          ))}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 3 }}
        >
          Save Document
        </Button>
      </Paper>
    </Box>
  );
};

export default DocumentEdit;

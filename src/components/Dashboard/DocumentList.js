// src/pages/DocumentList.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import api from '../../services/api'; 
import { useSnackbar } from 'notistack';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      enqueueSnackbar('Failed to fetch documents', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    // Optimistically update UI
    const previousDocuments = [...documents];
    setDocuments(documents.filter((doc) => doc._id !== id));

    try {
      await api.delete(`/documents/${id}`);
      enqueueSnackbar('Document deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to delete document:', error);
      enqueueSnackbar('Failed to delete document', { variant: 'error' });
      // Revert UI on error
      setDocuments(previousDocuments);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Documents</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/documents/new"
        >
          Create New Document
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>
                <strong>Title</strong>
              </TableCell>
              <TableCell>
                <strong>Owner</strong>
              </TableCell>
              <TableCell>
                <strong>Last Modified</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc._id}>
                <TableCell>
                  <Link
                    to={`/documents/${doc._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    {doc.title}
                  </Link>
                </TableCell>
                <TableCell>{doc.owner.name}</TableCell>
                <TableCell>{new Date(doc.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton component={Link} to={`/documents/${doc._id}/edit`}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(doc._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentList;

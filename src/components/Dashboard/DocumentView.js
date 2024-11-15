// src/pages/DocumentView.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Button,
  CircularProgress,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api'; 
import { useSnackbar } from 'notistack';

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      enqueueSnackbar('Failed to fetch document', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" align="center">
          Document not found or you do not have access.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {document.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        By {document.owner.name} on {new Date(document.updatedAt).toLocaleString()}
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <div dangerouslySetInnerHTML={{ __html: document.content }} />
      </Paper>
      {document.attachments && document.attachments.length > 0 && (
        <>
          <Typography variant="h6">Attachments</Typography>
          <List>
            {document.attachments.map((attachment, idx) => (
              <ListItem key={idx}>
                <ListItemText>
                  <MuiLink href={attachment.url} target="_blank" rel="noopener noreferrer">
                    {attachment.filename}
                  </MuiLink>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/documents/${id}/edit`}
      >
        Edit Document
      </Button>
    </Box>
  );
};

export default DocumentView;

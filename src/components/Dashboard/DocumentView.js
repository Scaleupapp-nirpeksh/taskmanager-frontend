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
  TextField,
  IconButton,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import SendIcon from '@mui/icons-material/Send';

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
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
      setLikesCount(response.data.likes.length);
      setHasLiked(response.data.likes.includes(localStorage.getItem('userId')));
    } catch (error) {
      console.error('Failed to fetch document:', error);
      enqueueSnackbar('Failed to fetch document', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (hasLiked) {
        await api.post(`/documents/${id}/unlike`);
        setLikesCount((prev) => prev - 1);
        setHasLiked(false);
      } else {
        await api.post(`/documents/${id}/like`);
        setLikesCount((prev) => prev + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      enqueueSnackbar('Failed to update like status', { variant: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      enqueueSnackbar('Comment cannot be empty', { variant: 'warning' });
      return;
    }

    try {
      const response = await api.post(`/documents/${id}/comments`, {
        content: newComment,
      });
      // Update the comments in the document
      setDocument((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data.comment],
      }));
      setNewComment('');
      enqueueSnackbar('Comment added', { variant: 'success' });
    } catch (error) {
      console.error('Failed to add comment:', error);
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
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
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={handleLike} color="primary">
          {hasLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
        </IconButton>
        <Typography variant="body1">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</Typography>
      </Box>
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
        sx={{ mt: 2 }}
      >
        Edit Document
      </Button>

      {/* Comments Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Comments
        </Typography>
        {document.comments && document.comments.length > 0 ? (
          <List>
            {document.comments.map((comment, idx) => (
              <ListItem key={idx} alignItems="flex-start">
                <ListItemText
                  primary={comment.user.name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                      {' — '}
                      {comment.content}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No comments yet.</Typography>
        )}

        {/* Add Comment */}
        <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <IconButton color="primary" onClick={handleAddComment}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentView;

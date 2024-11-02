import React, { useEffect, useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../services/api';

const EquitySplitForm = ({ setEquitySplit }) => {
  const [founders, setFounders] = useState([]);
  const [equityValues, setEquityValues] = useState({});
  const [autoSplit, setAutoSplit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchFoundersAndEquity = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch founders and their existing equity split values
        const response = await api.get('/api/equity-split', { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);

        // Set founders list and initialize equity values
        const fetchedFounders = response.data.founders.map(founder => ({
          id: founder.userId._id,         // Use `userId._id` as unique identifier
          name: founder.userId.name,      // Use `userId.name` for the name
          equity: founder.equity
        }));
        setFounders(fetchedFounders);

        // Initialize equity values from the response
        const initialEquity = fetchedFounders.reduce((acc, founder) => {
          acc[founder.id] = founder.equity || 0;
          return acc;
        }, {});

        setEquityValues(initialEquity);
      } catch (err) {
        setError('Failed to fetch founders and equity values.');
      }
    };

    fetchFoundersAndEquity();
  }, []);

  const handleAutoSplitChange = (e) => {
    setAutoSplit(e.target.checked);
    if (e.target.checked) {
      const splitValue = (100 / founders.length).toFixed(2);
      const autoEquity = founders.reduce((acc, founder) => ({ ...acc, [founder.id]: splitValue }), {});
      setEquityValues(autoEquity);
    }
  };

  const handleEquityChange = (userId, value) => {
    setEquityValues({ ...equityValues, [userId]: parseFloat(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const totalEquity = Object.values(equityValues).reduce((acc, val) => acc + parseFloat(val), 0);
    if (totalEquity !== 100) {
      setError('Total equity must equal 100%.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formattedEquity = founders.map(founder => ({
        userId: founder.id,  // Use `id` which is `userId._id` from API response
        equity: parseFloat(equityValues[founder.id]),
      }));

      const response = await api.post('/api/equity-split', { founders: formattedEquity }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEquitySplit(response.data.equitySplit); // Update parent component state
      setSuccess('Equity split saved successfully!');
    } catch (err) {
      setError('Failed to save equity split.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Add or Edit Equity Split</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormControlLabel
        control={<Checkbox checked={autoSplit} onChange={handleAutoSplitChange} />}
        label="Auto-split equally"
      />

      {founders.map((founder) => (
        <TextField
          key={founder.id}
          label={founder.name}
          type="number"
          variant="outlined"
          fullWidth
          required
          value={equityValues[founder.id] || ''}
          onChange={(e) => handleEquityChange(founder.id, e.target.value)}
          sx={{ mt: 2 }}
          disabled={autoSplit}
        />
      ))}

      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
        Save Equity Split
      </Button>

      
    </Box>
  );
};

export default EquitySplitForm;

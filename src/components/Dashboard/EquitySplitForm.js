import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import api from '../../services/api';

const EquitySplitForm = ({ setEquitySplit }) => {
  const [founders, setFounders] = useState([]);
  const [equityValues, setEquityValues] = useState({});
  const [autoSplit, setAutoSplit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch founders and equity data
  useEffect(() => {
    const fetchFoundersAndEquity = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/equity-split', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { equitySplit, users } = response.data;

        if (equitySplit) {
          const fetchedFounders = equitySplit.map((founder) => ({
            id: founder.userId._id,
            name: founder.userId.name,
            equity: founder.equity,
          }));
          setFounders(fetchedFounders);

          const initialEquity = fetchedFounders.reduce((acc, founder) => {
            acc[founder.id] = founder.equity || 0;
            return acc;
          }, {});
          setEquityValues(initialEquity);
        } else if (users) {
          const fetchedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            equity: 0,
          }));
          setFounders(fetchedUsers);

          const initialEquity = fetchedUsers.reduce((acc, user) => {
            acc[user.id] = 0;
            return acc;
          }, {});
          setEquityValues(initialEquity);
        }
      } catch (err) {
        setError('Failed to fetch founders and equity values.');
      }
    };

    fetchFoundersAndEquity();
  }, []);

  // Auto-split equity equally among founders
  const handleAutoSplitChange = (e) => {
    setAutoSplit(e.target.checked);
    if (e.target.checked) {
      const splitValue = (100 / founders.length).toFixed(2);
      const autoEquity = founders.reduce((acc, founder) => {
        acc[founder.id] = parseFloat(splitValue);
        return acc;
      }, {});
      setEquityValues(autoEquity);
    }
  };

  // Update individual equity value
  const handleEquityChange = (userId, value) => {
    setEquityValues({ ...equityValues, [userId]: parseFloat(value) });
  };

  // Submit equity data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const totalEquity = Object.values(equityValues).reduce((acc, val) => acc + parseFloat(val), 0);

    if (totalEquity !== 100) {
      setError(`Total equity must equal 100%. Current total is ${totalEquity.toFixed(2)}%.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formattedEquity = founders.map((founder) => ({
        userId: founder.id,
        equity: parseFloat(equityValues[founder.id]),
      }));

      const response = await api.post(
        '/api/equity-split',
        { founders: formattedEquity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEquitySplit(response.data.equitySplit);
      setSuccess('Equity split saved successfully!');
    } catch (err) {
      setError('Failed to save equity split.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Equity Split Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormControlLabel
        control={<Checkbox checked={autoSplit} onChange={handleAutoSplitChange} />}
        label="Auto-split equity equally"
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Founder Name</strong></TableCell>
              <TableCell align="center"><strong>Equity (%)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {founders.map((founder) => (
              <TableRow key={founder.id}>
                <TableCell>{founder.name}</TableCell>
                <TableCell align="center">
                  <TextField
                    type="number"
                    variant="outlined"
                    fullWidth
                    required
                    value={equityValues[founder.id] || ''}
                    onChange={(e) => handleEquityChange(founder.id, e.target.value)}
                    disabled={autoSplit}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
        Save Equity Split
      </Button>
    </Box>
  );
};

export default EquitySplitForm;

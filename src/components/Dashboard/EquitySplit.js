import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// import other necessary components from MUI

const EquitySplit = () => {
  // Same state and handlers as before
  const [founders, setFounders] = useState([{ name: '', equity: 0 }]);
  const [equalSplit, setEqualSplit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch existing equity split
    const fetchEquitySplit = async () => {
      try {
        const response = await api.get('/api/equity-split', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.data && response.data.founders) {
          setFounders(response.data.founders);
        }
      } catch (error) {
        console.error('Failed to fetch equity split:', error);
      }
    };

    fetchEquitySplit();
  }, []);

  const handleSave = async () => {
    const totalEquity = founders.reduce((total, founder) => total + parseFloat(founder.equity || 0), 0);

    if (totalEquity !== 100) {
      setError(`Total equity must equal 100%. Current total is ${totalEquity.toFixed(2)}%.`);
      setSuccess('');
    } else {
      try {
        const response = await api.post('/api/equity-split', { founders }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSuccess('Equity split saved successfully!');
        setError('');
      } catch (error) {
        setError('Failed to save equity split');
      }
    }
  };

  // Rest of the component (rendering form, handlers, etc.)
};

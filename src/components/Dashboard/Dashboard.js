// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import EquitySplitForm from './EquitySplitForm';
import ExpensesTab from './ExpensesTab'; // Import ExpensesTab component
import api from '../../services/api';
import TaskTab from './TaskTab'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [equitySplit, setEquitySplit] = useState(null);

  useEffect(() => {
    const fetchEquitySplit = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/equity-split', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEquitySplit(response.data);
      } catch {
        setEquitySplit(null);
      }
    };

    fetchEquitySplit();
  }, []);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Equity Split" />
        <Tab label="Expenses" />
        <Tab label="Tasks" />
        
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <EquitySplitForm equitySplit={equitySplit} setEquitySplit={setEquitySplit} />}
        {activeTab === 1 && <ExpensesTab />} 
        {activeTab === 2 && <TaskTab />}
      </Box>
    </Container>
  );
};

export default Dashboard;

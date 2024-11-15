// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState, Suspense } from 'react';
import { Container, Tabs, Tab, Box, CircularProgress } from '@mui/material';
import EquitySplitForm from './EquitySplitForm';
import ExpensesTab from './ExpensesTab';
import api from '../../services/api';
import TaskListPage from './TaskListPage';
import DashboardTab from './DashboardTab';

// Lazy load DocumentList
const DocumentList = React.lazy(() => import('./DocumentList'));

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [equitySplit, setEquitySplit] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);

  useEffect(() => {
    const fetchEquitySplit = async () => {
      try {
        const response = await api.get('/api/equity-split');
        setEquitySplit(response.data);
      } catch (error) {
        console.error('Error fetching equity split:', error);
        setEquitySplit(null);
      }
    };

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setDashboardData(null);
      } finally {
        setLoadingDashboardData(false);
      }
    };

    // Ensure the token is available before fetching data
    const token = localStorage.getItem('token');
    if (token) {
      fetchEquitySplit();
      fetchDashboardData();
    } else {
      // Wait for the token to be set
      const intervalId = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
          clearInterval(intervalId);
          fetchEquitySplit();
          fetchDashboardData();
        }
      }, 100);
    }
  }, []);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Dashboard Tabs"
      >
        <Tab label="Dashboard" />
        <Tab label="Equity Split" />
        <Tab label="Expenses" />
        <Tab label="Tasks" />
        <Tab label="Documentation" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <DashboardTab
            dashboardData={dashboardData}
            loading={loadingDashboardData}
          />
        )}
        {activeTab === 1 && (
          <EquitySplitForm
            equitySplit={equitySplit}
            setEquitySplit={setEquitySplit}
          />
        )}
        {activeTab === 2 && <ExpensesTab />}
        {activeTab === 3 && <TaskListPage />}
        {activeTab === 4 && (
          <Suspense
            fallback={
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            }
          >
            <DocumentList />
          </Suspense>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;

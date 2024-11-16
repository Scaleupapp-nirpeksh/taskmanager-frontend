import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Alert,
  List,          // Added
  ListItem,      // Added
  ListItemText,  // Added
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import TaskDetailDialog from './TaskDetailDialog';

const DashboardTab = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData();
    } else {
      const intervalId = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
          clearInterval(intervalId);
          fetchDashboardData();
        }
      }, 100);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!dashboardData) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" align="center">
          Failed to load dashboard data.
        </Typography>
      </Box>
    );
  }

  const {
    equitySplit,
    taskStats,
    tasks,
    investmentDetails,
    totalInvestment,
    documents,
  } = dashboardData;

  // Prepare data for Pie chart
  const pieData = {
    labels: investmentDetails.map(
      (item) => `${item.month}-${item.year}`
    ),
    datasets: [
      {
        data: investmentDetails.map((item) => item.actualContribution),
        backgroundColor: investmentDetails.map(
          (_, idx) =>
            `rgba(${(idx * 50) % 255}, ${(idx * 80) % 255}, ${
              (idx * 110) % 255
            }, 0.6)`
        ),
      },
    ],
  };

  // Updated overdue tasks logic
  const now = new Date();
  const overdueTasks = tasks.filter(
    (task) => task.deadline && new Date(task.deadline) < now && task.status !== 'Completed'
  );

  return (
    <Box sx={{ mt: 3, px: 2 }}>
      {/* Equity Split Information */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Equity Split</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {equitySplit !== 'Not part of any equity split' ? (
            <Box>
              <Typography variant="body1">
                Your Equity Share: <strong>{equitySplit.equity}%</strong>
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1">
              You are not part of any equity split.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Task Statistics */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Task Statistics</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[
              { label: 'Total Tasks', value: taskStats.totalTasks },
              { label: 'Overdue', value: taskStats.totalOverdue },
              { label: 'In Progress', value: taskStats.totalInProgress },
              { label: 'Completed', value: taskStats.totalCompleted },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{stat.label}</Typography>
                  <Typography variant="h4" color="primary">
                    {stat.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Task List */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Your Tasks</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {overdueTasks.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              You have {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? 's' : ''}!
            </Alert>
          )}
          {tasks.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Deadline</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => {
                    // Inside your TableRow rendering for tasks
                    const isOverdue =
                    task.deadline && new Date(task.deadline) < now && task.status !== 'Completed';

                    return (
                      <TableRow
                        key={task._id}
                        sx={{
                          backgroundColor: isOverdue ? '#ffebee' : 'inherit',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.category.categoryName}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={
                              task.status === 'Completed'
                                ? 'success'
                                : task.status === 'In Progress'
                                ? 'primary'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(task.deadline), 'dd-MM-yyyy')}
                          {isOverdue && (
                            <Chip
                              label="Overdue"
                              color="error"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No tasks assigned to you.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Investment Details */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Investment Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Total Investment */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Total Investment</Typography>
                <Typography variant="h4" color="primary">
                  ₹{totalInvestment.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            {/* Pie Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Monthly Contributions</Typography>
                <Pie data={pieData} options={{ responsive: true }} />
              </Paper>
            </Grid>
          </Grid>

          {/* Monthly Investment Details */}
          {investmentDetails.map((detail, idx) => (
            <Card key={idx} sx={{ mt: 3, backgroundColor: '#f9f9f9' }}>
              <CardContent>
                <Typography variant="h6">
                  {detail.month}-{detail.year}
                </Typography>
                <Typography>
                  Expected Contribution: ₹{detail.expectedContribution.toFixed(2)}
                </Typography>
                <Typography>
                  Actual Contribution: ₹{detail.actualContribution.toFixed(2)}
                </Typography>
                <Typography>
                  Disparity: ₹{detail.disparity.toFixed(2)} ({detail.status})
                </Typography>

                {/* Detailed Expenses */}
                {detail.detailedExpenses.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Detailed Expenses
                    </Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell>
                              <strong>Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Amount (₹)</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Date</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Category</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Subcategory</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detail.detailedExpenses.map((expense, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{expense.name}</TableCell>
                              <TableCell>{expense.amount}</TableCell>
                              <TableCell>
                                {format(new Date(expense.date), 'dd-MM-yyyy')}
                              </TableCell>
                              <TableCell>{expense.category}</TableCell>
                              <TableCell>{expense.subcategory}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </AccordionDetails>
      </Accordion>

          {/* Documents Section */}
          <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Your Documents</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {documents && documents.length > 0 ? (
            <List>
              {documents.map((doc) => (
                <ListItem key={doc._id}>
                  <ListItemText
                    primary={
                      <Typography
                        component={Link}
                        to={`/documents/${doc._id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        {doc.title}
                      </Typography>
                    }
                    secondary={`Last updated: ${new Date(
                      doc.updatedAt
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No documents found.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onDelete={(taskId) => {
            // Update tasks in dashboardData
            setDashboardData((prevData) => ({
              ...prevData,
              tasks: prevData.tasks.filter((task) => task._id !== taskId),
              taskStats: {
                ...prevData.taskStats,
                totalTasks: prevData.taskStats.totalTasks - 1,
                // Adjust other stats if necessary
              },
            }));
            setSelectedTask(null);
          }}
          onEdit={(updatedTask) => {
            // Update tasks in dashboardData
            setDashboardData((prevData) => ({
              ...prevData,
              tasks: prevData.tasks.map((task) =>
                task._id === updatedTask._id ? updatedTask : task
              ),
              // Adjust taskStats if status changed
            }));
            setSelectedTask(null);
          }}
        />
      )}
    </Box>
  );
};

export default DashboardTab;

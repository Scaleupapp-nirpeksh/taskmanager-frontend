import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Pagination,
  Grid,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    assigned_to: '',
    category: '',
    subcategory: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], datasets: [] });
  const [totalSpend, setTotalSpend] = useState(0);
  const [burnRate, setBurnRate] = useState(0);
  const [monthlyParities, setMonthlyParities] = useState([]);
  const [projections, setProjections] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newProjection, setNewProjection] = useState({ name: '', durationMonths: '', expenses: [] });
  const [selectedProjection, setSelectedProjection] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchUsers();
    fetchMonthlySummary();
    fetchAllMonthlyParities();
    fetchProjections();
  }, [filters, page]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters, page, limit: 10 },
      });

      const { expenses, totalPages } = response.data;
      setExpenses(expenses || []);
      setTotalPages(totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    }
  };

  const fetchAllMonthlyParities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/expenses/all-parities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonthlyParities(response.data);
    } catch (err) {
      console.error('Failed to fetch monthly parities:', err);
    }
  };

  const handleSettleMonth = async (month, year) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/expenses/settle-month', { month, year }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonthlyParities((prevParities) =>
        prevParities.map((parity) =>
          parity.month === month && parity.year === year
            ? { ...parity, settled: true }
            : parity
        )
      );
    } catch (err) {
      console.error('Failed to settle month:', err);
    }
  };

 // Fetch categories and subcategories from the API
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');

    // Group data by category name and collect subcategories
    const groupedCategories = response.data.reduce((acc, item) => {
      const { category_name, subcategory_name } = item;

      if (!acc[category_name]) {
        acc[category_name] = {
          category_name,
          subcategories: [],
        };
      }
      if (!acc[category_name].subcategories.includes(subcategory_name)) {
        acc[category_name].subcategories.push(subcategory_name);
      }
      return acc;
    }, {});

    // Convert grouped object to an array
    const uniqueCategories = Object.values(groupedCategories);
    setCategories(uniqueCategories);

  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFilters({ ...filters, category: selectedCategory, subcategory: '' });

    const foundCategory = categories.find(cat => cat.category_name === selectedCategory);
    setSubcategories(foundCategory ? foundCategory.subcategories : []);
  };

  const handleCategoryChangeForExpense = (e, index) => {
    const selectedCategory = e.target.value;
    const updatedExpenses = [...newProjection.expenses];
    
    // Set category and reset subcategory for the specific expense
    updatedExpenses[index].category = selectedCategory;
    updatedExpenses[index].subCategory = ''; // Reset subcategory when category changes
    
    // Find subcategories for the selected category
    const selectedCat = categories.find(cat => cat.category_name === selectedCategory);
    updatedExpenses[index].subcategories = selectedCat ? selectedCat.subcategories : [];
    
    // Update the expenses array in state
    setNewProjection({ ...newProjection, expenses: updatedExpenses });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      assigned_to: '',
      category: '',
      subcategory: ''
    });
    setSubcategories([]);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleNavigateToExpensePage = () => {
    navigate('/expense');
  };

  const fetchMonthlySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/expenses/monthly-summary', {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters },
      });
      processChartData(response.data);
    } catch (err) {
      setError('Failed to load monthly summary data.');
      console.error(err);
    }
  };

  const processChartData = (data) => {
    const monthlySpending = {};
    const categorySpending = {};
    let totalSpendAmount = 0;
    let monthCount = new Set();

    data.forEach((item) => {
      const { year, month, user, category, totalAmount } = item;
      const monthLabel = `${year}-${month.toString().padStart(2, '0')}`;
      monthCount.add(monthLabel);

      if (!monthlySpending[monthLabel]) monthlySpending[monthLabel] = {};
      if (!monthlySpending[monthLabel][user]) monthlySpending[monthLabel][user] = 0;
      monthlySpending[monthLabel][user] += totalAmount;

      if (!categorySpending[category]) categorySpending[category] = 0;
      categorySpending[category] += totalAmount;

      totalSpendAmount += totalAmount;
    });

    const numberOfMonths = monthCount.size || 1;
    const calculatedBurnRate = totalSpendAmount / numberOfMonths;
    setBurnRate(calculatedBurnRate);

    setTotalSpend(totalSpendAmount);

    if (Object.keys(monthlySpending).length > 0) {
      setChartData({
        labels: Object.keys(monthlySpending),
        datasets: Object.keys(monthlySpending[Object.keys(monthlySpending)[0]]).map((user, idx) => ({
          label: user,
          data: Object.values(monthlySpending).map((month) => month[user] || 0),
          backgroundColor: `rgba(${(idx + 1) * 40 % 255}, 99, 132, 0.5)`,
        })),
      });
    }

    if (Object.keys(categorySpending).length > 0) {
      setCategoryChartData({
        labels: Object.keys(categorySpending),
        datasets: [
          {
            label: 'Category Spend',
            data: Object.values(categorySpending),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          },
        ],
      });
    }
  };

  const fetchProjections = async () => {
    try {
      const response = await api.get('/projection/all'); // Fetch projections from /projection/all
      console.log("Fetched Projections:", response.data.projections); // Check if _id is present
      setProjections(response.data.projections);
    } catch (err) {
      console.error("Error fetching projections:", err);
    }
  };
  

  const handleCreateProjection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('You are not authorized to perform this action.');
        return;
      }
  
      // Post request to create projection
      const response = await api.post('/projection', newProjection, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const projectionId = response.data.projection._id;
  
      /*
      // Trigger projection calculation after creation
      await api.post('/projection/calculate', { projectionId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      */
      setProjections([...projections, response.data.projection]);
      setOpenCreateDialog(false);
      setNewProjection({ name: '', durationMonths: '', expenses: [] });
      fetchProjections(); // Refresh projections
    } catch (err) {
      console.error("Error creating projection:", err);
      setError('Failed to create projection. Please check your permissions.');
    }
  };
  

  const handleEditProjection = (projection) => {
    setSelectedProjection(projection);
    setNewProjection({
      name: projection.name,
      durationMonths: projection.durationMonths,
      expenses: projection.monthlyExpenses.map(expense => ({
        expenseName: expense.expenseName,
        category: expense.category,
        subCategory: expense.subCategory,
        amount: expense.amount,
        recurrence: expense.recurrence,
        notes: expense.notes,
      })),
    });
    setEditMode(true);
    setOpenCreateDialog(true);
  };
  

  const handleSaveEditedProjection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/projection/${selectedProjection._id}`, newProjection, {
        headers: { Authorization: `Bearer ${token}` },
      });
     // await api.post('/projection/calculate', { projectionId: selectedProjection._id });
      setProjections(projections.map(proj => proj._id === selectedProjection._id ? response.data.projection : proj));
      setEditMode(false);
      setSelectedProjection(null);
      fetchProjections(); // Refresh list of projections
      setOpenCreateDialog(false);
    } catch (err) {
      console.error("Error saving edited projection:", err);
    }
  };
  

  const handleDeleteProjection = async (projectionId) => {
    console.log("Deleting projection with ID:", projectionId); // Log to confirm ID
    if (!window.confirm("Are you sure you want to delete this projection?")) return;
    try {
      await api.delete(`/projection/${projectionId}`); // Use the actual ID here
      setProjections(projections.filter(proj => proj._id !== projectionId));
    } catch (err) {
      console.error("Error deleting projection:", err);
    }
  };
  
  

  return (
    <Box sx={{ mt: 3 }}>
      {/* Expenses Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Detailed Expenses</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {['startDate', 'endDate', 'minAmount', 'maxAmount'].map((field) => (
              <TextField
                key={field}
                label={field === 'startDate' ? 'Start Date' : field === 'endDate' ? 'End Date' : field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                type={field === 'startDate' || field === 'endDate' ? 'date' : 'text'}
                variant="outlined"
                size="small"
                onChange={handleFilterChange}
                value={filters[field]}
                InputLabelProps={field === 'startDate' || field === 'endDate' ? { shrink: true } : {}}
                sx={{ width: '150px' }}
              />
            ))}
            <TextField
              label="Category"
              name="category"
              variant="outlined"
              select
              size="small"
              onChange={handleCategoryChange}
              value={filters.category}
              sx={{ width: '150px' }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.category_name} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Assigned To"
              name="assigned_to"
              variant="outlined"
              select
              size="small"
              onChange={handleFilterChange}
              value={filters.assigned_to}
              sx={{ width: '150px' }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map(user => (
                <MenuItem key={user._id} value={user.name}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" color="secondary" size="small" onClick={clearFilters}>Clear</Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Monthly Spending by User</Typography>
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Spending by Category</Typography>
                <Pie data={categoryChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Total Spend</Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">₹{totalSpend.toLocaleString()}</Typography>
                <Typography variant="body1" color="textSecondary">Burn Rate: ₹{burnRate.toFixed(2)} / month</Typography>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Expense Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Subcategory</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Amount (₹)</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.expense_name}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.subcategory}</TableCell>
                      <TableCell>{expense.assigned_to}</TableCell>
                      <TableCell>₹{expense.amount}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'dd-MM-yyyy')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleNavigateToExpensePage}>Create Expense</Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Monthly Parities Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Monthly Founder Expenses and Settlement</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ mb: 2, width: '95%', mx: 'auto', p: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Month-Year</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Founder Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyParities.length > 0 ? (
                  monthlyParities.map((parity) => (
                    <TableRow key={`${parity.year}-${parity.month}`}>
                      <TableCell>{`${parity.month}-${parity.year}`}</TableCell>
                      <TableCell>₹{parity.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        <Table size="small" aria-label="founder details" sx={{ width: '100%' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Founder</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Expected Contribution</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actual Contribution</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Disparity</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parity.parityData.map((founder, idx) => (
                              <TableRow key={founder.founderId}>
                                <TableCell>{founder.name}</TableCell>
                                <TableCell>₹{founder.expectedContribution.toFixed(2)}</TableCell>
                                <TableCell>₹{founder.actualContribution.toFixed(2)}</TableCell>
                                <TableCell>₹{founder.disparity.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                      <TableCell>{parity.settled ? "Settled" : "Not Settled"}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={parity.settled ? "default" : "error"}
                          disabled={parity.settled}
                          onClick={() => handleSettleMonth(parity.month, parity.year)}
                        >
                          {parity.settled ? "Settled" : "Settle"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No monthly parity data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Projections Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Projections</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {projections.length === 0 ? (
            <Typography align="center">No projection done yet</Typography>
          ) : (
            <Grid container spacing={2}>
              {projections.map((projection) => (
                <Grid item xs={12} sm={6} md={4}> {/* Each card takes 1/3 width on medium and larger screens */}
                <Card sx={{ 
                  boxShadow: 3, 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  p: 3, 
                  backgroundColor: '#f9f9f9', 
                  width: '100%' // Ensures it scales with grid 
                }}>
                  <CardContent>
                    <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                      {projection.name}
                    </Typography>
                    
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                      Duration: <strong>{projection.durationMonths} months</strong>
                    </Typography>
              
                    <Typography variant="h6" color="textPrimary" sx={{ mt: 1 }}>
                      Total Expense: <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>₹{projection.totalProjectedExpense}</span>
                    </Typography>
              
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                      Overall Monthly Expense: <span style={{ fontWeight: 'bold' }}>₹{projection.overallMonthlyExpense}</span>
                    </Typography>
              
                    <Typography variant="subtitle2" color="textPrimary" sx={{ mt: 2, mb: 1 }}>
                      Founder Split
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Founder</strong></TableCell>
                            <TableCell align="right"><strong>Split / Month (₹)</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projection.founderContributions.map((contribution) => (
                            <TableRow key={contribution.founderName}>
                              <TableCell>{contribution.founderName}</TableCell>
                              <TableCell align="right">₹{contribution.contributionPerMonth}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

              
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        onClick={() => handleEditProjection(projection)}
                      >
                        Edit
                      </Button>
                      <IconButton 
                        onClick={() => handleDeleteProjection(projection._id)} 
                        color="error" 
                        sx={{ borderRadius: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              ))}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>Create Projection</Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Create/Edit Projection Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth>
        <DialogTitle>{editMode ? "Edit Projection" : "Create Projection"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Projection Name"
            value={newProjection.name}
            onChange={(e) => setNewProjection({ ...newProjection, name: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Duration (Months)"
            type="number"
            value={newProjection.durationMonths}
            onChange={(e) => setNewProjection({ ...newProjection, durationMonths: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          {newProjection.expenses.map((expense, index) => (
            <Box key={index} display="flex" flexDirection="column" sx={{ mt: 2 }}>
              <TextField
                label="Expense Name"
                value={expense.expenseName}
                onChange={(e) => {
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].expenseName = e.target.value;
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                sx={{ mb: 1 }}
              />
              <TextField
                label="Category"
                select
                value={expense.category}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].category = selectedCategory;
                  updatedExpenses[index].subCategory = ''; // Reset subcategory on category change

                  // Dynamically set subcategories for the selected category
                  const selectedCat = categories.find((cat) => cat.category_name === selectedCategory);
                  updatedExpenses[index].subcategories = selectedCat ? selectedCat.subcategories : [];
                  
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                sx={{ mb: 1 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.category_name} value={cat.category_name}>
                    {cat.category_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Subcategory"
                select
                value={expense.subCategory}
                onChange={(e) => {
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].subCategory = e.target.value;
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                sx={{ mb: 1 }}
              >
                {(expense.subcategories || []).map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            If your category or subcategory is not listed, please create it in the <a href="/category">Create Category</a> page.
          </Typography>
              <TextField
                label="Amount"
                type="number"
                value={expense.amount}
                onChange={(e) => {
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].amount = e.target.value;
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                sx={{ mb: 1 }}
              />
              <TextField
                label="Recurrence"
                select
                value={expense.recurrence}
                onChange={(e) => {
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].recurrence = e.target.value;
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                sx={{ mb: 1 }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                value={expense.notes}
                onChange={(e) => {
                  const updatedExpenses = [...newProjection.expenses];
                  updatedExpenses[index].notes = e.target.value;
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <IconButton
                onClick={() => {
                  const updatedExpenses = newProjection.expenses.filter((_, i) => i !== index);
                  setNewProjection({ ...newProjection, expenses: updatedExpenses });
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              setNewProjection({
                ...newProjection,
                expenses: [
                  ...newProjection.expenses,
                  { expenseName: '', category: '', subCategory: '', subcategories: [], amount: '', recurrence: '', notes: '' },
                ],
              })
            }
            sx={{ mt: 2 }}
          >
            Add Expense
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={editMode ? handleSaveEditedProjection : handleCreateProjection} color="primary">
            {editMode ? "Save Changes" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ExpensesTab;
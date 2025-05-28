import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'audit';
  date: string;
  status: 'generated' | 'pending' | 'approved' | 'submitted';
  size: string;
}

const ComplianceReports: React.FC = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>('2025-05');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'TSHC Monthly Compliance Report - April 2025',
      type: 'monthly',
      date: '2025-04-30',
      status: 'submitted',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'TSHC Monthly Compliance Report - March 2025',
      type: 'monthly',
      date: '2025-03-31',
      status: 'submitted',
      size: '2.1 MB'
    },
    {
      id: '3',
      name: 'TSHC Quarterly Compliance Report - Q1 2025',
      type: 'quarterly',
      date: '2025-03-31',
      status: 'submitted',
      size: '4.5 MB'
    },
    {
      id: '4',
      name: 'TSHC Monthly Compliance Report - February 2025',
      type: 'monthly',
      date: '2025-02-28',
      status: 'submitted',
      size: '1.9 MB'
    },
    {
      id: '5',
      name: 'TSHC Monthly Compliance Report - January 2025',
      type: 'monthly',
      date: '2025-01-31',
      status: 'submitted',
      size: '2.2 MB'
    },
    {
      id: '6',
      name: 'TSHC Annual Compliance Report - 2024',
      type: 'annual',
      date: '2024-12-31',
      status: 'approved',
      size: '8.7 MB'
    },
    {
      id: '7',
      name: 'TSHC Quarterly Compliance Report - Q4 2024',
      type: 'quarterly',
      date: '2024-12-31',
      status: 'approved',
      size: '4.2 MB'
    },
    {
      id: '8',
      name: 'External Audit Report - 2024',
      type: 'audit',
      date: '2024-12-15',
      status: 'approved',
      size: '5.6 MB'
    }
  ]);

  const handleReportTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReport(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get month and year from selected date
      const [year, month] = selectedDate.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      
      // Format date for display
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      // Create report name based on type
      let reportName = '';
      let reportDate = '';
      
      if (selectedReport === 'monthly') {
        reportName = `TSHC Monthly Compliance Report - ${monthName} ${year}`;
        reportDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of month
      } else if (selectedReport === 'quarterly') {
        const quarter = Math.floor((date.getMonth() / 3)) + 1;
        reportName = `TSHC Quarterly Compliance Report - Q${quarter} ${year}`;
        
        // Last day of quarter
        const lastMonth = quarter * 3;
        reportDate = new Date(date.getFullYear(), lastMonth, 0).toISOString().split('T')[0];
      } else if (selectedReport === 'annual') {
        reportName = `TSHC Annual Compliance Report - ${year}`;
        reportDate = `${year}-12-31`;
      } else if (selectedReport === 'audit') {
        reportName = `External Audit Report - ${year}`;
        reportDate = `${year}-12-15`;
      }
      
      // Add new report to the list
      const newReport: Report = {
        id: (reports.length + 1).toString(),
        name: reportName,
        type: selectedReport as 'monthly' | 'quarterly' | 'annual' | 'audit',
        date: reportDate,
        status: 'generated',
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`
      };
      
      setReports([newReport, ...reports]);
    } catch (err) {
      console.error('Error generating report:', err);
      setGenerationError('Failed to generate report. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'monthly':
        return <DescriptionIcon />;
      case 'quarterly':
        return <AssignmentIcon />;
      case 'annual':
        return <AssignmentIcon />;
      case 'audit':
        return <AssignmentIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compliance Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Report Generation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Report Type"
                  value={selectedReport}
                  onChange={handleReportTypeChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="monthly">Monthly Compliance Report</MenuItem>
                  <MenuItem value="quarterly">Quarterly Compliance Report</MenuItem>
                  <MenuItem value="annual">Annual Compliance Report</MenuItem>
                  <MenuItem value="audit">External Audit Report</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Report Period"
                  type="month"
                  value={selectedDate}
                  onChange={handleDateChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />}
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </Grid>
            </Grid>
            
            {generationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {generationError}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Report Categories */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Reports
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {reports.filter(r => r.type === 'monthly').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed monthly transaction and reserve reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quarterly Reports
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {reports.filter(r => r.type === 'quarterly').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive quarterly compliance summaries
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Annual Reports
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {reports.filter(r => r.type === 'annual').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full annual compliance and operations reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Reports
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
                {reports.filter(r => r.type === 'audit').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Independent audit reports and findings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Reports Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Reports
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getReportIcon(report.type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {report.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={report.type.charAt(0).toUpperCase() + report.type.slice(1)} 
                          size="small"
                          color={
                            report.type === 'monthly' ? 'primary' :
                            report.type === 'quarterly' ? 'secondary' :
                            report.type === 'annual' ? 'success' :
                            'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>{formatDate(report.date)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={report.status.charAt(0).toUpperCase() + report.status.slice(1)} 
                          size="small"
                          color={getStatusColor(report.status) as any}
                        />
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" color="primary">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          
                          {report.status === 'generated' && (
                            <IconButton size="small" color="success">
                              <SendIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No reports available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Regulatory Requirements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Regulatory Reporting Requirements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Central Bank Requirements
                </Typography>
                <Typography variant="body2" paragraph>
                  • Monthly reserve reports showing USDC backing for TSHC
                </Typography>
                <Typography variant="body2" paragraph>
                  • Quarterly transaction volume and user statistics
                </Typography>
                <Typography variant="body2" paragraph>
                  • Annual comprehensive compliance report
                </Typography>
                <Typography variant="body2">
                  • Immediate reporting of any reserve ratio below 95%
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Financial Intelligence Unit Requirements
                </Typography>
                <Typography variant="body2" paragraph>
                  • Monthly suspicious transaction reports
                </Typography>
                <Typography variant="body2" paragraph>
                  • Quarterly AML/CFT compliance reports
                </Typography>
                <Typography variant="body2" paragraph>
                  • Annual risk assessment and mitigation report
                </Typography>
                <Typography variant="body2">
                  • Immediate reporting of transactions over 10,000 TSHC
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Report Submission Schedule
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Type</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Recipient</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Reserve Report</TableCell>
                      <TableCell>Monthly</TableCell>
                      <TableCell>10th of following month</TableCell>
                      <TableCell>Central Bank</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transaction Report</TableCell>
                      <TableCell>Monthly</TableCell>
                      <TableCell>15th of following month</TableCell>
                      <TableCell>Central Bank, FIU</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Compliance Summary</TableCell>
                      <TableCell>Quarterly</TableCell>
                      <TableCell>30 days after quarter end</TableCell>
                      <TableCell>Central Bank, FIU</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Comprehensive Audit</TableCell>
                      <TableCell>Annual</TableCell>
                      <TableCell>90 days after year end</TableCell>
                      <TableCell>Central Bank, FIU, Public</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceReports;

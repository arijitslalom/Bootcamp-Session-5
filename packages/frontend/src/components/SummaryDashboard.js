import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

function SummaryDashboard({ totalTasks, remainingTasks }) {
  return (
    <Box component="section" aria-label="Task statistics">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Tasks Card */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 2
          }}
            role="region"
            aria-label="Total tasks count"
          >
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9, display: 'block' }}>
                TOTAL TASKS
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }} aria-live="polite">
                {totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Remaining Tasks Card */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            bgcolor: 'secondary.main', 
            color: 'secondary.contrastText',
            borderRadius: 2
          }}
            role="region"
            aria-label="Remaining tasks count"
          >
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9, display: 'block' }}>
                REMAINING TASKS
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }} aria-live="polite">
                {remainingTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SummaryDashboard;

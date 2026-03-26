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
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {/* Total Tasks Card */}
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 2,
            aspectRatio: '3 / 2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            role="region"
            aria-label="Total tasks count"
          >
            <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', fontWeight: 600 }}>
                TOTAL TASKS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }} aria-live="polite">
                {totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Remaining Tasks Card */}
        <Grid item xs={6}>
          <Card sx={{ 
            bgcolor: 'secondary.main', 
            color: 'secondary.contrastText',
            borderRadius: 2,
            aspectRatio: '3 / 2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            role="region"
            aria-label="Remaining tasks count"
          >
            <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', fontWeight: 600 }}>
                REMAINING TASKS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }} aria-live="polite">
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

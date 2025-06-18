import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,

  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Logout,
  Delete,
  TrendingUp,
  Remove,
  Wifi,
  WifiOff,
} from '@mui/icons-material';
import StockSearch from './StockSearch';
import { subscriptionAPI } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

interface User {
  id: number;
  email: string;
}

interface Subscription {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
}

interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, token, onLogout }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket connection for real-time prices
  const { connected, prices, lastUpdate } = useWebSocket(token);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.get();
      setSubscriptions(response.data.subscriptions || []);
    } catch (error: any) {
      setError('Failed to load subscriptions');
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = async (ticker: string) => {
    try {
      await subscriptionAPI.remove(ticker);
      await loadSubscriptions(); // Reload subscriptions
    } catch (error: any) {
      setError('Failed to remove subscription');
      console.error('Error removing subscription:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    onLogout();
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatLastUpdate = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={connected ? <Wifi /> : <WifiOff />}
              label={connected ? 'Connected' : 'Disconnected'}
              color={connected ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                pointerEvents: 'none',
                cursor: 'default',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            />
            <Typography variant="body2">
              {user.email}
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stock Search Component */}
        <StockSearch 
          subscriptions={subscriptions}
          onSubscriptionAdded={loadSubscriptions}
        />

        {/* Subscriptions Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" component="h2">
            My Stock Subscriptions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last updated: {formatLastUpdate(lastUpdate)}
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* No Subscriptions */}
        {!loading && subscriptions.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No stock subscriptions yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use the search above to add up to 5 stocks to your watchlist
              </Typography>
            </CardContent>
          </Card>
        )}

                {/* Stock Cards */}
        {!loading && subscriptions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {subscriptions.map((subscription) => {
              const currentPrice = prices[subscription.ticker];
              const hasPrice = currentPrice !== undefined;
              
              return (
                <Box key={subscription.id} sx={{ width: { xs: '100%', md: '48%', lg: '32%' } }}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {subscription.ticker}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {subscription.name || 'Stock Name'}
                          </Typography>
                          <Chip 
                            label={subscription.exchange || 'N/A'} 
                            size="small" 
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveSubscription(subscription.ticker)}
                          title="Remove subscription"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          {hasPrice ? (
                            <>
                              <Typography variant="h4" component="div" color="primary">
                                {formatPrice(currentPrice)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Real-time price in INR
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="h6" color="textSecondary">
                                <Remove /> ₹---.--
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {connected ? 'Loading price...' : 'Disconnected'}
                              </Typography>
                            </>
                          )}
                        </Box>
                        
                        {hasPrice && (
                          <Box textAlign="center">
                            <TrendingUp color="success" />
                            <Typography variant="caption" display="block">
                              Live
                            </Typography>
                          </Box>
                        )}
                      </Box>
                                         </CardContent>
                   </Card>
                 </Box>
               );
             })}
           </Box>
         )}

        {/* Real-time Status */}
        {subscriptions.length > 0 && (
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              {connected 
                ? '🟢 Real-time price updates every 30 seconds' 
                : '🔴 Disconnected - attempting to reconnect...'}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard; 
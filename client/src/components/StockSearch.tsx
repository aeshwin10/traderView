import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { stockAPI, subscriptionAPI } from '../services/api';

interface Stock {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
  market_cap: number;
}

interface Subscription {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  subscriptions: Subscription[];
  onSubscriptionAdded: () => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ subscriptions, onSubscriptionAdded }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Load all stocks on component mount
  useEffect(() => {
    loadAllStocks();
  }, []);

  const loadAllStocks = async () => {
    try {
      setSearchLoading(true);
      const response = await stockAPI.getAll();
      setStocks(response.data.stocks || []);
    } catch (error: any) {
      console.error('Error loading stocks:', error);
      setError('Failed to load stock list');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await loadAllStocks();
      return;
    }

    try {
      setSearchLoading(true);
      const response = await stockAPI.search(query);
      setStocks(response.data.stocks || []);
    } catch (error: any) {
      console.error('Error searching stocks:', error);
      setError('Failed to search stocks');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedStock) return;

    // Check if already subscribed
    const alreadySubscribed = subscriptions.some(sub => sub.ticker === selectedStock.ticker);
    if (alreadySubscribed) {
      setError('Already subscribed to this stock');
      return;
    }

    // Check subscription limit
    if (subscriptions.length >= 5) {
      setError('Maximum 5 stock subscriptions allowed per user');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await subscriptionAPI.add(selectedStock.ticker);
      
      setSelectedStock(null);
      setSearchValue('');
      onSubscriptionAdded();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  const subscribedTickers = subscriptions.map(sub => sub.ticker);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Stock Subscription ({subscriptions.length}/5)
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} alignItems="flex-start">
        <Autocomplete
          sx={{ flexGrow: 1 }}
          options={stocks}
          getOptionLabel={(option) => `${option.ticker} - ${option.name}`}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1">
                  <strong>{option.ticker}</strong> - {option.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {option.exchange} • Market Cap: {option.market_cap ? `$${(option.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option.ticker}
                {...getTagProps({ index })}
                key={option.id}
              />
            ))
          }
          loading={searchLoading}
          value={selectedStock}
          onChange={(event, newValue) => setSelectedStock(newValue)}
          inputValue={searchValue}
          onInputChange={(event, newInputValue) => {
            setSearchValue(newInputValue);
            if (newInputValue.length > 2) {
              handleSearch(newInputValue);
            } else if (newInputValue.length === 0) {
              loadAllStocks();
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search stocks..."
              placeholder="Search by ticker or company name"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          getOptionDisabled={(option) => subscribedTickers.includes(option.ticker)}
          noOptionsText={searchLoading ? "Searching..." : "No stocks found"}
        />
        
        <Button
          variant="contained"
          onClick={handleAddSubscription}
          disabled={!selectedStock || loading || subscriptions.length >= 5}
          startIcon={loading ? <CircularProgress size={20} /> : <AddCircleOutline />}
          sx={{ mt: 1, minWidth: 120 }}
        >
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </Box>

      {subscriptions.length >= 5 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          You have reached the maximum limit of 5 stock subscriptions. Remove a subscription to add a new one.
        </Alert>
      )}
    </Box>
  );
};

export default StockSearch; 
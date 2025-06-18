import axios from 'axios';

interface CurrencyRate {
  rate: number;
  lastUpdated: Date;
}

class CurrencyService {
  private currencyApiKey: string;
  private currencyBaseUrl: string;
  private cachedRate: CurrencyRate | null = null;
  private cacheValidityHours = 1;

  constructor() {
    this.currencyApiKey = process.env.CURRENCY_FREAKS_API_KEY || '';
    this.currencyBaseUrl = process.env.CURRENCY_FREAKS_BASE_URL || 'https://api.currencyfreaks.com/v2.0';
  }

  // Check if cached rate is still valid
  private isCacheValid(): boolean {
    if (!this.cachedRate) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - this.cachedRate.lastUpdated.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff < this.cacheValidityHours;
  }

  // Fetch USD to INR conversion rate
  async getUSDToINRRate(): Promise<number> {
    try {
      // Return cached rate if valid
      if (this.isCacheValid() && this.cachedRate) {
        console.log('Using cached USD to INR rate:', this.cachedRate.rate);
        return this.cachedRate.rate;
      }

      console.log('Fetching fresh USD to INR rate...');
      
      const response = await axios.get(
        `${this.currencyBaseUrl}/rates/latest`,
        {
          params: {
            apikey: this.currencyApiKey,
            symbols: 'INR'
          }
        }
      );

      const rate = parseFloat(response.data.rates.INR);
      
      if (isNaN(rate) || rate <= 0) {
        throw new Error('Invalid currency rate received');
      }

      // Cache the new rate
      this.cachedRate = {
        rate,
        lastUpdated: new Date()
      };

      console.log('Fresh USD to INR rate fetched:', rate);
      return rate;
    } catch (error) {
      console.error('Error fetching currency rate:', error);
      
      // Return cached rate even if expired, as fallback
      if (this.cachedRate) {
        console.log('Using expired cached rate as fallback:', this.cachedRate.rate);
        return this.cachedRate.rate;
      }
      
      // Default fallback rate (approximate current rate)
      console.log('Using default fallback rate: 83');
      return 83;
    }
  }

  // Convert USD amount to INR
  async convertUSDToINR(usdAmount: number): Promise<number> {
    const rate = await this.getUSDToINRRate();
    return usdAmount * rate;
  }

  // Convert multiple USD amounts to INR
  async convertMultipleUSDToINR(usdAmounts: { [key: string]: number }): Promise<{ [key: string]: number }> {
    const rate = await this.getUSDToINRRate();
    const inrAmounts: { [key: string]: number } = {};
    
    for (const [key, usdAmount] of Object.entries(usdAmounts)) {
      inrAmounts[key] = usdAmount * rate;
    }
    
    return inrAmounts;
  }

  // Get current cached rate info
  getCachedRateInfo(): { rate: number | null; lastUpdated: Date | null; isValid: boolean } {
    return {
      rate: this.cachedRate?.rate || null,
      lastUpdated: this.cachedRate?.lastUpdated || null,
      isValid: this.isCacheValid()
    };
  }
}

export default CurrencyService; 
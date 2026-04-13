import axios from 'axios';

/**
 * BankService handles integration with third-party VietQR API 
 * to fetch Vietnamese bank list and logos.
 */
class BankService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.vietqr.io/v2',
      timeout: 10000,
    });
    this.cache = null;
  }

  /**
   * Fetches all banks in Vietnam
   * @returns {Promise<Array>} List of banks with name, logo, code, etc.
   */
  async getVietQRBanks() {
    if (this.cache) return this.cache;

    try {
      const response = await this.api.get('/banks');
      if (response.data && response.data.code === '00') {
        // Normalize fields to handle API inconsistencies (shortName vs short_name)
        this.cache = response.data.data.map(bank => ({
          ...bank,
          shortName: bank.shortName || bank.short_name || bank.code,
          fullName: bank.name || bank.fullName
        }));
        return this.cache;
      }
      throw new Error(response.data.desc || 'Không thể lấy danh sách ngân hàng');
    } catch (error) {
      console.error('Error fetching VietQR banks:', error);
      throw error;
    }
  }

  /**
   * Finds a bank by its code
   * @param {string} code 
   */
  async getBankByCode(code) {
    const banks = await this.getVietQRBanks();
    return banks.find(b => b.code === code || b.shortName === code);
  }
}

const bankService = new BankService();
export default bankService;

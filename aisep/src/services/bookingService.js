import apiClient from './apiClient';

const API_URL = '/api/Booking';

const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post(API_URL, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },
  getMyCustomerBookings: async (customerId) => {
    try {
      const response = await apiClient.get(`${API_URL}/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return null;
    }
  },
  getAllBookings: async (filters = '', sorts = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (filters) params.append('filters', filters);
      if (sorts) params.append('sorts', sorts);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await apiClient.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return null;
    }
  },
  getBookingById: async (id) => {
    try {
      const response = await apiClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }
};

export default bookingService;

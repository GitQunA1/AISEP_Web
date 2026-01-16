// Configuration file for environment variables
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  env: process.env.REACT_APP_ENV || 'development',
};

export default config;

// Mock authentication data - 3 demo accounts
export const mockAccounts = [
  {
    id: 'startup-001',
    email: 'demo@startup.com',
    password: 'Demo@123', // In real app, use bcrypt
    role: 'startup',
    name: 'Tech Innovations Inc.',
    companyName: 'Tech Innovations Inc.',
    avatar: '🚀',
  },
  {
    id: 'investor-001',
    email: 'demo@investor.com',
    password: 'Demo@123',
    role: 'investor',
    name: 'John Investor',
    companyName: 'Capital Ventures Fund',
    avatar: '💰',
  },
  {
    id: 'advisor-001',
    email: 'demo@advisor.com',
    password: 'Demo@123',
    role: 'advisor',
    name: 'Dr. Sarah Expert',
    companyName: 'Business Advisory',
    avatar: '👨‍💼',
  },
];

// Simulate login - return user data if credentials match
export const loginUser = (email, password) => {
  const account = mockAccounts.find(
    (acc) => acc.email === email && acc.password === password
  );

  if (account) {
    // Return user data without password
    const { password: _, ...userWithoutPassword } = account;
    return {
      success: true,
      user: userWithoutPassword,
      token: `mock-jwt-token-${account.id}`, // Mock JWT token
    };
  }

  return {
    success: false,
    error: 'Invalid email or password',
  };
};

// Get demo account info for display
export const getDemoAccounts = () => {
  return mockAccounts.map((acc) => ({
    email: acc.email,
    password: acc.password,
    role: acc.role,
    name: acc.name,
  }));
};

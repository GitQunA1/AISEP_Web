// Get demo account info for displaying the quick-fill dropdown in LoginPage ONLY
// Registration/Login simulation functions have been deleted to enforce real backend usage.

export const mockAccounts = [
    {
      id: 'startup-001',
      email: 'demo@startup.com',
      password: 'Demo@123',
      role: 'startup',
      name: 'Tech Innovations Inc.'
    },
    {
      id: 'investor-001',
      email: 'demo@investor.com',
      password: 'Demo@123',
      role: 'investor',
      name: 'John Investor'
    },
    {
      id: 'advisor-001',
      email: 'demo@advisor.com',
      password: 'Demo@123',
      role: 'advisor',
      name: 'Dr. Sarah Expert'
    },
    {
      id: 'staff-001',
      email: 'staff1@operationteam.com',
      password: 'Staff@123',
      role: 'operation_staff',
      name: 'Anna Chen'
    }
];

export const getDemoAccounts = () => {
  return mockAccounts.map((acc) => ({
    email: acc.email,
    password: acc.password,
    role: acc.role,
    name: acc.name,
  }));
};

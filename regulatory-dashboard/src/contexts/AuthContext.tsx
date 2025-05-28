import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'central_bank' | 'partner_bank' | 'regulator';
  organization: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For demo purposes, we'll use localStorage to persist the user
  useEffect(() => {
    const storedUser = localStorage.getItem('regulatoryUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call to authenticate
      // For demo purposes, we'll simulate authentication
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test credentials for different regulatory roles
      const testUsers: Record<string, User> = {
        'admin@bot.go.tz': {
          id: '1',
          name: 'Central Bank Admin',
          email: 'admin@bot.go.tz',
          role: 'central_bank',
          organization: 'Tanzania Central Bank'
        },
        'compliance@absa.co.tz': {
          id: '2',
          name: 'Partner Bank Admin',
          email: 'compliance@absa.co.tz',
          role: 'partner_bank',
          organization: 'ABSA Bank'
        },
        'inspector@fra.go.tz': {
          id: '3',
          name: 'Financial Regulator',
          email: 'inspector@fra.go.tz',
          role: 'regulator',
          organization: 'Financial Regulatory Authority'
        }
      };
      
      // For role-based selection, map to the appropriate test account
      let testEmail = email;
      if (email === 'central@example.com') testEmail = 'admin@bot.go.tz';
      if (email === 'partner@example.com') testEmail = 'compliance@absa.co.tz';
      if (email === 'regulator@example.com') testEmail = 'inspector@fra.go.tz';
      
      // Check if the email exists in our test users
      // Accept either 'Regulator2025' or any password for testing
      if (testUsers[testEmail] && (password === 'Regulator2025' || password.length > 0)) {
        const authenticatedUser = testUsers[testEmail];
        setUser(authenticatedUser);
        localStorage.setItem('regulatoryUser', JSON.stringify(authenticatedUser));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('regulatoryUser');
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

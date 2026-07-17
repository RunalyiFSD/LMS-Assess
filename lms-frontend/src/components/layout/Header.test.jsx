import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import { AuthProvider } from '../../../context/AuthContext';
import React from 'react';

// Mocking Auth Context for testing
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('Header Component', () => {
  it('renders sign in button when no user is logged in', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  it('renders the brand name AssessLMS', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/AssessLMS/i)).toBeInTheDocument();
  });
});

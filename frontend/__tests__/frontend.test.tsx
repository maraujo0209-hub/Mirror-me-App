import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginCard from '../components/auth/LoginCard';

// ============================================================================
// 1. INFRASTRUCTURE MOCK REGISTRIES
// ============================================================================
// Mock the next/router behavior to prevent execution faults during push actions
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: mockPush,
    };
  },
}));

// Reset all diagnostic recording mocks before running subsequent test evaluation loops
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

// ============================================================================
// 2. CORE COMPONENT TEST CASES
// ============================================================================
describe('Frontend Authentication Interface Components System', () => {
  
  test('Renders login entry form fields with comprehensive asset layout structures', () => {
    render(<LoginCard />);
    
    // Evaluate that core elements are present in the layout tree
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('Displays immediate validation alerts when executing boundary form entries empty', async () => {
    render(<LoginCard />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Verify system validation engines catch missing profile entries accurately
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('Processes authentication sequence successfully and executes navigation callback redirect', async () => {
    // Inject a simulated resolution message reflecting your backend JWT payload response structures
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'mock_jwt_session_token_xyz',
        user: { id: 'user_123', email: 'test@mirror-me.com', role: 'user' }
      }),
    });

    render(<LoginCard />);

    // Feed credentials into the interaction node elements
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@mirror-me.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Confirm navigation lifecycle pushes user to dashboard upon matching session parameters
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('Gracefully captures explicit backend HTTP 401 connection validation faults', async () => {
    // Inject a bad credential feedback payload matching your auth.routes.ts error schemas
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid email address or password configuration.' }),
    });

    render(<LoginCard />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@mirror-me.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify UI accurately parses the nested error payload text from the network stream
    expect(await screen.findByText(/invalid email address or password configuration/i)).toBeInTheDocument();
  });

});

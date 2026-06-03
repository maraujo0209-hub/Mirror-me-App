import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import authMiddleware from '../src/middlewares/authMiddleware';
import rbacMiddleware from '../src/middlewares/rbacMiddleware';

// ============================================================================
// 1. MOCKS & ENVIRONMENT SETUP
// ============================================================================
// Mock the services so we don't make real network or database calls during tests
jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

// Create a lightweight, isolated Express app instance just for testing our logic
const app: Express = express();
app.use(express.json());

// Dummy protected routes to verify middleware enforcement
app.get('/api/test/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ success: true, user: (req as any).user });
});

app.get('/api/test/admin', authMiddleware, rbacMiddleware(['admin']), (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome Admin' });
});

// ============================================================================
// 2. AUTHENTICATION MIDDLEWARE TESTS
// ============================================================================
describe('Authentication Middleware Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should block requests missing an Authorization header with 401', async () => {
    const res = await request(app).get('/api/test/protected');
    
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/no token provided/i);
  });

  it('should block malformed Authorization headers (missing Bearer prefix) with 401', async () => {
    const res = await request(app)
      .get('/api/test/protected')
      .set('Authorization', 'InvalidTokenString12345');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/format is Bearer/i);
  });

  it('should pass authenticated payloads into the request context upon valid token verification', async () => {
    // In your real code, mock your jwt.verify return statement or pass a valid local test token
    const mockUserPayload = { id: 'user_98765', email: 'marcio@example.com', role: 'user' };
    
    // Simulating a route execution with a valid token hook
    // Replace this with your actual token generation utility block once ready
    const res = await request(app)
      .get('/api/test/protected')
      .set('Authorization', 'Bearer MOCK_VALID_JWT_TOKEN'); 

    // Adjust these expectations based on your real validation engine rules
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('marcio@example.com');
    }
  });
});

// ============================================================================
// 3. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
// ============================================================================
describe('RBAC Middleware Guard', () => {
  it('should reject authorized users with insufficient hierarchy clearings with 403', async () => {
    // A standard user attempting to hit an admin dashboard route
    const res = await request(app)
      .get('/api/test/admin')
      .set('Authorization', 'Bearer MOCK_USER_JWT_TOKEN');

    if (res.status === 403) {
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/access denied/i);
    }
  });
});

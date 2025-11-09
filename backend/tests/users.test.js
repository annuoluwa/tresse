const request = require('supertest');
const passport = require('passport');
const pool = require('../db');
const { Users } = require('../helperFunctions/helper');
const { passwordHash } = require('../passport');

const {
  deleteUserPath,
  updateUserRoute,
  isLoggedIn,
  isAdmin,
  getUserById,
  getAllProfilesByAdmin,
  registerNewUser,
  userLogout,
  userBrowserLogin
} = require('../routes/users');

// Mock dependencies
jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('../helperFunctions/helper', () => ({
  Users: {
    findByEmail: jest.fn(),
    createUser: jest.fn()
  }
}));

jest.mock('../passport', () => ({
  passwordHash: jest.fn()
}));

jest.mock('passport', () => ({
  authenticate: jest.fn()
}));

// Middleware tests
describe('isLoggedIn Middleware', () => {
  test('calls next if user is authenticated', () => {
    const req = { isAuthenticated: () => true };
    const res = {};
    const next = jest.fn();

    isLoggedIn(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('returns 401 if user is not authenticated', () => {
    const req = { isAuthenticated: () => false };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    isLoggedIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('isAdmin Middleware', () => {
  test('calls next() if user is admin', () => {
    const req = { user: { is_admin: true } };
    const res = {};
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('returns 403 if user is not admin', () => {
    const req = { user: { is_admin: false } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });
});

// userBrowserLogin tests
describe('userBrowserLogin', () => {
  let req, res, next;

  beforeEach(() => {
    req = { login: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('redirects to profile when login is successful', async () => {
    const user = { id: 1, email: 'test@example.com' };

    passport.authenticate.mockImplementation((strategy, cb) => (req, res, next) => {
      cb(null, user);
    });
    req.login.mockImplementation((user, cb) => cb(null));

    await userBrowserLogin(req, res, next);

    expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  test('returns 401 if authentication fails', async () => {
    passport.authenticate.mockImplementation((strategy, cb) => (req, res, next) => {
      cb(new Error('Invalid email or password'));
    });

    await userBrowserLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });
});

// userLogout tests
describe('userLogout', () => {
  let req, res, next;

  beforeEach(() => {
    req = { logout: jest.fn(), session: { destroy: jest.fn() }, user: {} };
    res = { json: jest.fn(), clearCookie: jest.fn() };
    next = jest.fn();
  });

  test('logs out successfully', () => {
    req.logout.mockImplementation(cb => cb(null));
    req.session.destroy.mockImplementation(cb => cb(null));

    userLogout(req, res, next);

    expect(req.logout).toHaveBeenCalledWith(expect.any(Function));
    expect(req.session.destroy).toHaveBeenCalledWith(expect.any(Function));
    expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
    expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
  });

  test('calls next if logout fails', () => {
    const error = new Error('Logout failed');
    req.logout.mockImplementation(cb => cb(error));

    userLogout(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});

// registerNewUser tests
describe('registerNewUser', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { username: 'Liz', email: 'new@example.com', password: '123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    Users.findByEmail.mockReset();
    Users.createUser.mockReset();
    passwordHash.mockReset();
  });

  test('returns 400 if missing email/username/password', async () => {
    req.body = { email: '' };
    await registerNewUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email and Password required" });
  });

  test('returns 409 if user already exists', async () => {
    Users.findByEmail.mockResolvedValue({ id: 2 });

    await registerNewUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  test('calls next if password hashing fails', async () => {
    Users.findByEmail.mockResolvedValue(null);
    passwordHash.mockResolvedValue(null);

    await registerNewUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(Users.createUser).not.toHaveBeenCalled();
  });

  test('returns 201 on successful registration', async () => {
    Users.findByEmail.mockResolvedValue(null);
    Users.createUser.mockResolvedValue({ id: 2, username: 'Liz', email: 'new@example.com', is_admin: false });
    passwordHash.mockResolvedValue('hashed_pw');

    await registerNewUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
      user: { id: 2, username: 'Liz', email: 'new@example.com', is_admin: false }
    });
  });
});

// CRUD tests for users
describe('User CRUD operations', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    pool.query.mockReset();
    passwordHash.mockReset();
  });

  describe('getAllProfilesByAdmin', () => {
    test('returns 200 and list of users', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

      await getAllProfilesByAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [{ id: 1 }, { id: 2 }] });
    });

    test('calls next on query failure', async () => {
      const error = new Error('DB failure');
      pool.query.mockRejectedValue(error);

      await getAllProfilesByAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    const mockUser = { id: 1, username: 'Liz' };

    test('returns 200 if user exists', async () => {
      req.params = { id: '1' };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('returns 404 if user does not exist', async () => {
      req.params = { id: '99' };
      pool.query.mockResolvedValue({ rows: [] });

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

  test('calls next if query fails', async () => {
  req.params = { id: '1' }; // ensure id exists
  const error = new Error('DB failure');
  pool.query.mockRejectedValue(error);

  await getUserById(req, res, next);

  expect(next).toHaveBeenCalledWith(error);
});
  });

  describe('updateUserRoute', () => {
    test('returns 404 if no fields provided', async () => {
      req.params = { id: '42' };
      req.body = {};

      await updateUserRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No field provided" });
    });

    test('calls next if password hashing fails', async () => {
      req.params = { id: '42' };
      req.body = { password: 'pw' };
      passwordHash.mockResolvedValue(null);

      await updateUserRoute(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('updates user successfully', async () => {
      req.params = { id: '42' };
      req.body = { username: 'alice', email: 'alice@example.com', password: 'pw' };
      const hashed = 'hashed_pw';
      passwordHash.mockResolvedValue(hashed);
      const updatedUser = { id: 42, username: 'alice', email: 'alice@example.com' };
      pool.query.mockResolvedValue({ rows: [updatedUser] });

      await updateUserRoute(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "User updated successfully", user: updatedUser });
    });
  });

  describe('deleteUserPath', () => {
    beforeEach(() => {
      req.params = { id: '5' };
    });

    test('returns 200 if deleted successfully', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      await deleteUserPath(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Account deleted successfully" });
    });

    test('returns 404 if delete fails', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      await deleteUserPath(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Delete unsuccessful" });
    });

    test('calls next if query fails', async () => {
      const error = new Error('DB failure');
      pool.query.mockRejectedValue(error);

      await deleteUserPath(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
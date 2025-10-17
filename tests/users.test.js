const request= require('supertest');
const passport = require('passport');
const{ Users } = require('../helperFunctions/helper');
const {passwordHash} = require('../passport')
passwordHash.mockResolvedValue('hashed_pw')//simulate hashing
const pool =require('../db');
const {deleteUserPath, updateUserRoute, isLoggedIn, isAdmin, getUserById, getAllProfilesByAdmin, registerNewUser, userLogout, userBrowserLogin} = require('../routes/users')

jest.mock('../db', ()=>({
query:jest.fn()
}));

jest.mock('../helperFunctions/helper', ()=> ({
      Users: {findByEmail: jest.fn(),
  createUser: jest.fn()
      }
}));//mocking a database;

jest.mock('../passport')//mocking password hash

//middleware unit test
describe('isLoggedIn Middleware', ()=>{
test('calls next if user is aunthenticated', ()=>{
    const req = { isAuthenticated: () => true };
    const res = {};
    const next = jest.fn();

    isLoggedIn(req, res, next);

    expect(next).toHaveBeenCalled();
});

test('redirects to login if user is not authenticated', () => {
    const req = { isAuthenticated: () => false };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    isLoggedIn(req, res, next);
console.log('redirect mock calls:', res.redirect.mock.calls);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
});
});

describe('isAdmin Middleware', () => {
    test('should call next() if user is admin', () => {
        const req = { user: {is_admin: true}};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        isAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('should return 403 if user is not an admin', ()=> {
        const req = {user: {is_admin: false}};
        const res = {status: jest.fn().mockReturnThis(), 
            json: jest.fn ()};
        const next = jest.fn();

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({error: 'Access denied'})
        expect(next).not.toHaveBeenCalled();
    })
});

//API endpoint unit test

jest.mock('passport');

/*describe('POST/login', ()=>{
let req, res, next;
beforeEach(() => {
    res= {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    next = jest.fn();
    req = {login: jest.fn() };
           
})
    test('calls next(err) when there is internal error', async() => {
      passport.authenticate.mockImplementation((strategy, cb) => () => cb(new Error('internal error')));
      await userLogin(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('returns 401 when user is not authenticated', async()=> {
 passport.authenticate.mockImplementation((strategy, cb) => () => cb(null, false));
      await userLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Invalid email or password"});
        expect(next).not.toHaveBeenCalled();
    });

    test('return JSON when login is successful', async() => {
          const user = { id: 1, email: 'test@example.com'};
        passport.authenticate.mockImplementation((strategy, cb) => () => cb(null, user));
      req.login.mockImplementation((user, cb) => cb(null));//simulate successfl login
       await userLogin(req, res, next);

        expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login successful',
            user:{id: 1, email: 'test@example.com'}

        });
    });

});*/

//unit test for browser redirect
describe('POST/login logic for browser redirect', () =>{
    let req, res, next;
beforeEach(() => {
    res= {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn()
    };
    next = jest.fn();
    req = {login: jest.fn() };

});


test('redirect to profile when login is successfull', async() => {
          const user = { id: 1, email: 'test@example.com'};
passport.authenticate.mockImplementation((strategy, cb) => (req, res, next) => {
  cb(null, user); // simulate successful authentication
});

      req.login.mockImplementation((user, cb) => cb(null));//simulate successfl login
        await userBrowserLogin(req, res, next);

        expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
        expect(res.redirect).toHaveBeenCalledWith('/profile')

    });

})

//logout unit test

describe('GET/logout', () => {
    let req, res, next;

    beforeEach(() => {
        req = {logout: jest.fn() };
        res = {json: jest.fn(), redirect: jest.fn() };
        next = jest.fn();

       });

    test('returns successful logout message and redirects to homepage', () => {
        req.logout.mockImplementation((cb) => cb(null)); //simulate logout
        userLogout(req, res, next);

        expect(req.logout).toHaveBeenCalledWith(expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({message: "Logged out successfully"});
        expect(res.redirect).toHaveBeenCalledWith('/')
        expect(next).not.toHaveBeenCalled()
    });

    test('calls next(err) if logout throws error', () => {
        const error = new Error('Logout failed');
        req.logout.mockImplementation((cb) => cb(error));
        userLogout(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    })
});

//unit test for register 


describe('POST/register', () => {
let req, res, next;

beforeEach(() => {
    req ={ body: {username: 'Liz', email: 'new@example.com', password: '123' } };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
          };
    next= jest.fn();

    Users.findByEmail.mockReset();
    Users.createUser.mockReset();
    passwordHash.mockReset();
  

});

    test('returns 400 if email/passw0rd/username/ is missing', async() =>{
req.body = {email: ''}; // missing password
await registerNewUser(req, res, next);

expect(res.status).toHaveBeenCalledWith(400);
expect(res.json).toHaveBeenCalledWith({error: "Email and Password required"})
    });

   
    test('returns 409 if user already exists', async() => {

Users.findByEmail.mockResolvedValue({id: 2, username: 'zee', email: 'test@example.com', is_admin: false});
await registerNewUser(req, res, next);

expect(Users.findByEmail).toHaveBeenCalledWith('new@example.com');
expect(res.status).toHaveBeenCalledWith(409);
expect(res.json).toHaveBeenCalledWith({message: 'User already exists'});
expect(Users.createUser).not.toHaveBeenCalled();
});


    test('calls next(err) if password is not hashed', async() => {
Users.findByEmail.mockResolvedValue(null);
 passwordHash.mockResolvedValue(null);

await registerNewUser(req, res, next);
expect(next).toHaveBeenCalledWith(expect.any(Error))
expect(Users.createUser).not.toHaveBeenCalled();
    });

    test('returns 201 and successful message if user is created successfully',  async () => {
Users.findByEmail.mockResolvedValue(null);
Users.createUser.mockResolvedValue({id: 2, username: 'Liz', email: 'new@example.com', is_admin: false});
passwordHash.mockResolvedValue('hashed_pw')//simulate hashing
await registerNewUser(req, res, next);

expect(Users.findByEmail).toHaveBeenCalledWith('new@example.com');
expect(passwordHash).toHaveBeenCalledWith('123', 10)
expect(Users.createUser).toHaveBeenCalledWith('Liz', 'new@example.com','hashed_pw', false)
expect(res.status).toHaveBeenCalledWith(201);
expect(res.json).toHaveBeenCalledWith({
    message: 'User registered successfully',
    user:{id: 2, username: 'Liz', email: 'new@example.com', is_admin: false}
})
    });

});


// Unit test CRUD operation



describe('access to profile', ()=>{
    const req ={};
    const res= {status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    

    beforeEach(() => {
        pool.query.mockReset();
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();

    });

    test('returns 200 and list of users on success', async()=> {
        pool.query.mockResolvedValue({
            rows: [
                {id: 1, username: 'Liz', email: 'liz@example.com'},
                {id: 2, username: 'John', email: 'john@example.com'}
            ]
        });

        await getAllProfilesByAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            users: [
                {id: 1, username: 'Liz', email: 'liz@example.com'},
                {id: 2, username: 'John', email: 'john@example.com'}

            ]
        })
    });

    test('calls next(err) if query fails', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getAllProfilesByAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});


describe('GET/admin gets users by ID', () => {
    let req, res, next;
    const mockUser = { id: 1, username: 'Liz', email: 'liz@example.com'};


     beforeEach(() => {
        req ={
        params: { id: '1'},
        user: { id: 1, is_admin: true}
    };

    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    next = jest.fn();


        pool.query.mockReset();
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();
});

     test('returns 200 and the user data if user exists', async () => {
        pool.query.mockResolvedValue({ rows: [mockUser]});

        await getUserById(req, res, next);

        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
     })

     test('calls next(err) if query fails', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getUserById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     })
});

describe('PUT/user update info by ID', () => {
    let req, res, next;

    beforeEach(() => {
        pool.query.mockReset();
        passwordHash.mockReset();

        req = {params: { id: '42'}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        });

    test('returns 404 when no fields provided', async () => {
        req.body = {};

        await updateUserRoute(req,res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({error: "No field provided"});
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('calls next(err) when password hashing fails', async () => {
        req.body = { password: 'secret' };
        passwordHash.mockResolvedValue(null);

        await updateUserRoute(req, res, next);

        expect(passwordHash).toHaveBeenCalledWith('secret', 10);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 if UPDATE returns no rows (user not found', async () => {
        req.body = { username: 'username'};

        const expectedQuery = 'UPDATE users SET username = $1 WHERE id = $2 RETURNING *';
        pool.query.mockResolvedValue({rows: []}); // no rows -> not found

        await updateUserRoute(req, res, next);

        expect(pool.query).toHaveBeenCalledWith(expectedQuery, ['username', '42']);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({error: "User not found"});
    });

    test('sucessful update: calls pool.query and returns updated user', async () => {
        req.body= { username: 'alice', email: 'alice@example.com', password: 'pw'};
        const expectedQuery = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *';
        passwordHash.mockResolvedValue('hashed_pw');
        const updatedUser = { id: 42, username: 'alice', email: 'alice@example.com'};
        pool.query.mockResolvedValue({ rows: [updatedUser]});

        await updateUserRoute(req, res, next);

        expect(passwordHash).toHaveBeenCalledWith('pw', 10);
        expect(pool.query).toHaveBeenCalledWith(expectedQuery, ['alice', 'alice@example.com', 'hashed_pw', '42']);
        expect(res.json).toHaveBeenCalledWith({
            message: "User updated successfully",
            user: updatedUser
        });
});
        test('calls next(err) if pool.query rejects', async () => {
            req.body = { username: 'bob'};
            const dbError = new Error('DB failed');
            pool.query.mockRejectedValue(dbError);

            await updateUserRoute(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });


    describe('DELETE/users info by ID', () => {
        let req, res, next;
        beforeEach( () => {
    req ={
        params: {id: 5},
        user: { is_admin: true}
    }

    res ={
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    next = jest.fn()

   pool.query.mockReset();
   pool.query.mockClear();

    
});

test('returns 200 if account got deleted successfully', async () => {
pool.query.mockResolvedValue({rows: 5});

await deleteUserPath(req, res, next);

expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = $1", [5]);
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({message: 'Account deleted successfully'})

        });

test('returns 404 if delete is unsuccessful', async() => {

pool.query.mockResolvedValue({rowCount: 0});

await deleteUserPath(req, res, next);

expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = $1", [5])
expect(res.status).toHaveBeenCalledWith(404);
expect(res.json).toHaveBeenCalledWith({error: 'Delete unsuccessful'});
});


test('calls next(err) if there is an internal failure', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await deleteUserPath(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });
    });
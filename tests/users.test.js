const request= require('supertest');
const {isLoggedIn, isAdmin} = require('../routes/users');
const passport = require('passport');
const User = require('../models/User');
const{ users } = require('../helperFunctions/helper');
const {passwordHash} = require('../passport')
passwordHash.mockResolvedValue('hashed_pw')//simulate hashing
const pool =require('../db');

jest.mock('../db', ()=>({
query:jest.fn()
}));

jest.mock('../models/User', ()=> ({
      findByEmail: jest.fn(),
  createUser: jest.fn()
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
describe('POST/login', ()=>{
let req, res, next, loginHandler;
beforeEach(() => {
    res= {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    next = jest.fn();
    req = {login: jest.fn() };

    loginHandler = (req, res, next) => {
         passport.authenticate("local", (err, user, info) => {
                if (err) return next(err); // handle internal errors
                if (!user) {
                    // Instead of redirecting, return JSON for Postman
                    return res.status(401).json({ message: "Invalid email or password" });
                }
        
                req.login(user, (err) => {
                    if (err) return next(err);
                    res.json({
                        message: "Login successful",
                        user: {
                            id: user.id,
                            email: user.email
                        }
                        
                    });
                });
            })(req, res, next);
           
    }
})
    test('calls next(err) when there is internal error', () => {
      passport.authenticate.mockImplementation((strategy, cb) => () => cb(new Error('internal error')));
      loginHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('returns 401 when user is not authenticated', ()=> {
 passport.authenticate.mockImplementation((strategy, cb) => () => cb(null, false));
      loginHandler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message: "Invalid email or password"});
        expect(next).not.toHaveBeenCalled();
    });

    test('return JSON when login is successful', () => {
          const user = { id: 1, email: 'test@example.com'};
        passport.authenticate.mockImplementation((strategy, cb) => () => cb(null, user));
      req.login.mockImplementation((user, cb) => cb(null));//simulate successfl login
        loginHandler(req, res, next);

        expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login successful',
            user:{id: 1, email: 'test@example.com'}

        });
    });

});

//unit test for browser redirect
describe('POST/login logic for browser redirect', () =>{
    let req, res, next, loginHandler;
beforeEach(() => {
    res= {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn()
    };
    next = jest.fn();
    req = {login: jest.fn() };

    
    loginHandler = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/login');
   req.login(user, (err) =>{
    if(err) return next(err);
    res.json({ //using json for the sake of postman testing because it doesnt follow redirects like a browser does. 
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email
        },
    })
    res.redirect("/profile"); //if login succeeds,redirect to user profile
});
})(req, res, next);
    };
});


test('redirect to profile when login is successfull', () => {
          const user = { id: 1, email: 'test@example.com'};
        passport.authenticate.mockImplementation((strategy, cb) => () => cb(null, user));
      req.login.mockImplementation((user, cb) => cb(null));//simulate successfl login
        loginHandler(req, res, next);

        expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login successful',
            user:{id: 1, email: 'test@example.com'}

        });
        expect(res.redirect).toHaveBeenCalledWith('/profile')

    });

})

//logout unit test

describe('GET/logout', () => {
    let req, res, next, logoutHandler

    beforeEach(() => {
        req = {logout: jest.fn() };
        res = {json: jest.fn(), redirect: jest.fn() };
        next = jest.fn();

        //logout handler
        logoutHandler = (req, res, next) => {
            req.logout(function(err){
        if(err) {return next(err); }
        res.json({message: "Logged out successfully"})
    });
    res.redirect('/') //browser option

        }
    });

    test('returns successful logout message and redirects to homepage', () => {
        req.logout.mockImplementation((cb) => cb(null)); //simulate logout
        logoutHandler(req, res, next);

        expect(req.logout).toHaveBeenCalledWith(expect.any(Function));
        expect(res.json).toHaveBeenCalledWith({message: "Logged out successfully"});
        expect(res.redirect).toHaveBeenCalledWith('/')
        expect(next).not.toHaveBeenCalled()
    });

    test('calls next(err) if logout throws error', () => {
        const error = new Error('Logout failed');
        req.logout.mockImplementation((cb) => cb(error));
        logoutHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    })
});

//unit test for register 


describe('POST/register', () => {
let req, res, next, registerHandler;

beforeEach(() => {
    req ={ body: {username: 'Liz', email: 'new@example.com', password: '123' } };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
          };
    next= jest.fn();

    User.findByEmail.mockReset();
    User.createUser.mockReset();
    passwordHash.mockReset();
  

    registerHandler = async (req, res, next) => {
        try {
            let { username, email, password, is_admin} = req.body
    if(!username || !email || !password){
       return res.status(400).json({error: "Email and Password required"})
    };

    is_admin= is_admin === true || is_admin === 'true';

    //check if user already exists
   const existingUser = await User.findByEmail(email);
    if(existingUser){
       res.status(409).json({message:'User already exists'})
    }

    //hash paassword
    const hashedPassword = await passwordHash(password, 10);
    if(!hashedPassword) {
        return next(new Error('Password hashing failed'))
    };

    //create a new user
    const newUser = await User.createUser(username, email, hashedPassword, is_admin);
        
        res.status(201).json({message: "User registered successfully", user: newUser});
    
}catch (err) {
    next(err)
};
    };
});

    test('returns 400 if email/passw0rd/username/ is missing', async() =>{
req.body = {email: ''}; // missing password
await registerHandler(req, res, next);

expect(res.status).toHaveBeenCalledWith(400);
expect(res.json).toHaveBeenCalledWith({error: "Email and Password required"})
    });

   
    test('returns 409 if user already exists', async() => {

User.findByEmail.mockResolvedValue({id: 2, username: 'zee', email: 'test@example.com', is_admin: false});
await registerHandler(req, res, next);

expect(User.findByEmail).toHaveBeenCalledWith('new@example.com');
expect(res.status).toHaveBeenCalledWith(409);
expect(res.json).toHaveBeenCalledWith({message: 'User already exists'});
expect(User.createUser).not.toHaveBeenCalled();
});


    test('return next(err) if password is not hashed', async() => {
User.findByEmail.mockResolvedValue(null);
 passwordHash.mockResolvedValue(null);

await registerHandler(req, res, next);
expect(next).toHaveBeenCalledWith(expect.any(Error))
expect(User.createUser).not.toHaveBeenCalled();
    });

    test('returns 201 and successful message if user is created successfully',  async () => {
User.findByEmail.mockResolvedValue(null);
User.createUser.mockResolvedValue({id: 2, username: 'Liz', email: 'new@example.com', is_admin: false});
passwordHash.mockResolvedValue('hashed_pw')//simulate hashing
await registerHandler(req, res, next);

expect(User.findByEmail).toHaveBeenCalledWith('new@example.com');
expect(passwordHash).toHaveBeenCalledWith('123', 10)
expect(User.createUser).toHaveBeenCalledWith('Liz', 'new@example.com','hashed_pw', false)
expect(res.status).toHaveBeenCalledWith(201);
expect(res.json).toHaveBeenCalledWith({
    message: 'User registered successfully',
    user:{id: 2, username: 'Liz', email: 'new@example.com', is_admin: false}
})
    });

});


// Unit test CRUD operation



describe('only admin getting all users profile', ()=>{
    const req ={};
    const res= {status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    let getUsersHandler;

    beforeEach(() => {
        pool.query.mockReset();
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();

         getUsersHandler = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users");
    res.status(200).json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

    });

    test('returns 200 and list of users on success', async()=> {
        pool.query.mockResolvedValue({
            rows: [
                {id: 1, username: 'Liz', email: 'liz@example.com'},
                {id: 2, username: 'John', email: 'john@example.com'}
            ]
        });

        await getUsersHandler(req, res, next);

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

        await getUsersHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});


describe('GET/admin gets users by ID', () => {
    let req, res, next, getUserByIdHandler;
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

getUserByIdHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (req.user.id !== parseInt(userId) && result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

     });

     test('returns 200 and the user data if user exists', async () => {
        pool.query.mockResolvedValue({ rows: [mockUser]});

        await getUserByIdHandler(req, res, next);

        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
     })

     test('calls next(err) if query fails', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await getUserByIdHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     })
});

describe('PUT/user update info by ID', () => {
    let req, res, next, updateHandler;

    beforeEach(() => {
        pool.query.mockReset();
        passwordHash.mockReset();

        req = {params: { id: '42'}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        updateHandler = async (req, res, next) => {
            try {
    const userId = req.params.id;
    const {id, username, email, password} = req.body;
    const fields = [];
    const values = [];
    let idx =1;

    if(username){fields.push(`username = $${idx++}` ); values.push(username)};
    if(email){fields.push(`email = $${idx++}` ); values.push(email)};
    
    //hash paassword
    if(password){
    const hashedPassword = await passwordHash(password, 10);
    if(!hashedPassword) {
        return next(new Error('Password hashing failed'))
    };
    fields.push(`password = $${idx++}` ); values.push(hashedPassword)
}

if(fields.length === 0 ) {
    return res.status(404).json({error: "No field provided"});
}
values.push(userId);
const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

const result = await pool.query(query, values);

if (result.rows.length === 0) {
  return res.status(404).json({error: "User not found"})
} 
 res.json({message: "User updated successfully", user: result.rows[0]});
} catch (err) {
  next(err)
}
        }
    });

    test('returns 404 when no fields provided', async () => {
        req.body = {};

        await updateHandler(req,res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({error: "No field provided"});
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('calls next(err) when password hashing fails', async () => {
        req.body = { password: 'secret' };
        passwordHash.mockResolvedValue(null);

        await updateHandler(req, res, next);

        expect(passwordHash).toHaveBeenCalledWith('secret', 10);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 404 if UPDATE returns no rows (user not found', async () => {
        req.body = { username: 'username'};

        const expectedQuery = 'UPDATE users SET username = $1 WHERE id = $2 RETURNING *';
        pool.query.mockResolvedValue({rows: []}); // no rows -> not found

        await updateHandler(req, res, next);

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

        await updateHandler(req, res, next);

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

            await updateHandler(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });


    describe('DELETE/users info by ID', () => {
        let req, res, next, deleteUser;
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

    deleteUser = async (req, res, next) => {
        try{
const userId = req.params.id;
const result = await pool.query("DELETE FROM users WHERE id = $1", [userId])
if (result.rowCount === 0) {
    return res.status(404).json({error: "Delete unsuccessful"})
}
res.status(200).json({message: "Account deleted successfully"}); 
} catch (err) {
    next(err)
}
    }
});

test('returns 200 if account got deleted successfully', async () => {
pool.query.mockResolvedValue({rows: 5});

await deleteUser(req, res, next);

expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = $1", [5]);
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({message: 'Account deleted successfully'})

        });

test('returns 404 if delete is unsuccessful', async() => {

pool.query.mockResolvedValue({rowCount: 0});

await deleteUser(req, res, next);

expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = $1", [5])
expect(res.status).toHaveBeenCalledWith(404);
expect(res.json).toHaveBeenCalledWith({error: 'Delete unsuccessful'});
});


test('calls next(err) if there is an internal failure', async () => {
        const error = new Error('DB failure');
        pool.query.mockRejectedValue(error);

        await deleteUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
     });
    });
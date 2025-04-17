import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import bcrypt from 'bcrypt'
const saltRounds = 16;
//import crypto from 'crypto'


// VERIFY EMAIL route
router
  .route('/verifyEmail')
  .get(async (req, res) => {
    try {
      // Get the token from the verification email link
      const verificationToken = req.query.token;
      let signupUser = await userData.getUserByVerificationToken(verificationToken);
      // User could not be found
      if (!signupUser) {
        res.status(400).json({error: 'Invalid verification token!'});
        return;
      }
      // Update the user signing up to mark them as verified!
      signupUser = await userData.verifyUserSignup(signupUser._id);
      res.render('users/login', {title: "EatWithMe login"});
      return;
    } catch (e) {
      res.status(400).json({error: e});
    }
  });


// SIGNUP routes
router
  .route('/signup')
  .get(async (req, res) => {
    // Render the signup page
    try {
      res.render('users/signup', {title: "EatWithMe signup"});
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  })
  .post(async (req, res) => {
    // Create a new user via signup page
    let user = req.body;
    let errors = [];
    // Validate all user fields
    try {
      user.firstName = helper.checkName(user.firstName, 'firstName', 'POST /users');
    } catch (e) {
      errors.push(e);
    }
    try {
      user.lastName = helper.checkName(user.lastName, 'lastName', 'POST /users');
    } catch (e) {
      errors.push(e);
    }
    try{
      user.email = helper.checkEmail(user.email);
    } catch (e) {
      errors.push(e);
    }
    let allUsers;
    try {
      allUsers = await userData.getAllUsers();
    } catch (e) {
      errors.push(e);
    }
    try {
      user.username = helper.checkString(user.username, 'username');
    } catch (e) {
      errors.push(e);
    }
    try {
      user.password = helper.checkPassword(user.password);
    } catch (e) {
      errors.push(e);
    }
    try {
      // Check if a user already exists with the given email or username
      for (let i = 0; i < allUsers.length; i++) {
        if (user.email === allUsers[i].email) throw new Error(`User with email '${user.email}' already exists!`);
        if (user.username === allUsers[i].username) throw new Error(`User with username '${user.username}' already exists!`);
      }
    } catch (e) {
      errors.push(e);
    }
    // If there are errors, reload the signup page and display the errors
    if (errors.length > 0) {
      res.render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: errors,
        hasErrors: true
      });
      return;
    }
    try {
      // Create the new user
      let newUser = await userData.createUser(
        user.firstName,
        user.lastName,
        user.email,
        user.username,
        user.password,
      )
      // Send the verification email
      await helper.sendVerificationEmail(newUser._id);
      res.render('users/login', {title: "EatWithMe login"});
      // Redirect the '/verify' route and wait for user to click the email
      //res.render('users/verify', {email: newUser.email});
    } catch (e) {
      res.status(500).json({error: e});
    }
});



// LOGIN routes
router
  .route('/login')
  .get(async (req, res) => {
    // Render the login page
    try {
      res.render('users/login', {title: "EatWithMe login"});
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  })
  .post(async (req, res) => {
    // Attempt to login given user input
    const user = req.body;
    let errors = [];
    let email, password;
    try {
      email = helper.checkEmail(user.email);
    } catch (e) {
      errors.push(e);
    }
    try {
      password = helper.checkString(user.password, 'password');
    } catch (e) {
      errors.push(e);
    }
    if (errors.length > 0) {
      // Render login if invalid input supplied
      res.render('users/login', {
        title: "EatWithMe login",
        user: {email},
        errors: errors,
        hasErrors: true,
      });
      return;
    }
    try {
      let allUsers = await userData.getAllUsers();
      // Make sure a user exists with this email
      for (let i = 0; i < allUsers.length; i++) {
        // Compare the user's hashed password
        let comparePasswords = await bcrypt.compare(password, allUsers[i].password);
        // Render user's profile page
        if (email === allUsers[i].email && comparePasswords) {
          // ** Make sure the user is verified before they're allowed to log in! **
          if (allUsers[i].isVerified) {
            //res.render('users/profile', {title: "EatWithMe Profile", user: allUsers[i]});
            // Store the user's information in the session
            req.session.user = {
              _id: allUsers[i]._id.toString(),
              username: allUsers[i].username,
              email: allUsers[i].email
            }
            res.redirect(`/profile`); // Redirect the user to the profile route
            return;
          } else {
            // Reload the login page if the user is not verified
            errors.push("Invalid login credentials or account not verified.");
            res.render('users/login', {
              title: "EatWithMe login",
              user: {email},
              hasErrors: true,
              errors: errors
            });
            return;
          }
        }
      }
      errors.push('Invalid login credentials.');
    } catch (e) {
      errors.push(e)
    }
    try {
      if (errors.length > 0) {
        // Render login if invalid input supplied
        res.render('users/login', {
          title: "EatWithMe login",
          user: {email},
          errors: errors,
          hasErrors: true,
        });
        return;
      }
    } catch (e) {
      res.status(500).json({error: e.message});
    }
  });






router
  .route('/')
  .get(async (req, res) => {
    // Get all users
    let user = req.body;
    let errors = [];
    try {
      let userList = await userData.getAllUsers();
    } catch (e) {
      res.status(500).json({error: e.message});
    }
    // TODO
  });



router
  .route('/:id') //gets profile page 
  .get(async (req, res) => {
    // GET /users/:id
    try {
      req.params.id = helper.checkId(req.params.id, 'GET /users/:id');
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
    try {
      const user = await userData.getUserById(req.params.id);
      // Render the user's profile page
      res.render('users/profile', {title: "EatWithMe Profile", user: user});
    } catch (e) {
      return res.status(404).json({error: e.message});
    }
  })
  .put(async (req, res) => {
    // Allow user to change their username
    let info = req.body;
    try {
      req.params.id = helper.checkId(req.params.id, 'PUT /users/:id');
      info.username = helper.checkString(info.username, 'username', 'PUT /users/:id');
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
    try {
      const user = await userData.updateUsername(
        req.params.id,
        info.username
      );
      return res.status(200).json(user);
    } catch (e) {
      return res.status(404).json({error: e.message});
    }
  })
  .patch(async (req, res) =>{
    // Allow user to change their username
    //TODO
  })
  .delete(async (req, res) => {
    // Delete the user with the given id
    try {
      req.params.id = helper.checkId(req.params.id, 'DELETE /users/:id');
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
    // Attemp to delete the user
    try {
      let user = await userData.removeUser(req.params.id);
      return res.json(user);
    } catch (e) {
      return res.status(404).send({error: e.message});
    }
  })


export default router;
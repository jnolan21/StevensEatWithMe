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
      res.render('users/login', {title: "EatWithMe login", partial: 'loginScript', isLoggedIn: !!req.session.user});
      return;
    } catch (e) {
      res.status(400).json({error: e.message});
    }
  });


// SIGNUP routes
router
  .route('/signup')
  .get(async (req, res) => {
    // Render the signup page
    try {
      res.render('users/signup', {title: "EatWithMe signup", partial: 'signupScript', isLoggedIn: !!req.session.user});
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
    try {
      user.username = helper.checkUsername(user.username);
    } catch (e) {
      errors.push(e);
    }
    try {
      user.password = helper.checkPassword(user.password);
    } catch (e) {
      errors.push(e);
    }
    try {
      user.passwordConfirm = helper.checkPassword(user.passwordConfirm);
    } catch (e) {
      errors.push(e);
    }
    // Make sure password === passwordConfirm
    if (user.password !== user.passwordConfirm) errors.push("Password and confirm password must match.");
    // If there are errors, reload the signup page and display the errors
    if (errors.length > 0) {
      res.render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: errors,
        hasErrors: true,
        partial: 'signupScript',
        isLoggedIn: !!req.session.user
      });
      return;
    }
    // Get all users
    let allUsers;
    try {
      allUsers = await userData.getAllUsers();
    } catch (e) {
      errors.push(e);
    }
    try {
      // Check if a user already exists with the given email or username
      for (let i = 0; i < allUsers.length; i++) {
        if (user.email.toLowerCase() === allUsers[i].email.toLowerCase()) throw new Error(`User with email '${user.email}' already exists!`);
        if (user.username.toLowerCase() === allUsers[i].username.toLowerCase()) throw new Error(`User with username '${user.username}' already exists!`);
      }
    } catch (e) {
      errors.push(e);
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
      res.render('users/verify', {title: "EatWithMe login", partial: 'signupScript', isLoggedIn: !!req.session.user});
      // Redirect the '/verify' route and wait for user to click the email
      //res.render('users/verify', {email: newUser.email});
    } catch (e) {
      res.status(500).json({error: e.message});
    }
});



// LOGIN routes
router
  .route('/login')
  .get(async (req, res) => {
    // Render the login page
    try {
      res.render('users/login', {title: "EatWithMe login", partial: 'loginScript', isLoggedIn: !!req.session.user});
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
        partial: 'loginScript',
        isLoggedIn: !!req.session.user
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
        if (email.toLowerCase() === allUsers[i].email.toLowerCase() && comparePasswords) {
          // ** Make sure the user is verified before they're allowed to log in! **
          if (allUsers[i].isVerified) {
            // Store the user's information in the session
            req.session.user = {
              _id: allUsers[i]._id.toString(),
              firstName: allUsers[i].firstName,
              lastName: allUsers[i].lastName,
              username: allUsers[i].username,
              email: allUsers[i].email,
              isAdmin: allUsers[i].isAdmin || false
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
              errors: errors,
              partial: 'loginScript',
              isLoggedIn: !!req.session.user
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
          isLoggedIn: !!req.session.user
        });
        return;
      }
    } catch (e) {
      res.status(500).json({error: e.message});
    }
  });


/* Log out */
router
  .route('/logout')
  .get(async (req, res) => {
    req.session.destroy();
    return res.redirect('/');
  });





export default router;

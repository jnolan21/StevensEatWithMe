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
      // Determine if an admin is logged in
      let isAdmin;
      if (req.session.user) {
        if (req.session.user.isAdmin) isAdmin = true;
        else isAdmin = false;
      }
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
      res.render('users/login', {title: "EatWithMe login", partial: 'loginScript', isLoggedIn: !!req.session.user, isAdmin});
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
      // Determine if an admin is logged in
      let isAdmin;
      if (req.session.user) {
        if (req.session.user.isAdmin) isAdmin = true;
        else isAdmin = false;
      }
      res.render('users/signup', {title: "EatWithMe signup", partial: 'signupScript', isLoggedIn: !!req.session.user, isAdmin});
    } catch (e) {
      return res.status(400).json({error: e.message});
    }
  })
  .post(async (req, res) => {
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    // Create a new user via signup page
    let user = req.body;
    let errors = [];
    // Validate all user fields
    try {
      user.firstName = helper.checkName(user.firstName, 'firstName', 'POST /users');
    } catch (e) {
      errors.push(e.message);
    }
    try {
      user.lastName = helper.checkName(user.lastName, 'lastName', 'POST /users');
    } catch (e) {
      errors.push(e.message);
    }
    try{
      user.email = helper.checkEmail(user.email);
    } catch (e) {
      errors.push(e.message);
    }
    try {
      user.username = helper.checkUsername(user.username);
    } catch (e) {
      errors.push(e.message);
    }
    try {
      user.password = helper.checkPassword(user.password);
    } catch (e) {
      errors.push(e.message);
    }
    try {
      user.passwordConfirm = helper.checkPassword(user.passwordConfirm);
    } catch (e) {
      errors.push(e.message);
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
        isLoggedIn: !!req.session.user,
        isAdmin
      });
      return;
    }
    // Get all users
    let allUsers;
    try {
      allUsers = await userData.getAllUsers();
    } catch (e) {
      errors.push(e.message);
    }
    try {
      // Check if a user already exists with the given email or username
      for (let i = 0; i < allUsers.length; i++) {
        if (user.email.toLowerCase() === allUsers[i].email.toLowerCase()) throw new Error(`User with email '${user.email}' already exists!`);
        if (user.username.toLowerCase() === allUsers[i].username.toLowerCase()) throw new Error(`User with username '${user.username}' already exists!`);
      }
    } catch (e) {
      errors.push(e.message);
    }
    // If there are errors, reload the signup page and display the errors
    if (errors.length > 0) {
      return res.status(400).render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: errors,
        hasErrors: true,
        partial: 'signupScript',
        isLoggedIn: !!req.session.user,
        isAdmin
      });
    }
    let newUser;
    try {
      // Create the new user
      newUser = await userData.createUser(
        user.firstName,
        user.lastName,
        user.email,
        user.username,
        user.password,
      )
    } catch (e) {
      return res.status(400).render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: errors,
        hasErrors: true,
        partial: 'signupScript',
        isLoggedIn: !!req.session.user,
        isAdmin
      });
    }
    try {
      // Send the verification email
      await helper.sendVerificationEmail(newUser._id);
      res.render('users/verify', {title: "EatWithMe login", partial: 'signupScript', isLoggedIn: !!req.session.user, isAdmin});
      // Redirect the '/verify' route and wait for user to click the email
      //res.render('users/verify', {email: newUser.email});
    } catch (e) {
      return res.status(500).render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: [e.message],
        hasErrors: true,
        partial: 'signupScript',
        isLoggedIn: !!req.session.user,
        isAdmin
      });
    }
});



// LOGIN routes
router
  .route('/login')
  .get(async (req, res) => {
    // Render the login page
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    try {
      res.render('users/login', {title: "EatWithMe login", partial: 'loginScript', isLoggedIn: !!req.session.user, isAdmin});
    } catch (e) {
      return res.status(500).render('users/login', {
        title: "EatWithMe login",
        errors: [e.message],
        partial: 'loginScript',
        hasErrors: true,
        isLoggedIn: !!req.session.user,
        isAdmin
      });
    }
  })
  .post(async (req, res) => {
    // Attempt to login given user input
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    const user = req.body;
    let errors = [];
    let email, password;
    try {
      email = helper.checkEmail(user.email);
    } catch (e) {
      errors.push(e.message);
    }
    try {
      password = helper.checkString(user.password, 'password');
    } catch (e) {
      errors.push(e.message);
    }
    if (errors.length > 0) {
      // Render login if invalid input supplied
      return res.render('users/login', {
        title: "EatWithMe login",
        email: email,
        errors: errors,
        hasErrors: true,
        partial: 'loginScript',
        isLoggedIn: !!req.session.user,
        isAdmin
      });
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
            return res.redirect(`/profile`); // Redirect the user to the profile route
          } else {
            // Reload the login page if the user is not verified
            errors.push("Invalid login credentials or account not verified.");
            break;
          }
        }
      }
      if (errors.length === 0) errors.push('Invalid login credentials.');
    } catch (e) {
      errors.push(e.message)
    }
    // Render login if invalid input supplied
    return res.status(403).render('users/login', {
      title: "EatWithMe login",
      email: email,
      errors: errors,
      hasErrors: true,
      partial: 'loginScript',
      isLoggedIn: !!req.session.user,
      isAdmin
    });
  });


/* Log out */
router
  .route('/logout')
  .get(async (req, res) => {
    req.session.destroy();
    return res.redirect('/');
  });





export default router;

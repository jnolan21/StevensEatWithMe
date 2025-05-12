import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import bcrypt from 'bcrypt'
import xss from 'xss'


// VERIFY EMAIL route
router
  .route('/verifyEmail')
  .get(async (req, res) => {
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    // Get the token from the verification email link
    const verificationToken = xss(req.query.token);
    if (!verificationToken) {
      return res.status(400).render('errors/error', {
        title: "400 Bad Request",
        error: 'Verification token is missing.',
        status: 400
      });
    }
    let signupUser;
    try {
      signupUser = await userData.getUserByVerificationToken(verificationToken);
      // User could not be found
    } catch(e) {
        return res.status(404).render('errors/error', {
          title: "404 Page Not Found",
          error: 'Verification link is invalid.',
          status: 404
        });
      }
    try {
      // Update the user signing up to mark them as verified!
      signupUser = await userData.verifyUserSignup(signupUser._id);
      return res.redirect('/users/login');
    } catch (e) {
      return res.status(500).render('errors/error', {
        title: "500 Internal Server Error",
        error: e.message,
        status: 500
      });
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
      return res.render('users/signup', {title: "EatWithMe signup", partial: 'signupScript', isLoggedIn: !!req.session.user, isAdmin});
    } catch (e) {
      return res.status(500).render('errors/error', {
        title: "500 Internal Server Error",
        error: e.message,
        status: 500
      });
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
    let user = {
      firstName: xss(req.body.firstName),
      lastName: xss(req.body.lastName),
      email: xss(req.body.email),
      username: xss(req.body.username),
      password: xss(req.body.password),
      passwordConfirm: xss(req.body.passwordConfirm)
    }
    let errors = [];
    // Validate all user fields
    try {
      user.firstName = helper.checkName(user.firstName, 'First name');
    } catch (e) {
      errors.push(e.message);
    }
    try {
      user.lastName = helper.checkName(user.lastName, 'Last name');
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
    // Get all users
    let allUsers;
    try {
      allUsers = await userData.getAllUsers();
    } catch (e) {
      return res.status(500).render('errors/error', {
        title: "500 Internal Server Error",
        error: e.message,
        status: 500
      });
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
      return res.render('users/verify', {title: "EatWithMe Verify Email", isLoggedIn: !!req.session.user, isAdmin});
    } catch (e) {
      return res.status(500).render('users/signup', {
        title: "EatWithMe signup",
        user: user,
        errors: ['There was a problem sending the verification email. Please try again.'],
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
      return res.status(500).render('errors/error', {
        title: "500 Internal Server Error",
        error: e.message,
        status: 500
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
    const user = {
      email: xss(req.body.email),
      password: xss(req.body.password)
    }
    let errors = [];
    let email, password;
    try {
      email = helper.checkEmail(user.email);
    } catch (e) {
      errors.push(e.message);
    }
    try {
      password = helper.checkPassword(user.password);
    } catch (e) {
      errors.push(e.message);
    }
    if (errors.length > 0) {
      // Render login if invalid input supplied
      return res.status(400).render('users/login', {
        title: "EatWithMe login",
        email: user.email,
        errors: ['Invalid email or password.'],
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
        // Render user's profile page
        if (email.toLowerCase() === allUsers[i].email.toLowerCase()) {
          // Compare the user's hashed password
          let comparePasswords = await bcrypt.compare(password, allUsers[i].password);
          if (!comparePasswords) break; //if the passwords do not match then it goes to error
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
            errors.push("Invalid email or password.");
            break;
          }
        }
      }
      if (errors.length === 0) errors.push('Invalid email or password.');
    } catch (e) {
      errors.push('Server error during login. Please try again.');
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

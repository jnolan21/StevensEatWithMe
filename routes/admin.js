import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import rsvpData from "../data/rsvps.js";
import reviewData from '../data/reviews.js';
import restaurants from '../data/restaurants.js';
import menuItems from '../data/menuItems.js';
//import crypto from 'crypto'
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get the admin page
router
  .route('/')
  .get(async (req, res) => {
    // Verify that the user is logged in
    if (!req.session.user) {
        // 403 = forbidden page
        return res.status(403).redirect('/users/login');
    }
    // Verify that the user is an admin
    if (!req.session.user.isAdmin) {
        res.status(403).redirect('/profile')
    }

    let id = req.session.user._id;
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    try {
        id = helper.checkId(id);
    } catch (e) {
        // If the id is invalid, render the login page
        return res.status(400).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user,
            isAdmin
        })
    }

    // Get the user
    let user = req.session.user;

    // Get all users reviews
    let reviews = [];
    try{
        reviews = await reviewData.getAllReviewsWithInfo();
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }
    // Get all the users
    let allUsers = [];
    try {
        allUsers = await userData.getAllUsers();
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
    // Get all the restaurants
    let allRestaurants = [];
    try {
        allRestaurants = await restaurants.getAllRestaurants();
    } catch (e) {
        return res.status(500).json({error: e.message});
    }

    // Render the user's admin page
    try {
        res.render('users/admin', {
            title: "EatWithMe Admin Page",
            // Send the relevant information about the user
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                reviews: reviews // array of review objects
            },
            partial: 'adminScript',
            days: days,
            allUsers: allUsers,
            allRestaurants: allRestaurants,
            script: 'adminScript',
            isLoggedIn: !!req.session.user,
            isAdmin
        })
    } catch (e) {
        res.status(500).json({error: e.message});
    }

  });


/* Delete reviews */
router 
.post('/delete', async (req, res) => {
    try{
        //receive reviewId, userId and session.user.userId
        let reviewId = req.body.reviewId;
        let loggedInUserId = req.session.user._id;
        let reviewPosterId= req.body.userId; 
        await reviewData.deleteReview(reviewId);
        req.session.message = "Deleted Review!"; 
        res.redirect('/admin');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the review.";
        res.redirect('/admin');
    }
});



// Restaurant routes
router
  .route('/restaurant')
  .post(async (req, res) => {
    // Create a new restaurant
    let errors = [];
    // Verify all restaurant fields
    let restaurant = req.body;
    try {
        restaurant.name = helper.checkString(restaurant.name, 'Restaurant name');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.location = helper.checkString(restaurant.location, 'Restaurant location');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.typesOfFood = helper.stringToArray(restaurant.typesOfFood, 'Restaurant types of food');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.hoursOfOperation = helper.checkHoursOfOperation(restaurant.hoursOfOperation);
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.imageURL = helper.checkString(restaurant.imageURL, 'Restaurant image URL');
    } catch (e) {
        errors.push(e.message);
    }
    try {
        restaurant.dietaryRestrictions = helper.stringToArray(restaurant.dietaryRestrictions, 'Restaurant dietary restrictions');
    } catch (e) {
        errors.push(e.message);
    }
    // Get all users reviews
    let user = req.session.user;
    let reviews = [];
    try{
        reviews = await reviewData.getAllReviewsWithInfo();
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }
    // Reload with errors if needed
    if (errors.length > 0) {
        return res.render('users/admin', {
          title: "EatWithMe Admin Page",
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            reviews: reviews // array of review objects
          },
          errors: errors,
          hasErrors: true,
          partial: 'adminScript',
          days: days,
          isLoggedIn: !!req.session.user,
          isAdmin: true,
          // Submitted info
          name: restaurant.name,
          location: restaurant.location,
          typesOfFood: restaurant.typesOfFood,
          //hoursOfOperation: restaurant.hoursOfOperation,
          hoursOfOperation: restaurant.hoursOfOperation,
          imageURL: restaurant.imageURL,
          dietaryRestrictions: restaurant.dietaryRestrictions
        });
      }

    // Add the restaurant to the database
    try {
        await restaurants.createRestaurant(
            restaurant.name,
            restaurant.location,
            [],
            restaurant.typesOfFood,
            restaurant.hoursOfOperation,
            restaurant.imageURL,
            restaurant.dietaryRestrictions
        );
        return res.redirect('/admin');
    } catch (e) {
        req.session.message = e.message || "Server error.";
        return res.redirect('/admin');
    }
  });


export default router;
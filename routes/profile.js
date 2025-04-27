import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import rsvpData from "../data/rsvps.js";
import reviews from '../data/reviews.js';
import restaurants from '../data/restaurants.js';
import menuItems from '../data/menuItems.js';
//import crypto from 'crypto'


// General profile route
router
  .route('/')
  .get(async (req, res) => {
    // Verify that the user is logged in
    if (!req.session.user) {
        // 403 = forbidden page
        return res.status(403).redirect('users/signup');
    }

    let id = req.session.user._id;
    try {
        id = helper.checkId(id);
    } catch (e) {
        // If the id is invalid, render the login page
        return res.status(400).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user
        })
    }

    // Get the user
    let user;
    try {
        user = await userData.getUserById(id);
    } catch (e) {
        return res.status(404).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user
        })
    }
    // Get all of the users who follow this current user
    let followers;
    try {
        followers = await userData.getAllPeopleFollowingThisUser(id);
    } catch (e) {
        return res.status(400).json({error: e.message});
    }
    // Get all of the users this user is following
    let following;
    try {
        following = await userData.getFollowingList(id);
    } catch (e) {
        return res.status(400).json({error: e.message});
    }

    // Get the users RSVPS
    let userRSVPPosts = [];
    try{
        for (let i = 0; i < user.RSVP.length; i++) {
            userRSVPPosts.push(await rsvpData.getRsvpById(user.RSVP[i]));
        }
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }

    // Get the users reviews
    let userReviews = [];
    try{
        // Get all the information about the review: restaurant name, menu item name, etc.
        for (let i = 0; i < user.reviews.length; i++) {
            let review = await reviews.getReviewById(user.reviews[i]);
            // Get the name of the restaurant and menu item
            let restaurant = await restaurants.getRestaurantById(review.restaurantId);
            review['restaurantName'] = restaurant.name;
            if (review.menuItemId && review.menuItemId.trim() !== '') {
                let menuItem = await menuItems.getMenuItemById(review.menuItemId);
                review['menuItemName'] = menuItem.name;
            }
            userReviews.push(review);
        }
    }
    catch(e){
        return res.status(500).json({error: e.message});
    }

    // Render the user's profile page
    try {
        res.render('users/profile', {
            title: "EatWithMe Profile Page",
            // Send the relevant information about the user
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                following: following, // array of user objects
                followers: followers, // array of user objects
                RSVPposts: userRSVPPosts, // array of RSVP post objects
                currentRSVPs: userRSVPPosts, // array of RSVP post objects
                reviews: userReviews // array of review objects
            },
            isLoggedIn: !!req.session.user
        })
    } catch (e) {
        res.status(500).json({error: e.message});
    }

  });


export default router;

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
        return res.status(403).redirect('users/login');
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
    let user;
    try {
        user = await userData.getUserById(id);
    } catch (e) {
        return res.status(404).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user,
            isAdmin
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
    let currentRSVPPosts = [];
    try{
        for (let i = 0; i < user.RSVP.length; i++) {
            let curr1 = await rsvpData.getRsvpById(user.RSVP[i]);
            let curr2 = await rsvpData.getRsvpById(user.RSVP[i]);
            userRSVPPosts.push(curr1);
            currentRSVPPosts.push(curr2);
        }
        currentRSVPPosts = await helper.formatAndCheckRSVPS(currentRSVPPosts); //going to return any rsvp posts that are active AND posted by user or that hte user is attending with names instead of ids for posteduser, usersattending and restaurant
        //convert restaurantID and usersAttendingIds to names 
        for(let i =0; i< userRSVPPosts.length; i++){
            userRSVPPosts[i].restaurantId = (await restaurants.getRestaurantById(userRSVPPosts[i].restaurantId)).name;
            userRSVPPosts[i].user = (await userData.getUserById(userRSVPPosts[i].userId)).firstName
            let namesAttending = [];
            let userIdsAttending = userRSVPPosts[i].usersAttending; //get all IDS of users attending 
            for (let j=0 ;j<userIdsAttending.length; j++){
                let currUser = (await userData.getUserById(userIdsAttending[j])).firstName;
                namesAttending.push(currUser)
            }
            userRSVPPosts[i].usersAttending = namesAttending;
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
        const message = req.session.message || null;  
        req.session.message = null;   
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
                currentRSVPs: currentRSVPPosts, // array of RSVP post objects
                reviews: userReviews, // array of review objects
            },
            isLoggedIn: !!req.session.user,
            message: message,
            isAdmin
        })
    } catch (e) {
        res.status(500).json({error: e.message});
    }

  });
  router 
  .post('/delete', async (req, res) => {
    try{
        //receive reviewId, userId and session.user.userId
        let reviewId = req.body.reviewId;
        let loggedInUserId = req.session.user._id;
        let reviewPosterId= req.body.userId; 
        if(reviewPosterId !== loggedInUserId) throw "Error: User not authorized to delete this review."
        await reviews.deleteReview(reviewId);
        req.session.message = "Deleted Review!"; 
        res.redirect('/profile');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the review.";
        res.redirect('/profile');
    }
  });



export default router;

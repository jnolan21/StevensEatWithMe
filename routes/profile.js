import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
import rsvpData from "../data/rsvps.js";
import reviews from '../data/reviews.js';
import restaurants from '../data/restaurants.js';
import menuItems from '../data/menuItems.js';
import {ObjectId} from 'mongodb';
import xss from 'xss'
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
    if (!req.session.message) {req.session.formData = {}};

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
        return res.status(400).render('errors/error', {
            title: "400 Bad Request",
            error: e.message,
            status: 400
          });
        
    }
    // Get all of the users this user is following
    let following;
    try {
        following = await userData.getFollowingList(id);
    } catch (e) {
        return res.status(400).render('errors/error', {
            title: "400 Bad Request",
            error: e.message,
            status: 400
          });
    }

    // Get the users RSVPS
    let userRSVPPosts = [];
    let currentRSVPPosts = [];
    try{
        for (let i = 0; i < user.RSVP.length; i++) {
            try {
                let curr1 = await rsvpData.getRsvpById(user.RSVP[i]);
                let curr2 = await rsvpData.getRsvpById(user.RSVP[i]);
                userRSVPPosts.push(curr1);
                currentRSVPPosts.push(curr2);
            } catch (e) {
                // Skip this RSVP if it's not found
                continue;
            }
        }
        if (currentRSVPPosts.length > 0) {
            currentRSVPPosts = await helper.formatAndCheckRSVPS(currentRSVPPosts);
        }
        //convert restaurantID and usersAttendingIds to names
        for(let i = 0; i < userRSVPPosts.length; i++){
            try {
                userRSVPPosts[i].restaurantId = (await restaurants.getRestaurantById(userRSVPPosts[i].restaurantId)).name;
                userRSVPPosts[i].user = (await userData.getUserById(userRSVPPosts[i].userId)).firstName;
                let namesAttending = [];
                let userIdsAttending = userRSVPPosts[i].usersAttending; //get all IDS of users attending
                for (let j = 0; j < userIdsAttending.length; j++){
                    let currUser = (await userData.getUserById(userIdsAttending[j])).firstName;
                    namesAttending.push(currUser);
                }
                userRSVPPosts[i].usersAttending = namesAttending;
            } catch (e) {
                // Skip this RSVP if there's an error processing it
                continue;
            }
        }
    }
    catch(e){
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: 'Invalid session user ID. Please log out and log back in.',
            status: 400
          });
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
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }

    //Get the restaurants and menuItems for the create review
    let restaurantss;
    let menu = [];
    
    try {
        restaurantss = await restaurants.getAllRestaurants();
        for (let i = 0; i < restaurantss.length; i++) {
            restaurantss[i].menuItems.forEach((menuItem) => menu.push(menuItem));
        } 
    } catch(e) {
        res.status(404).res.render('errors/error', {
            title: "404 Page Not Found",
            error: "Restaurants could not be found",
            status: 404
        })
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
                _id: user._id
            },
            currUser: {
                _id: user._id,
                username: user.username
            },
            isLoggedIn: !!req.session.user,
            message: message,
            isAdmin,
            isOwnProfile: true,
            restaurant: restaurantss, 
            menuItem: menu,
            formData: req.session.formData || {}
        })
    } catch (e) {
        req.session.message = e.message || String(e);
        return res.status(500).render('errors/error', {
            title: "error",
            message: e.message || String(e),
            status: 500
        });
    }
    
  })
  .post(async (req, res) => {


    let restaurantId = xss(req.body.restaurantId);
    let menuId = xss(req.body.menuId) || null;
    let review = xss(req.body.review) || null;
    let rating = Number(xss(req.body.rating));
    let hour = xss(req.body.waitTimeHour);
    let minute = xss(req.body.waitTimeMinute);
    let waitTime = `${hour}h ${minute}min`;
    let anonymous = xss(req.body.anonymous) || "false";


    //console.log(restaurantId + " " + menuId + " " + review + " " + rating + " " + waitTime);

    try {
    restaurantId = helper.checkId(restaurantId);
    if (menuId !== null) menuId = helper.checkId(menuId);
    review = helper.checkReview(review);
    rating = helper.checkReviewRating(rating);
    waitTime = helper.checkWaitTime(waitTime);
    } catch(e) {
        req.body.formData = req.body;
        req.session.message = e.message || String(e);
        return res.redirect('/profile');
    }
    try {
        if (menuId) {
            let restaurant = await restaurants.getRestaurantById(restaurantId);
            const menuItem = restaurant.menuItems.find(
            m => m._id.toString() === menuId
            );
            if (!menuItem) {
            throw "Menu Item does not exist";
            }
        }
    } catch (e) {
        console.log(e);
        req.session.message  = e.message || String(e);
        req.session.formData = req.body;
        return res.redirect('/profile');
    }


    try {
        if (menuId !== null) {
            await reviews.createMenuItemReview(req.session.user._id, 
                                        restaurantId,
                                        menuId,
                                        review,
                                        rating,
                                        waitTime,
                                        anonymous);
        } else {
            await reviews.createRestaurantReview(req.session.user._id, 
                                        restaurantId,
                                        review,
                                        rating,
                                        waitTime,
                                        anonymous);
        }

        return res.redirect('/profile');
    } catch(e) {
        req.session.message = e.message || String(e);
        req.session.formData = req.body;
        return res.redirect('/profile');
    }


  });


  router 
  .post('/delete', async (req, res) => {
    try{
        //receive reviewId, userId and session.user.userId
        let reviewId = xss(req.body.reviewId);
        let loggedInUserId = req.session.user._id;
        let reviewPosterId= xss(req.body.userId); 
        if(reviewPosterId !== loggedInUserId) throw new Error("User not authorized to delete this review.")
        await reviews.deleteReview(reviewId);
        req.session.message = "Deleted Review!"; 
        res.redirect('/profile');
    }
    catch (e){
        req.session.message = e.message || "Something went wrong deleting the review.";
        res.status(400).redirect('/profile');
    }
  });
  router 
  .post('/edit', async (req, res) => {
    try{
        let properId = xss(req.body.properId);
        let isMenuItem = xss(req.body.isMenuItem);
        let restId = xss(req.body.restId);
        let anon = xss(req.body.editAnonymous || "false") === "true";
        //process the review changes here. check if wait time empty, if it is dont update. for rating and review grab the values and update. do type checking 
        if(xss(req.body.waitMinutes) == undefined || xss(req.body.waitHours) == undefined || xss(req.body.rating) == undefined ){
            throw new Error("Undefined fields when updating review.")
        }
        let minutes = (xss(req.body.waitMinutes)).toString().padStart(2, "0"); //make sure minutes is two digits 
        let rating = Number(xss(req.body.rating));
        let waitTime = xss(req.body.waitHours) + "h " + xss(req.body.waitMinutes) + "min" ;
        if(waitTime.trim() === "h min") waitTime = xss(req.body.oldTime);
        let review = (xss(req.body.comment)).trim();
        if(typeof review !== "string" || review === "") throw new Error("Review must be a string. Cannot be empty.")
        helper.checkreviewlength(review);
        let reviewId = xss(req.body.reviewId);
        //let anonymous = xss(req.body.anonymous);
        //update review: waittime, rating, review
        let oldReview = await reviews.getReviewById(reviewId); //make sure it exists 
        helper.checkWaitTime(waitTime);
        await reviews.updateReview(reviewId, {
            rating: rating,
            review: review,
            waitHours: waitTime,
            anonymous: anon
          },isMenuItem, properId, restId);
    

        req.session.message = "Updated Review!"
        res.redirect('/profile')
    }
    catch (e){
        req.session.message = e.message || "Something went wrong trying to edit the review.";
        res.status(400).redirect('/profile');
    }
  });
  router
  .route('/editReview').get( async (req, res) =>{
        try{
            //let reviewObj = helper.xssForObjects(req.query.revieww);
            let userId = xss(req.query.userId);
            let reviewId= xss(req.query.reviewId);
            let reviewComment = xss(req.query.reviewComment);
            reviewComment = reviewComment.trim()
            let reviewRating = xss(req.query.reviewRating);
            let reviewWaitTime = xss(req.query.reviewWaitTime);
            let reviewHours = helper.getHours(xss(req.query.reviewWaitTime));
            let reviewMinutes = helper.getMinutes(xss(req.query.reviewWaitTime));
            let reviewRestaurant = xss(req.query.reviewRestaurant)
            let reviewMenuItem = xss(req.query.reviewMenuItem)
            let properId = xss(req.query.properId);
            let isMenuItem = xss(req.query.isMenuItem);
            let restId = xss(req.query.restId);
            let r = await reviews.getReviewById(reviewId);
            let anonymous = r.anonymous;
            res.render('users/editReview', {
                title: "Edit Review",
                //reviewObj: reviewObj,
                userId: userId,
                reviewId: reviewId,
                reviewComment: reviewComment,
                reviewRating: reviewRating,
                reviewWaitTime: reviewWaitTime,
                reviewHours: reviewHours || 0,
                reviewMinutes: reviewMinutes || 0,
                reviewRestaurant: reviewRestaurant,
                reviewMenuItem: reviewMenuItem,
                properId: properId,
                isMenuItem: isMenuItem,
                isLoggedIn: !!req.session.user,
                restId: restId, 
                partial: 'editReviewScript',
                anonymous: anonymous
            }) //need to send it the review info so we can set up the review, maybe have an ol
        
        }
        catch(e){
            req.session.message = e.message || "Something went wrong trying to edit the review.";
            res.status(400).redirect('/profile');
        }
  });

// view other users' profiles
router
  .route('/:id')
  .get(async (req, res) => {
    // verify user is logged in
    if (!req.session.user) {
        return res.status(403).redirect('/users/login');
    }
    let targetUserId = xss(req.params.id);
    let currentUserId = req.session.user._id;
    let isAdmin = req.session.user.isAdmin || false;

    try {
        targetUserId = helper.checkId(targetUserId);
        currentUserId = helper.checkId(currentUserId);
    } catch (e) {
        return res.status(400).redirect('/users/login');
    }
    // get target user and current user
    let targetUser;
    let currentUser;
    try {
        targetUser = await userData.getUserById(targetUserId);
        currentUser = await userData.getUserById(currentUserId);
    } catch (e) {
        return res.status(404).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user,
            isAdmin
        });
    }
    // get followers and following for target user
    let followers;
    let following;
    try {
        followers = await userData.getAllPeopleFollowingThisUser(targetUserId);
        following = await userData.getFollowingList(targetUserId);
    } catch (e) {
        return res.status(400).render('errors/error', {
            title: "400 Cannot get Data",
            error: e.message || String(e),
            status: 400});
    }
    // get target user's rsvps
    let userRSVPPosts = [];
    let currentRSVPPosts = [];
    try {
        for (let i = 0; i < targetUser.RSVP.length; i++) {
            let curr1 = await rsvpData.getRsvpById(targetUser.RSVP[i]);
            userRSVPPosts.push(curr1);
            let curr2 = await rsvpData.getRsvpById(targetUser.RSVP[i]);
            currentRSVPPosts.push(curr2);
        }
        currentRSVPPosts = await helper.formatAndCheckRSVPS(currentRSVPPosts);
        
        for(let i = 0; i < userRSVPPosts.length; i++) {
            userRSVPPosts[i].restaurantId = (await restaurants.getRestaurantById(userRSVPPosts[i].restaurantId)).name;
            userRSVPPosts[i].user = (await userData.getUserById(userRSVPPosts[i].userId)).firstName;
            let namesAttending = [];
            let userIdsAttending = userRSVPPosts[i].usersAttending;
            for (let j = 0; j < userIdsAttending.length; j++) {
                let currUser = (await userData.getUserById(userIdsAttending[j])).firstName;
                namesAttending.push(currUser);
            }
            userRSVPPosts[i].usersAttending = namesAttending;
        }
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }

    // get the target user's reviews
    let userReviews = [];
    try {
        for (let i = 0; i < targetUser.reviews.length; i++) {
            let review = await reviews.getReviewById(targetUser.reviews[i]);
            let restaurant = await restaurants.getRestaurantById(review.restaurantId);
            review['restaurantName'] = restaurant.name;
            if (review.menuItemId && review.menuItemId.trim() !== '') {
                let menuItem = await menuItems.getMenuItemById(review.menuItemId);
                review['menuItemName'] = menuItem.name;
            }
            userReviews.push(review);
        }
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }

    // check if current user is following target user
    let isFollowing = currentUser.friends.includes(targetUserId);

    

    // render the profile page
    try {
        const message = req.session.message || null;
        req.session.message = null;
        res.render('users/profile', {
            title: `${targetUser.firstName}'s Profile`,
            user: {
                username: targetUser.username,
                firstName: targetUser.firstName,
                lastName: targetUser.lastName,
                following: following,
                followers: followers,
                RSVPposts: userRSVPPosts,
                currentRSVPs: currentRSVPPosts,
                reviews: userReviews,
                _id: targetUser._id
            },
            currUser: {
                _id: currentUser._id.toString(),
                username: currentUser.username
            },
            isLoggedIn: !!req.session.user,
            message: message,
            isAdmin,
            isFollowing,
            isOwnProfile: currentUserId === targetUserId,
        });
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }
  });
  router
  .post('/follow', async (req, res) => {
    try {
        const friendId = xss(req.body.friendId);
        const currUserId = xss(req.body.userId);
        const action = xss(req.body.action); // 'follow' or 'unfollow'

        // Validate IDs
        if (!friendId || !currUserId) {
            throw new Error("Both user IDs are required");
        }

        // Check if IDs are valid
        try {
            helper.checkId(friendId);
            helper.checkId(currUserId);
        } catch (e) {
            throw new Error("Invalid user ID format");
        }

        if(friendId === currUserId) throw new Error("Can only add other users, not yourself!");
        
        // Get current user to check if they're already following
        const currentUser = await userData.getUserById(currUserId);
        const isFollowing = currentUser.friends.includes(friendId);
        
        if (action === 'unfollow') {
            if (!isFollowing) {
                throw new Error("You are not following this user!");
            }
            await userData.removeFriend(currUserId, friendId);
            req.session.message = "Friend Removed!";
        } else {
            if (isFollowing) {
                throw new Error("You are already following this user!");
            }
            await userData.addFriend(currUserId, friendId);
            req.session.message = "Friend Added!";
        }
        
        res.redirect(`/profile/${friendId}`);
    }
    catch(e) {
        req.session.message = e.message || "Something went wrong. Cannot follow/unfollow this user.";
        res.redirect(`/profile/${xss(req.body.friendId)}`);
    }
  });

// view other users' profiles
router
  .route('/:id')
  .get(async (req, res) => {
    // verify user is logged in
    if (!req.session.user) {
        return res.status(403).redirect('/users/login');
    }
    let targetUserId = xss(req.params.id);
    let currentUserId = req.session.user._id;
    let isAdmin = req.session.user.isAdmin || false;

    try {
        targetUserId = helper.checkId(targetUserId);
        currentUserId = helper.checkId(currentUserId);
    } catch (e) {
        return res.status(400).redirect('/users/login');
    }
    // get target user and current user
    let targetUser;
    let currentUser;
    try {
        targetUser = await userData.getUserById(targetUserId);
        currentUser = await userData.getUserById(currentUserId);
    } catch (e) {
        return res.status(404).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e],
            isLoggedIn: !!req.session.user,
            isAdmin
        });
    }
    // get followers and following for target user
    let followers;
    let following;
    try {
        followers = await userData.getAllPeopleFollowingThisUser(targetUserId);
        following = await userData.getFollowingList(targetUserId);
    } catch (e) {
        return res.status(400).render('errors/error', {
            title: "400 Data Error",
            error: e.message || String(e),
            status: 400});
    }
    // get target user's rsvps
    let userRSVPPosts = [];
    let currentRSVPPosts = [];
    try {
        for (let i = 0; i < targetUser.RSVP.length; i++) {
            let curr1 = await rsvpData.getRsvpById(targetUser.RSVP[i]);
            userRSVPPosts.push(curr1);
            let curr2 = await rsvpData.getRsvpById(targetUser.RSVP[i]);
            currentRSVPPosts.push(curr2);
        }
        currentRSVPPosts = await helper.formatAndCheckRSVPS(currentRSVPPosts);
        
        for(let i = 0; i < userRSVPPosts.length; i++) {
            userRSVPPosts[i].restaurantId = (await restaurants.getRestaurantById(userRSVPPosts[i].restaurantId)).name;
            userRSVPPosts[i].user = (await userData.getUserById(userRSVPPosts[i].userId)).firstName;
            let namesAttending = [];
            let userIdsAttending = userRSVPPosts[i].usersAttending;
            for (let j = 0; j < userIdsAttending.length; j++) {
                let currUser = (await userData.getUserById(userIdsAttending[j])).firstName;
                namesAttending.push(currUser);
            }
            userRSVPPosts[i].usersAttending = namesAttending;
        }
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }

    // get the target user's reviews
    let userReviews = [];
    try {
        for (let i = 0; i < targetUser.reviews.length; i++) {
            let review = await reviews.getReviewById(targetUser.reviews[i]);
            let restaurant = await restaurants.getRestaurantById(review.restaurantId);
            review['restaurantName'] = restaurant.name;
            if (review.menuItemId && review.menuItemId.trim() !== '') {
                let menuItem = await menuItems.getMenuItemById(review.menuItemId);
                review['menuItemName'] = menuItem.name;
            }
            userReviews.push(review);
        }
    } catch (e) {
        return res.status(500).render('errors/error', {
            title: "500 Internal Server Error",
            error: e.message || String(e),
            status: 500});
    }

    // check if current user is following target user
    let isFollowing = currentUser.friends.includes(targetUserId);
    console.log(currentUserId === targetUserId);
    // render the profile page
    try {
        
        const message = req.session.message || null;
        req.session.message = null;
        res.render('users/profile', {
            title: `${targetUser.firstName}'s Profile`,
            user: {
                username: targetUser.username,
                firstName: targetUser.firstName,
                lastName: targetUser.lastName,
                following: following,
                followers: followers,
                RSVPposts: userRSVPPosts,
                currentRSVPs: currentRSVPPosts,
                reviews: userReviews,
                _id: targetUser._id
            },
            currUser: {
                _id: currentUser._id.toString(),
                username: currentUser.username
            },
            isLoggedIn: !!req.session.user,
            message: message,
            isAdmin,
            isFollowing,
            isOwnProfile: currentUserId === targetUserId
        });
    } catch (e) {
        res.status(500).render(error, {
            title: "500 Internal Server Error",
            error: e.message,
            status: 500});
    }
  });

router
  .post('/follow', async (req, res) => {
    try {
        const friendId = xss(req.body.friendId);
        const currUserId = xss(req.body.userId);
        const action = xss(req.body.action); // 'follow' or 'unfollow'
        // Validate IDs
        if (!friendId || !currUserId) {
            throw new Error("Both user IDs are required");
        }

        // Check if IDs are valid
        try {
            helper.checkId(friendId);
            helper.checkId(currUserId);
        } catch (e) {
            throw new Error("Invalid user ID format");
        }

        if(friendId === currUserId) throw new Error("Can only add other users, not yourself!");
        
        // Get current user to check if they're already following
        const currentUser = await userData.getUserById(currUserId);
        const isFollowing = currentUser.friends.includes(friendId);
        
        if (action === 'unfollow') {
            if (!isFollowing) {
                throw new Error("You are not following this user!");
            }
            await userData.removeFriend(currUserId, friendId);
            req.session.message = "Friend Removed!";
        } else {
            if (isFollowing) {
                throw new Error("You are already following this user!");
            }
            await userData.addFriend(currUserId, friendId);
            req.session.message = "Friend Added!";
        }
        
        res.redirect(`/profile/${friendId}`);
    }
    catch(e) {
        console.log("Follow error:", e);
        req.session.message = e.message || "Something went wrong. Cannot follow/unfollow this user.";
        res.redirect(`/profile/${xss(req.body.friendId)}`);
    }
  });
  

// router  
// .route('/api/diningList')
//   .get(async (req, res) => {
//     try {
//     let serverRestaurants = await restaurants.getAllRestaurants();
//     res.json(serverRestaurants);
//     } catch(e) {
//       return res.status(500).render('errors/error', {
//       title: "500 Internal Server Error",
//       error: e.message || String(e),
//       status: 500});
//     }
//   });

export default router;
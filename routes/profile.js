import {Router} from 'express';
const router = Router();
import userData from '../data/users.js';
import helper from '../data/helpers.js';
//import crypto from 'crypto'


// General profile route
router
  .route('/')
  .get(async (req, res) => {
    // Verify that the user is logged in
    console.log(req.session.user) // TEST
    if (!req.session.user) {
        // 403 = forbidden page
        return res.status(403).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: ["You must be logged in to view your profile."]
        })
    }

    let id = req.session.user._id;
    try {
        id = helper.checkId(id);
    } catch (e) {
        // If the id is invalid, render the login page
        return res.status(400).render('users/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e]
        })
    }

    // Get the user
    let user;
    try {
        user = await userData.getUserById(id);
    } catch (e) {
        return res.status(404).render('user/login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e]
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
                RSVPposts: [], // array of RSVP post objects
                currentRSVPs: [], // array of RSVP post objects
                reviews: [] // array of review objects
            }
        })
    } catch (e) {
        res.status(500).json({error: e.message});
    }

  });


export default router;

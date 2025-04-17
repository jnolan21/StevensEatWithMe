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
        return res.status(404).render('login', {
            title: 'EatWithMe login',
            hasErrors: true,
            errors: [e]
        })
    }
    // Render the user's profile page
    try {
        res.render('users/profile', {
            title: "EatWithMe Profile Page",
            user: user
        })
    } catch (e) {
        res.status(500).json({error: e.message});
    }

  });


export default router;
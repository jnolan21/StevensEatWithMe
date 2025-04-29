import {Router} from 'express';
const router = Router();
import restaurants from '../data/restaurants.js';
import rsvps from '../data/rsvps.js'
import users from '../data/users.js'
import helpers from '../data/helpers.js';
import reviews from '../data/reviews.js';

/*
router.route('/meetupPage/follow').post(async (req, res) => {
  try {
   console.log("hi");
    }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
  
});*/
router
    .route('/meetupPage')
    .get(async (req, res) => {
        try{
          const message = req.session.message || null; 
          req.session.message = null;   
        let allrsvps = await rsvps.getAllRsvps();
        allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
        res.render('meetupPage/meetupPage', {
            title: "EatWithMe Meetup Page", 
            allrsvps: allrsvps, 
            currUser: req.session.user,
            isLoggedIn: !!req.session.user,
            message: message
                })
        }
        catch (e) {
          return res.status(400).json({error: e.message});
        }
  });
  router
  .post('/follow', async (req, res) => {
    let allrsvps;
        try{
            allrsvps = await rsvps.getAllRsvps();
            allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
            const friendId = req.body.friendId;
            const currUserId = req.body.userId;
            if(friendId === currUserId) throw new Error("Can only add other users, not yourself!")
            //const addFriend = async (id, friendId) => {
            await users.addFriend(currUserId, friendId);
            req.session.message = "Friend Added!"; 
            res.redirect('/meetupPage/meetupPage');
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot follow this user."
            res.redirect('/meetupPage/meetupPage')
            }
        }
  );
  router
  .post('/rsvp', async (req, res) => {
    //const userJoinRsvp = async (id,userId..returns rsvp object
    let allrsvps;
        try{
            allrsvps = await rsvps.getAllRsvps();
            allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
            let userId = req.body.userId;
            let rsvpId = req.body.rsvpID;
            let posterId = req.body.posterId;
            if(posterId === userId) throw new Error("This is your meetup! You are already attending.");
            let currRSVP = await rsvps.userJoinRsvp(rsvpId, userId);
            req.session.message = "Added to attendees!"; 
            res.redirect('/meetupPage/meetupPage');
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot RSVP to this meetup."
            res.redirect('/meetupPage/meetupPage')
    }
  });
export default router;
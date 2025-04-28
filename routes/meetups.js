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
        let allrsvps = await rsvps.getAllRsvps();
        allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
        res.render('meetupPage/meetupPage', {
            title: "EatWithMe Meetup Page", 
            allrsvps: allrsvps, 
            currUser: req.session.user,
            isLoggedIn: !!req.session.user,
            message: req.query.message || null
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
            if(friendId === currUserId) throw "Can only add other users, not yourself!"
            //const addFriend = async (id, friendId) => {
            await users.addFriend(currUserId, friendId);
            res.redirect('/meetupPage/meetupPage?message=Friend+Added');
        }
        catch(e){

            return res.status(400).render('meetupPage/meetupPage', {
                title: "EatWithMe Meetup Page", 
                allrsvps: allrsvps, 
                error: e||e.message,
                currUser: req.session.user,
                isLoggedIn: !!req.session.user})
            };
        }
  );
export default router;
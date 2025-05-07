import {Router} from 'express';
const router = Router();
import restaurants from '../data/restaurants.js';
import rsvps from '../data/rsvps.js'
import users from '../data/users.js'
import helpers from '../data/helpers.js';
import reviews from '../data/reviews.js';
import { all } from 'axios';

router
    .route('/')
    .get(async (req, res) => {
        try{
          // Determine if an admin is logged in
          let isAdmin;
          if (req.session.user) {
            if (req.session.user.isAdmin) isAdmin = true;
            else isAdmin = false;
          }
          const message = req.session.message || null; 
          req.session.message = null;   
          let allrestaurants = await restaurants.getAllRestaurants();
          let restNames = [];
          for(let i=0;i<allrestaurants.length; i++){
            restNames.push({
              name: allrestaurants[i].name,
              id: allrestaurants[i]._id.toString()
            });
          }
        let allrsvps = await rsvps.getAllRsvps();
        allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
        //need to send all restaurants to this page. then send it to get create page so we can do a dropdown with all the restaurants
        res.render('meetupPage/meetupPage', {
            title: "EatWithMe Meetup Page", 
            allrsvps: allrsvps, 
            currUser: req.session.user,
            isLoggedIn: !!req.session.user,
            message: message,
            restNames: restNames,
            isAdmin
                })
        }
        catch (e) {
          return res.status(500).json({
            title: "500 Internal Server Error",
            error: e.message,
            status: 500});
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
            res.redirect('/meetupPage');
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot follow this user."
            res.redirect('/meetupPage')
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
            res.redirect('/meetupPage');
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot RSVP to this meetup."
            res.redirect('/meetupPage')
    }
  });
  router
  .get('/create', async (req, res) => {
        try{
          let restNames = req.query.restNames; 
          restNames = restNames.map(entry => {
            const [name, id] = entry.split('::');
            return { name, id };
          });
          const message = req.session.message || null; 
          req.session.message = null; 
            res.render('meetupPage/createRSVP', {
              title: "EatWithMe Create Meetup",
              isLoggedIn: !!req.session.user,
              message: message,
              restNames: restNames
            })
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot create a meetup."
            res.redirect('/meetupPage')
    }
  });
  router
  .post('/created', async (req, res) => {
        try{
          let rsvpDate = req.body.rsvpDate;
          let rsvpTime = req.body.rsvpTime;
          let restId = req.body.restaurant;
          let comment = req.body.comment;
          comment=comment.trim();
          let userId = req.session.user._id;
          let userObj = await users.getUserById(userId);
          let nameUser = userObj.firstName;

          if(!comment || !rsvpDate || !restId || !rsvpTime || (comment=="") ){
            throw new Error("All fields must be filled out.")
          }
          //format the date properly 
          let [year, month, day] = rsvpDate.split('-');
          rsvpDate = `${month}/${day}/${year}`;
          //format the military time 
          let [hourStr, minuteStr] = rsvpTime.split(':');
          let hour = Number(hourStr);
          let minute = minuteStr;
          let period;
          if(hour >=12){ period = 'PM';}
          else{ period = 'AM';}
          if (hour === 0) hour = 12;
          else if (hour > 12) hour -= 12;
          //add leading 0 to hour if needed
          let formattedHour;
          if (hour < 10) {
            formattedHour = '0' + hour;
          } else {
            formattedHour = hour;
          }
          rsvpTime = `${formattedHour}:${minute}${period}`;
          rsvpTime=rsvpTime.trim();
          rsvpDate = rsvpDate.trim();
        let meetupTime = {Date: rsvpDate, Time: rsvpTime};
        helpers.checkMeetUpTime(meetupTime);
        helpers.checkString(comment);
        helpers.checkId(restId);
        helpers.checkId(userId);
        helpers.checkCommentLength(comment);
        if(!(helpers.isFutureDateTime(rsvpDate, rsvpTime))){
          throw new Error("Meetup time must be a future date.");
        }
        await rsvps.createRsvp(comment,meetupTime,restId,userId);
        req.session.message = "Meetup Created!"; 
          res.redirect('/meetupPage');
        }
        catch(e){
          req.session.message = e.message || "Something went wrong. Cannot create a meetup."
            res.redirect('/meetupPage')
    }
  });
export default router;

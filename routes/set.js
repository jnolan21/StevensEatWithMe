import {Router} from 'express';
const router = Router();
import restaurants from '../data/restaurants.js';
import helpers from '../data/helpers.js';

router.route('/').get(async (req, res) => {
  try{
    const restaurantss = await restaurants.ratingFilter();
    let top3 = restaurantss.slice(0,helpers.upTooThree(restaurantss));
    res.render('landingPage/landingPage', {
      title: "EatWithMe Home",
      topRestaurants: top3
    });
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});

router.route('/diningList').get(async (req, res) => {
  try {
    res.render('diningList/diningList', {title: "EatWithMe Dining List"})  } 
  catch (e) {
    return res.status(400).json({error: e.message});
  }
  
});
router.route('/meetupPage').get(async (req, res) => {
  try{
    res.render('meetupPage/meetupPage', {title: "EatWithMe Meetup Page"})
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});
router.route('/diningList/:id').get(async (req, res) => {

});


export default router;
import {Router} from 'express';
const router = Router();
import restaurants from '../data/restaurants.js';
import rsvps from '../data/rsvps.js'
import users from '../data/users.js'
import helpers from '../data/helpers.js';
import reviews from '../data/reviews.js';

router.route('/').get(async (req, res) => {
  try{
    const restaurantss = await restaurants.ratingFilter();
    let top3 = restaurantss.slice(0,helpers.upTooThree(restaurantss));
    for (let i = 0; i < top3.length; i++) {
      const temp = top3[i];
    
      if (temp.menuItems && Array.isArray(temp.menuItems)) {
        temp.menuItems = temp.menuItems.slice(0, helpers.upTooThree(temp.menuItems));
      } else {
        temp.menuItems = [];
      }
    }
    
    res.render('landingPage/landingPage', {
      title: "EatWithMe Home",
      topRestaurants: top3,
      isLoggedIn: !!req.session.user
    });
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});
router.route('/diningList').get(async (req, res) => {
  try {
    const restaurantss = await restaurants.getAllRestaurants();
    console.log(restaurantss.menuItems);
    res.render('diningList/dininglist', 
    {title: "EatWithMe Dining List",
    restaurantList: restaurantss, 
    isLoggedIn: !!req.session.user
})
  } 
  catch (e) {
    return res.status(400).json({error: e.message});
  }
  
});
router.route('/meetupPage').get(async (req, res) => {
  try{
    let allrsvps = await rsvps.getAllRsvps();
    allrsvps = await helpers.formatAndCheckRSVPS(allrsvps);
    res.render('meetupPage/meetupPage', {title: "EatWithMe Meetup Page", allrsvps: allrsvps, isLoggedIn: !!req.session.user})
  }
  catch (e) {
    return res.status(400).json({error: e.message});
  }
});

router.route('/diningList/:id').get(async (req, res) => {

  

  try {
    const id = helpers.checkId(req.params.id);
    const restaurant = await restaurants.getRestaurantById(id);
    const restaurantReviews = await reviews.getAllRestaurantReviews(id);
    return res.render('diningList/diningFacility', {title: restaurant.name, restaurant:restaurant,
      reviews: restaurantReviews
    }); 
  } catch(e) {
    console.log(e);
  }

});


export default router;
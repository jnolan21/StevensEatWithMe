import {Router} from 'express';
const router = Router();
import restaurants from '../data/restaurants.js';
import rsvps from '../data/rsvps.js'
import users from '../data/users.js'
import helpers from '../data/helpers.js';
import reviews from '../data/reviews.js';
import menuData from '../data/menuItems.js';
import xss from 'xss';

router.route('/').get(async (req, res) => {
  
  try{
    const restaurantss = await restaurants.ratingFilter();
    let top3 = restaurantss.slice(0,helpers.upTooThree(restaurantss));
    for (let i = 0; i < top3.length; i++) {
      const restaurant = top3[i];
      const menuItems = await menuData.ratingFilter(restaurant._id.toString());
      const topItems = menuItems.slice(0, helpers.upTooThree(menuItems));
      restaurant.topMenuItems = topItems;
    }
    // Determine if an admin is logged in
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    res.render('landingPage/landingPage', {
      title: "EatWithMe Home",
      topRestaurants: top3,
      isLoggedIn: !!req.session.user,
      isAdmin
    });
  }
  catch (e) {
    return res.status(500).json({
      title: "500 Internal Server Error",
      error: e.message,
      status: 500});
  }
});
router.route('/diningList').get(async (req, res) => {
  try {
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    res.render('diningList/dininglist', 
    {title: "EatWithMe Dining List",
    isLoggedIn: !!req.session.user,
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


router.route('/diningList/:id').get(async (req, res) => {


  try {
    const id = helpers.checkId(req.params.id);
    const restaurant = await restaurants.getRestaurantById(id);
    const restaurantReviews = await reviews.getAllRestaurantReviews(id);
    let isAdmin;
    if (req.session.user) {
      if (req.session.user.isAdmin) isAdmin = true;
      else isAdmin = false;
    }
    return res.render('diningList/diningFacility', {title: restaurant.name, restaurant:restaurant,
      reviews: restaurantReviews, isLoggedIn: !!req.session.user, isAdmin
    }); 
  } catch(e) {
    return res.status(404).json({
      title: "404 Page Not Found",
      error: "Restaurant Could Not be Found, If it does exist Reload and try again",
      status: 404});
  }

});


router
  .route('/api/diningList')
  .get(async (req, res) => {
    try {
    let serverRestaurants = await restaurants.getAllRestaurants();
    res.json(serverRestaurants);
    } catch(e) {
      return res.status(500).json({
      title: "500 Internal Server Error",
      error: e.message,
      status: 500});
    }
  });


export default router;
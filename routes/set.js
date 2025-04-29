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
    res.render('diningList/dininglist', 
    {title: "EatWithMe Dining List",
    isLoggedIn: !!req.session.user
})
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
      reviews: restaurantReviews, isLoggedIn: !!req.session.user
    }); 
  } catch(e) {
    res.json({error: e});
  }

});


router
  .route('/api/diningList')
  .get(async (req, res) => {
    try {
    let serverRestaurants = await restaurants.getAllRestaurants();
    res.json(serverRestaurants);
    } catch(e) {
      console.log(e);
      res.json(e);
    }
  })
  .post(async (req, res) => {
    //let cleanName = req.body.name;
    //let cleanDesc = req.body.description;

    let cleanName = xss(req.body.name);
    let cleanDesc = xss(req.body.description);
    res.json({success: true, todo: true});
  });


export default router;
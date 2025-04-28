// Here is where we will list all of our routes that index.js routes to
import userRoutes from './users.js';
import setRoutes from './set.js';
import profileRoutes from './profile.js';
import restaurants from '../data/restaurants.js';
import meetupRoutes from './meetups.js'; 
import helpers from '../data/helpers.js';

//import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {

  app.use('/users', userRoutes);
  app.use('/diningList', setRoutes);
  app.use('/meetupPage', meetupRoutes);
  app.use('/profile', profileRoutes);
  app.use('/', setRoutes);
  app.use('/public', staticDir('public'));
  app.use('*', async (req, res) => {
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
  catch(e){
    return res.status(400).json({error: e.message});
  }
  });
};

export default constructorMethod;
// Here is where we will list all of our routes that index.js routes to
import userRoutes from './users.js';
import setRoutes from './set.js';
import profileRoutes from './profile.js';
import restaurants from '../data/restaurants.js';
import helpers from '../data/helpers.js';

//import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {

  app.use('/users', userRoutes);
  app.use('/profile', profileRoutes)
  app.use('/diningList', setRoutes);
  app.use('/meetupPage', setRoutes);
  app.use('/', setRoutes);
  app.use('/public', staticDir('public'));
  app.use('*', async (req, res) => {
    try{
    const restaurantss = await restaurants.ratingFilter();
    let top3 = restaurantss.slice(0,helpers.upTooThree(restaurantss));
    res.render('landingPage/landingPage', {
      title: "EatWithMe Home",
      topRestaurants: top3
    });
  }
  catch(e){
    return res.status(400).json({error: e.message});
  }
  });
};

export default constructorMethod;
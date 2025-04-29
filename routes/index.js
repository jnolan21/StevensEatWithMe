// Here is where we will list all of our routes that index.js routes to
import userRoutes from './users.js';
import setRoutes from './set.js';
import profileRoutes from './profile.js';
import restaurants from '../data/restaurants.js';
import meetupRoutes from './meetups.js'; 
import adminRoutes from './admin.js'
import helpers from '../data/helpers.js';

//import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  app.use('/', setRoutes);
  app.use('/diningList', setRoutes);
  app.use('/api/diningList', setRoutes);
  app.use('/users', userRoutes);
  app.use('/meetupPage', meetupRoutes);
  app.use('/profile', profileRoutes);
  app.use('/admin', adminRoutes);
  app.use('/public', staticDir('public'));
  app.use('*', async (req, res) => {
    console.log("failed");
    res.redirect('/');
  });
};

export default constructorMethod;
// Here is where we will list all of our routes that index.js routes to
import userRoutes from './users.js';
import setRoutes from './set.js';
import profileRoutes from './profile.js';

//import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {

  app.use('/users', userRoutes);
  app.use('/profile', profileRoutes)
  app.use('/diningList', setRoutes);
  app.use('/meetupPage', setRoutes);
  app.use('/public', staticDir('public'));
  app.use('*', (req, res) => {
    return res.render('landingPage/landingPage', {title: "EatWithMe Home"});
  });
};

export default constructorMethod;
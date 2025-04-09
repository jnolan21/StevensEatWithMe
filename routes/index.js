// Here is where we will list all of our routes that index.js routes to
import userRoutes from './users.js';
//import path from 'path';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {

  app.use('/users', userRoutes);

  app.use('/public', staticDir('public'));
  app.use('*', (req, res) => {
    return res.render('landingPage/landingPage');
  });
};

export default constructorMethod;
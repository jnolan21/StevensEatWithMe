import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// List of all our database documents
export const users = getCollectionFn('users');
export const reviews = getCollectionFn('reviews');
export const restaurants = getCollectionFn('restaurants');
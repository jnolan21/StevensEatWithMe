import {reviews, restaurants} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import restaurantData from './restaurants.js'


// Create a menu item for a restaurant
const createMenuItem = async (
    restaurantId,
    name,
    description,
    dietaryRestrictions,
) => {
    // Verify all the input
    restaurantId = helper.checkId(restaurantId);
    name = helper.checkString(name, 'menu item name');
    description = helper.checkString(description, 'menu item description');
    dietaryRestrictions = helper.checkStringArray(dietaryRestrictions, 'menu item dietary restrictions');
    // Create the new menu item object
    let newMenuItem = {
        _id: new ObjectId(),
        name: name,
        description: description,
        dietaryRestrictions: dietaryRestrictions,
        rating: 0
    };
    // Validate that the restaurant exists AND add menu item to it
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    // Add the menu item to the restaurant object
    const rCollection = await restaurants();
    restaurant = await rCollection.findOneAndUpdate(
        {_id: new ObjectId(restaurant._id)},
        {$push: {menuItems: newMenuItem}},
        {returnDocument: "after"}
    );
    // Return the restaurant object
    return getMenuItemById(newMenuItem._id.toString());
}


// Get an array of all menu item objects for a restaurant
const getAllMenuItems = async (restaurantId) => {
    restaurantId = helper.checkId(restaurantId);
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    return restaurant.menuItems;
}


// Get a menu item by their id
const getMenuItemById = async (id) => {
    // Validate menut item id
    id = helper.checkId(id);
    // Search for the menut item in restaurant collection
    const rCollection = await restaurants();
    const menuItem = await rCollection.findOne(
        {'menuItems._id': new ObjectId(id)},
        {projection: {_id: 0, 'menuItems.$': 1}}
    )
    if (!menuItem) throw new Error(`Error in getMenuItemById: menu item not found with id = ${id}`);
    return menuItem.menuItems[0];
}






// Exported functions
export default {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById
}
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
        restaurantId: restaurantId,
        name: name,
        description: description,
        dietaryRestrictions: dietaryRestrictions,
        reviews: [],
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
    // Validate menu item id
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

// Get the restaurant id of a menu item using menu item id
const getRestaurantId = async (id) => {
    // Validate menu item id
    id = helper.checkId(id);
    // Get the menu item
    let menuItem = await getMenuItemById(id);
    // Get restaurant using 'restaurantId'
    return await restaurantData.getRestaurantById(menuItem.restaurantId);
}


// Remove a menu item from a restaurant
const removeMenuItem = async (id) => {
    // Check id
    id = helper.checkId(id);
    // Get the menu item object
    let menuItem = getMenuItemById(id);
    // Get the restaurant
    let restaurant = restaurantData.getRestaurantById(menuItem.restaurantId);
    // Remove the review from the restaurant
    await rCollection.updateOne(
        {_id: new ObjectId(menuItem.restaurantId)},
        {$pull: {reviews: {_id: new ObjectId(menuItem._id.toString())}}}
    );
    // Get the updated restaurant
    let newRestaurant = await rCollection.findOne(
        {_id: new ObjectId(restaurant._id)}
    )
    // Update the menu item rating
    let newRating = await helper.calculateRestaurantRating(newRestaurant);
    await rCollection.findOneAndUpdate(
        {_id: new ObjectId(restaurant._id)},
        {$set: {rating: newRating}}
    )
    // Get the update menu item
    const updatedMenuItem = await rCollection.findOne (
        {_id: new ObjectId(restaurant._id)}
    );
    return updatedMenuItem;
}

const ratingFilter = async (restaurantId) => {

    restaurantId = helper.checkId(restaurantId);
    let restaurants = await restaurantData.getRestaurantById(restaurantId);

    let menuItems = restaurants.menuItems;

    menuItems.sort((a,b) =>  b.rating - a.rating);
    return menuItems;

}







// Exported functions
export default {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    getRestaurantId,
    removeMenuItem,
    ratingFilter
}
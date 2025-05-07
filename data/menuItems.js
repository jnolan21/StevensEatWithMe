import {reviews, restaurants} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import reviewData from './reviews.js'
import restaurantData from './restaurants.js'
import { all } from 'axios';


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
    // Get the new menu item array from the restaurant
    restaurant = await restaurantData.getRestaurantById(restaurantId);
    // Sort the menu items
    let sortedMenuItems = restaurant.menuItems.sort((menuItem1, menuItem2) => {
        return menuItem1.name.toLowerCase().localeCompare(menuItem2.name.toLowerCase());
    });
    // Add the sorted menu item array back into the restaurant
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$set: {menuItems: sortedMenuItems}}
    );
    // Return the restaurant object
    return getMenuItemById(newMenuItem._id.toString());
}


// Get an array of all menu item objects for a restaurant
const getAllMenuItems = async (restaurantId) => {
    restaurantId = helper.checkId(restaurantId);
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    // Sort the menu items by name
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
    let menuItems = restaurant.menuItems.sort((menuItem1, menuItem2) => {
        return menuItem1.name.toLowerCase().localeCompare(menuItem2.name.toLowerCase());
    });
    return menuItems;
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
    let menuItem = await getMenuItemById(id);
    const restaurantId = menuItem.restaurantId;
    // Remove all reviews about this menu item
    let allReviews = await reviewData.getAllReviews();
    for (let i = 0; i < allReviews.length; i++) {
        if (allReviews[i].menuItemId.toString() === id) await reviewData.deleteReview(allReviews[i]._id.toString());
    }
    // Get the restaurant
    let restaurant = await restaurantData.getRestaurantById(menuItem.restaurantId);
    // Remove the review from the restaurant
    const rCollection = await restaurants();
    const result = await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$pull: {menuItems: {_id: new ObjectId(id)}}}
    );
    if (result.modifiedCount === 0) throw new Error(`Failed to remove menu item: '${menuItem.name}'.`);
    // Get the new menu item array from the restaurant
    restaurant = await restaurantData.getRestaurantById(restaurantId);
    // Sort the menu items
    let sortedMenuItems = restaurant.menuItems.sort((menuItem1, menuItem2) => {
        return menuItem1.name.toLowerCase().localeCompare(menuItem2.name.toLowerCase());
    });
    // Add the sorted menu item array back into the restaurant
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$set: {menuItems: sortedMenuItems}}
    );
    // Update the menu item rating
    let updatedRestaurant = await restaurantData.getRestaurantById(restaurantId);
    let newRating = await helper.calculateRestaurantRating(updatedRestaurant);
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$set: {averageRating: newRating}}
    )
    return await restaurantData.getRestaurantById(restaurantId);
}

const ratingFilter = async (restaurantId) => {

    restaurantId = helper.checkId(restaurantId);
    let restaurants = await restaurantData.getRestaurantById(restaurantId);

    let menuItems = restaurants.menuItems;

    menuItems.sort((a,b) =>  b.rating - a.rating);
    return menuItems;

}


const updateMenuItem = async (
    menuItemId,
    restaurantId,
    name,
    description,
    dietaryRestrictions
) => {
    // Verify all the input
    menuItemId = helper.checkId(menuItemId);
    restaurantId = helper.checkId(restaurantId);
    name = helper.checkString(name, 'Menu item name');
    description = helper.checkString(description, 'Menu item description');
    dietaryRestrictions = helper.checkDietaryRestrictions(dietaryRestrictions);
    // Update the menu item
    const menuItem = await getMenuItemById(menuItemId);
    if (!menuItem) throw new Error("Menu item not found.");
    const rCollection = await restaurants();
    const updatedInfo = await rCollection.updateOne(
        {_id: new ObjectId(restaurantId), 'menuItems._id': new ObjectId(menuItemId)},
        {$set:
            {'menuItems.$.name': name,
            'menuItems.$.description': description,
            'menuItems.$.dietaryRestrictions': dietaryRestrictions}
        }
    );
    if (updatedInfo.modifiedCount === 0) throw new Error("Failed to update the menu item.");
    // Get the new menu item array from the restaurant
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    // Sort the menu items
    let sortedMenuItems = restaurant.menuItems.sort((menuItem1, menuItem2) => {
        return menuItem1.name.toLowerCase().localeCompare(menuItem2.name.toLowerCase());
    });
    // Add the sorted menu item array back into the restaurant
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$set: {menuItems: sortedMenuItems}}
    );
    const returnRestaurant = await restaurantData.getRestaurantById(restaurantId);
    return returnRestaurant;
}


const getMenuItemByName = async (name, restaurantId) => {
    name = helper.checkString(name, "Menu item name");
    restaurantId = helper.checkId(restaurantId);
    const rCollection = await restaurants();
    // Search for the case-insensitive name match
    const restaurant = await rCollection.findOne({
        _id: new ObjectId(restaurantId),
        menuItems: {
            // Search each menu item in each restaurant
            $elemMatch: {name: {$regex: `^${name}`, $options: 'i'}}
        }
    });
    if (!restaurant) return null;
    // Get the menu item object
    let menuItem;
    for (let i = 0; i < restaurant.menuItems.length; i++) {
        if (restaurant.menuItems[i].name.toLowerCase() === name.toLowerCase()) menuItem = restaurant.menuItems[i];
    }
    if (!menuItem) return null;
    menuItem._id = menuItem._id.toString();
    return menuItem;
}




// Exported functions
export default {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    getRestaurantId,
    removeMenuItem,
    ratingFilter,
    updateMenuItem,
    getMenuItemByName
}
import {menuItems, reviews, restaurants} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import restaurantData from './restaurants.js'


// Create a menu item for a restaurant
const createMenuItem = async (
    restaurantId,
    name,
    description,
) => {
    // Verify all the input
    restaurantId = helper.checkId(restaurantId);
    name = helper.checkString(name, 'menu item name');
    description = helper.checkString(description, 'menu item description');
    // Validate that the restaurant exists AND add menu item to it
    await restaurantData.getRestaurantById(restaurantId);
    let newMenuItem = {restaurantId: restaurantId, name: name, description: description, reviews: [], rating: 0};
    const rCollection = await restaurants();
    const menuItemCollection = await menuItems();
    // Add the menu item to the database
    const newMenuItemInfo = await menuItemCollection.insertOne(newMenuItem);
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$addToSet: {menuItems: newMenuItem._id.toString()}}
    );
    if (!newMenuItemInfo.acknowledged || !newMenuItemInfo.insertedId) throw new Error("Menu item insert failed!");
    // Get the new inserted menu item and return the menu item object
    return await getMenuItemById(newMenuItemInfo.insertedId.toString());
}


// Get an array of all review objects
const getAllMenuItems = async () => {
    const menuItemCollection = await menuItems();
    const menuItemList = menuItemCollection.find({}).toArray();
    return menuItemList;
}


// Get a menu item by their id
const getMenuItemById = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the menu item from mongodb
    const menuItemCollection = await menuItems();
    const menuItem = await menuItemCollection.findOne({_id: new ObjectId(id)});
    if (!menuItem) throw new Error("Menu item not found!");
    // Convert the review _id to a string before returning the review object
    menuItem._id = menuItem._id.toString();
    return menuItem;
}






// Exported functions
export default {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById
}
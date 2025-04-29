import {restaurants} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'



// Create a restaurant - rating is always initialized to 0
const createRestaurant = async (
    name,
    location,
    menuItems,
    typeOfFood,
    hoursOfOperation,
    imageURL,
    dietaryRestrictions
) => {
    // Verify all the input
    name = helper.checkString(name, 'restaurant name');
    location = helper.checkString(location, 'restaurant location');
    menuItems = helper.checkIdArray(menuItems, 'menuItems');
    typeOfFood = helper.checkStringArray(typeOfFood, 'typeOfFood');
    hoursOfOperation = helper.checkHoursOfOperation(hoursOfOperation);
    imageURL = helper.checkString(imageURL, "Image URL");
    dietaryRestrictions = helper.checkStringArray(dietaryRestrictions, "Dietary restrictions");
    // Add the restaurant to the database
    const newRestaurant = {
        name: name,
        location: location,
        menuItems: [],
        typeofFood: typeOfFood,
        averageWaitTime: "0h 0min",
        reviews: [],
        hoursOfOperation: hoursOfOperation,
        imageURL: imageURL,
        averageRating: 0,
        dietaryRestrictions: dietaryRestrictions
    };
    const rCollection = await restaurants();
    const restaurantInfo = await rCollection.insertOne(newRestaurant);
    if (!restaurantInfo.acknowledged || !restaurantInfo.insertedId) throw new Error("Restaurant insert failed!");
    // Get the new inserted restaurant and return the restaurant object
    return await getRestaurantById(restaurantInfo.insertedId.toString());
}


// Get an array of all restaurant objects
const getAllRestaurants = async () => {
    const rCollection = await restaurants();
    const restaurantList = rCollection.find({}).toArray();
    return restaurantList;
}


// Get restaurant by id
const getRestaurantById = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the restaurant from mongodb
    const rCollection = await restaurants();
    const restaurant = await rCollection.findOne({_id: new ObjectId(id)});
    if (!restaurant) throw new Error("Restaurant not found!");
    // Convert the restaurant _id to a string before returning the restaurant object
    restaurant._id = restaurant._id.toString();
    return restaurant;
}


// Delete restaurant given its id
const removeRestaurant = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the restaurant from mongodb
    const rCollection = await restaurants();
    const deletedRestaurant = await rCollection.findOneAndDelete({_id: new ObjectId(id)});
    if (!deletedRestaurant) throw new Error(`Could not remove restaurant with id '${id}'!`);
    // Convert the restaurant _id to a string before returning the deleted restaurant object
    deletedRestaurant._id = deletedRestaurant._id.toString();
    return deletedRestaurant;
}


const ratingFilter = async () => {
    let restaurants = await getAllRestaurants();
    restaurants.sort((a,b) =>  b.averageRating - a.averageRating);
    return restaurants;
}



const waitTime = async () => {
    let restaurants = await getAllRestaurants();
    restaurants.sort((a,b) => helper.subtractWaitTime(a.averageWaitTime, b.averageWaitTime)); 

    return restaurants;
}

const preferredWaitTime = async (time) => {
    time = helper.checkWaitTime(time);
    const restaurants = await getAllRestaurants();
    const preferredRestaurants = restaurants.filter(r => helper.subtractWaitTime(time, r.averageWaitTime) >= 0);
    if (preferredRestaurants.length === 0) {
        throw "No Restaurants Fit within your Preferred Wait Time"
    }
    preferredRestaurants.sort((a,b) => helper.subtractWaitTime(a.averageWaitTime, b.averageWaitTime));
    return preferredRestaurants;
}






// Exported functions
export default {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    removeRestaurant,
    removeRestaurant,
    ratingFilter,
    waitTime,
    preferredWaitTime
}
import {restaurants,rsvps} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js';
import reviews from './reviews.js';
import rsvpData from './rsvps.js'




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
    dietaryRestrictions = helper.checkDietaryRestrictions(dietaryRestrictions);
    // Add the restaurant to the database
    const newRestaurant = {
        name: name,
        location: location,
        menuItems: [],
        typeOfFood: typeOfFood,
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
    // Sort the restaurant's alphabetically
    const restaurantList = rCollection.find({}).sort({name: 1}).toArray();
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
    // Get the restaurant and RSVP collections from mongodb
    const rCollection = await restaurants();
    const rsvpCollection = await rsvps();
    const restaurant = await rCollection.findOne({_id: new ObjectId(id)});
    if (!restaurant) throw new Error(`Could not find restaurant with id '${id}'!`);

    // Delete all reviews for the menu items associated with this restaurant
    let allReviews = await reviews.getAllReviews();
    for (let i = 0; i < restaurant.menuItems.length; i++) {
        let menuItem = restaurant.menuItems[i];
        for (let j = 0; j < allReviews.length; j++) {
            let review = allReviews[j];
            if (review.menuItemId && review.menuItemId.toString() === menuItem._id.toString()) {
                // Delete the review for the given menu item
                await reviews.deleteReview(review._id.toString());
            }
        }
    }

    // Delete all general reviews about the restaurant
    for (let i = 0; i < allReviews.length; i++) {
        let review = allReviews[i];
        if (review.restaurantId && review.restaurantId.toString() === id && !review.menuItemId) {
            // Delete the review about the restaurant
            await reviews.deleteReview(review._id.toString());
        }
    }

    // Delete all RSVPs for this restaurant
    let allRSVPs = await rsvpCollection.find({restaurantId: id}).toArray();
    for (let i = 0; i < allRSVPs.length; i++) {
        let rsvp = allRSVPs[i];
        // Delete the RSVP
        await rsvpData.deleteRsvp(rsvp._id.toString(), rsvp.userId.toString());
    }

    // Convert the restaurant _id to a string before returning the deleted restaurant object
    const deletedRestaurant = await rCollection.findOneAndDelete(
        {_id: new ObjectId(id)}
    )
    if (!deletedRestaurant) throw new Error(`Could not remove restaurant with id '${id}'.`);
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

const updateRestaurant = async (
    id,
    name,
    location,
    typeOfFood,
    hoursOfOperation,
    imageURL,
    dietaryRestrictions
) => {
    // Verify all the input
    id = helper.checkId(id);
    name = helper.checkString(name, 'restaurant name');
    location = helper.checkString(location, 'restaurant location');
    typeOfFood = helper.checkStringArray(typeOfFood, 'typeOfFood');
    hoursOfOperation = helper.checkHoursOfOperation(hoursOfOperation);
    imageURL = helper.checkString(imageURL, "Image URL");
    dietaryRestrictions = helper.checkDietaryRestrictions(dietaryRestrictions);
    // Update the restaurant
    let checkRestaurantName = await getRestaurantByName(name);
    if (checkRestaurantName !== null && id !== checkRestaurantName._id.toString()) throw new Error(`Restaurant already exists with the name ${checkRestaurantName.name}.`);
    let restaurant = await getRestaurantById(id);
    if (!restaurant) throw new Error("Restaurant not found.");
    const rCollection = await restaurants();
    const updatedInfo = await rCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set:
            {name: name,
            location: location,
            typeOfFood: typeOfFood,
            hoursOfOperation: hoursOfOperation,
            imageURL: imageURL,
            dietaryRestrictions: dietaryRestrictions}}
    );
    if (updatedInfo.matchedCount === 0) throw new Error("Failed to update the restaurant.");
    if (!updatedInfo.acknowledged) throw new Error('MongoDB failed to perform the restaurant update.');
    const returnRestaurant = await getRestaurantById(id);
    return returnRestaurant;
}


const getRestaurantByName = async (name) => {
    name = helper.checkString(name, "Restaurant name");
    const rCollection = await restaurants();
    // Search for the case-insensitive name match
    const restaurant = await rCollection.findOne({
        name: {
            $regex: `^${name}`,
            $options: 'i' // case -insensitive matching option
        }
    });
    if (!restaurant) return null;
    restaurant._id = restaurant._id.toString();
    return restaurant;
}



//console.log(await averageRestaurantWaitTime("6819349eeafcead927d1d43c"));





// Exported functions
export default {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    removeRestaurant,
    ratingFilter,
    waitTime,
    preferredWaitTime,
    updateRestaurant,
    getRestaurantByName
    //averageRestaurantWaitTime
}
import {reviews, users, restaurants, menuItems} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import restaurantData from './restaurants.js'
import menuItemData from './menuItems.js'


// Create a review for a user
const createReview = async (
    userId,
    restaurantId,
    menuItemId,
    review,
    rating, // rating should be a number 0 - 5
    waitTime
) => {
    // Verify all the input
    userId = helper.checkId(userId);
    restaurantId = helper.checkId(restaurantId);
    menuItemId = helper.checkId(menuItemId);
    review = helper.checkString(review);
    helper.checkReviewRating(rating);
    waitTime = helper.checkWaitTime(waitTime);
    // Validate that the user and restaurant both exist AND add it to them
    let user = await userData.getUserById(userId);
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    let menuItem = await menuItemData.getMenuItemById(menuItemId);
    // Before inserting the new review, calculate the new overall rating of that food item
    let reviewsArray = menuItem.reviews;
    let overallRating = rating;
    for (let i = 0; i < reviewsArray.length; i++) {
        // Get the full review object's rating
        let review = await getReviewById(reviewsArray[i]);
        console.log(review.rating)
        overallRating += review.rating;
    }
    // Calculate the average rating and truncate it
    overallRating = overallRating / (reviewsArray.length + 1);
    overallRating = Math.floor((overallRating * 100)) / 100;
    let newReview = {userId: userId, restaurantId: restaurantId, menuItemId: menuItemId, review: review, rating: overallRating, waitTime: waitTime};
    const userCollection = await users();
    const rCollection = await restaurants();
    const menuItemCollection = await menuItems();
    // Add the review to the database and the corresponding user, restaurant, and menu item
    const reviewCollection = await reviews();
    const newReviewInfo = await reviewCollection.insertOne(newReview);
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$addToSet: {reviews: newReview._id.toString()}}
    );
    await menuItemCollection.updateOne(
        {_id: new ObjectId(menuItemId)},
        {$set: {rating: overallRating}},
        {$addToSet: {reviews: newReview._id.toString()}}
    );
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$addToSet: {reviews: newReview._id.toString()}}
    );
    if (!newReviewInfo.acknowledged || !newReviewInfo.insertedId) throw new Error("Review insert failed!");
    // Get the new inserted user and return the user object
    return await getReviewById(newReviewInfo.insertedId.toString());
}


// Get an array of all review objects
const getAllReviews = async () => {
    const reviewCollection = await reviews();
    const reviewList = reviewCollection.find({}).toArray();
    return reviewList;
}


// Get a review by their id
const getReviewById = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the review from mongodb
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(id)});
    if (!review) throw new Error("Review not found!");
    // Convert the review _id to a string before returning the review object
    review._id = review._id.toString();
    return review;
}


// Delete a review by their id
const deleteReview = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the review from mongodb
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(id)});
    if (!review) throw new Error("Review not found!");
    // Convert the review _id to a string before returning the review object
    review._id = review._id.toString();
    return review;
}






// Exported functions
export default {
    createReview,
    getAllReviews,
    getReviewById,
    deleteReview
}
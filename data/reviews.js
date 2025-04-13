import {reviews, users, restaurants} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import restaurantData from './restaurants.js'
import menuItemData from './menuItems.js'


// Create a user review for a specific menu item
const createMenuItemReview = async (
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
    // Validate that the user, restaurant, and menu item all exist AND add it the menu item
    let user = await userData.getUserById(userId);
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    let menuItem = await menuItemData.getMenuItemById(menuItemId);
    let newReview = {
        userId: userId,
        restaurantId: restaurantId,
        menuItemId: menuItemId,
        review: review,
        rating: rating,
        waitTime: waitTime
    };
    const userCollection = await users();
    const rCollection = await restaurants();
    // Add the review to the database and the corresponding user, restaurant, and menu item
    const reviewCollection = await reviews();
    const newReviewInfo = await reviewCollection.insertOne(newReview);
    if (!newReviewInfo.acknowledged || !newReviewInfo.insertedId) throw new Error("Review insert failed!");
    // Add the review to the user
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$push: {reviews: newReviewInfo.insertedId.toString()}},
    );
    // Add the review to the menu item
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId),
        'menuItems._id': new ObjectId(menuItemId)},
        {$push: {'menuItems.$.reviews': newReviewInfo.insertedId.toString()}},
    );
    // Calculate the new overall rating of that food item
    menuItem = await menuItemData.getMenuItemById(menuItemId);
    let overallRating = await helper.calculateMenuItemRating(menuItem);
    // Update the menu item's overall rating
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId),
        'menuItems._id': new ObjectId(menuItemId)},
        {$set: {'menuItems.$.rating': overallRating}}
    );
    // Get the new inserted user and return the user object
    return await getReviewById(newReviewInfo.insertedId.toString());
}


// Create a user review for a specific restaurant
const createRestaurantReview = async (
    userId,
    restaurantId,
    review,
    rating, // rating should be a number 0 - 5
    waitTime
) => {
    // Verify all the input
    userId = helper.checkId(userId);
    restaurantId = helper.checkId(restaurantId);
    review = helper.checkString(review);
    helper.checkReviewRating(rating);
    waitTime = helper.checkWaitTime(waitTime);
    // Validate that the user, restaurant, and menu item all exist AND add it the menu item
    let user = await userData.getUserById(userId);
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    let newReview = {
        userId: userId,
        restaurantId: restaurantId,
        menuItemId: "",
        review: review,
        rating: rating,
        waitTime: waitTime
    };
    const userCollection = await users();
    const rCollection = await restaurants();
    // Add the review to the database and the corresponding user, restaurant, and menu item
    const reviewCollection = await reviews();
    const newReviewInfo = await reviewCollection.insertOne(newReview);
    if (!newReviewInfo.acknowledged || !newReviewInfo.insertedId) throw new Error("Review insert failed!");
    // Add the review to the user
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$push: {reviews: newReviewInfo.insertedId.toString()}},
    );
    // Add the review to the restaurant
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$push: {reviews: newReviewInfo.insertedId.toString()}},
    );
    // Calculate the new overall rating of that restaurant
    restaurant = await restaurantData.getRestaurantById(restaurantId);
    let overallRating = await helper.calculateRestaurantRating(restaurant);
    // Update the menu item's overall rating
    await rCollection.updateOne(
        {_id: new ObjectId(restaurantId)},
        {$set: {averageRating: overallRating}}
    );
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
    // Get the review, user, and restaurant collections
    const reviewCollection = await reviews();
    const userCollection = await users();
    const restaurantCollection = await restaurants();
    // Get the review
    let review = await getReviewById(id);
    // Remove the review from the user
    await userCollection.updateOne(
        {_id: new ObjectId(review.userId)},
        {$pull: {reviews: id}}
    )
    // Remove the review from the restaurant OR menu item depending on what it was written for
    if (review.menuItemId !== "") {
        // Menu item review
        // Remove the review
        await restaurantCollection.updateOne(
            {_id: new ObjectId(review.restaurantId),
            'menuItems._id': new ObjectId(review.menuItemId)},
            {$pull: {'menuItems.$.reviews': id}}
        )
        // Calculate the menu item rating
        let updatedMenuItem = await menuItemData.getMenuItemById(review.menuItemId);
        let newRating = await helper.calculateMenuItemRating(updatedMenuItem);
        // Insert the new menu item rating
        await restaurantCollection.updateOne(
            {_id: new ObjectId(review.restaurantId),
            'menuItems._id': new ObjectId(review.menuItemId)},
            {$set: {'menuItems.$.rating': newRating}}
        )
    } else {
        // Restaurant review
        // Remove the review
        await restaurantCollection.updateOne(
            {_id: new ObjectId(review.restaurantId)},
            {$pull: {reviews: id}}
        );
        // Calculate the restaurant rating
        let updatedRestaurant = await restaurantData.getRestaurantById(review.restaurantId);
        let newRating = await helper.calculateRestaurantRating(updatedRestaurant);
        // Update the restaurant rating
        await restaurantCollection.updateOne(
            {_id: new ObjectId(review.restaurantId)},
            {$set: {averageRating: newRating}}
        )
    }
    // Delete the review from the review collection
    const deletedReview = await reviewCollection.deleteOne(
        {_id: new ObjectId(id)}
    );
    if (deletedReview.deletedCount === 0) throw new Error('Failed to delete review.');
    // Return the deleted review
    review._id = review._id.toString();
    return review;
}






// Exported functions
export default {
    createMenuItemReview,
    createRestaurantReview,
    getAllReviews,
    getReviewById,
    deleteReview
}
import {reviews, users, restaurants, rsvps} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import userData from './users.js'
import restaurantData from './restaurants.js'

// Create an RSVP
const createRsvp = async (
    comment, // string
    meetUpTime, // array
    restaurantId, // string
    userId, // string
) => {
    // Verify all the input
    comment = helper.checkString(comment);
    meetUpTime // TODO: make verification function helper function for meetUpTime (will implement Th.)
    restaurantId = helper.checkId(restaurantId);
    userId = helper.checkId(userId);

    // Validate that the ids exist (restaurantId, userId)
    let restaurant = await restaurantData.getRestaurantById(restaurantId);
    let user = await userData.getUserById(userId);
    let newRsvp = {
        comment: comment,
        meetUpTime: meetUpTime,
        restaurantId: restaurantId,
        userId: userId,
        usersAttending: [userId] // Array is initialized to only include the user who created the post
    };

    const userCollection = await users();
    const rsvpCollection = await rsvps();

    // Add RSVP to rsvps database and the corresponding user
    const newRsvpInfo = await rsvpCollection.insertOne(newRsvp);
    if (!newRsvpInfo.acknowledged || !newRsvpInfo.insertedId) throw new Error("RSVP insert failed!"); // TODO: make sure .acknowledged is correct; check lecture notes (it prob is)
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$push: {RSVP: newRsvpInfo.insertedId.toString()}},
    );
    return newRsvp;
}

// Get an array of all RSVP objects
const getAllRsvps = async () => {
    const rsvpCollection = await rsvps();
    const rsvpList = rsvpCollection.find({}).toArray();
    return rsvpList;
}

// Get RSVP by id
const getRsvpById = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the rsvp from mongodb
    const rsvpCollection = await rsvps();
    const rsvp = await rsvpCollection.findOne({_id: new ObjectId(id)});
    if (!rsvp) throw new Error("RSVP not found!");
    // Convert the RSVP _id to a string before returning the RSVP object
    rsvp._id = rsvp._id.toString();
    return rsvp;
}

// Delete rsvp by id
const deleteRsvp = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the rsvp and user collections
    const userCollection = await users();
    const rsvpCollection = await rsvps();
    // Get the rsvp
    let rsvp = await getRsvpById(id);
    // Remove the rsvp from the user
    await userCollection.updateOne(
        {_id: new ObjectId(rsvp.userId)},
        {$pull: {RSVP: id}}
    )
    // Remove the RSVP from the RSVP collection
    const deletedRsvp = await rsvpCollection.deleteOne(
        {_id: new ObjectId(id)}
    );
    if (deletedRsvp.deletedCount === 0) throw new Error('Failed to delete RSVP.');
    // Return the deleted RSVP
    rsvp._id = rsvp._id.toString();
    return rsvp;
}

// User joins an RSVP
const userJoinRsvp = async (
    id,
    userId
) => {
    // TODO: will implement Th.
    // push user to RSVP list
}

// User leaves an RSVP
const userLeaveRsvp = async (
    id,
    userId
) => {
    // TODO: will implement Th.
    // remove user from RSVP list
}

// User (creator) changes the meetUpTime (will discuss potential implementation)
const changeMeetTime = async (
    id,
    userId
) => {
    // TODO
}

// Exported functions
export default {
    createRsvp,
    getAllRsvps,
    getRsvpById,
    deleteRsvp,
    userJoinRsvp,
    userLeaveRsvp,
}
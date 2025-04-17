
import {rsvps, users} from '../config/mongoCollections.js';
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
    meetUpTime = helper.checkMeetUpTime(meetUpTime);
    restaurantId = helper.checkId(restaurantId);
    userId = helper.checkId(userId);

    // Validate that the ids exist (restaurantId, userId)
    await restaurantData.getRestaurantById(restaurantId);
    await userData.getUserById(userId);
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
    return await getRsvpById(newRsvpInfo.insertedId.toString());
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
const deleteRsvp = async (
    id,
    userId
) => {
    // Validate id
    id = helper.checkId(id);

    // make sure the ids exist
    const user = await userData.getUserById(userId);
    const rsvp = await getRsvpById(id);

    // make sure user is creator or admin user
    if (rsvp.userId !== userId && !user.isAdmin) {
        throw new Error('Only the creator or an admin may delete this RSVP');
    }    

    // Get the rsvp and user collections
    const userCollection = await users();
    const rsvpCollection = await rsvps();

    // Remove the rsvp from the user
    await userCollection.updateOne(
        {_id: new ObjectId(rsvp.userId)},
        {$pull: {RSVP: id}}
    );

    // Remove the RSVP from the RSVP collection
    const deletedRsvp = await rsvpCollection.deleteOne(
        {_id: new ObjectId(id)}
    );
    if (deletedRsvp.deletedCount === 0) throw new Error('Failed to delete RSVP.');

    // Return the deleted RSVP
    rsvp._id = rsvp._id.toString();
    return rsvp;
}

// User joins an RSVP (function returns rsvp object)
const userJoinRsvp = async (
    id,
    userId
) => {
    id = helper.checkId(id);
    userId = helper.checkId(userId);

    // make sure the ids exist
    await userData.getUserById(userId);
    const rsvp = await getRsvpById(id);

    // make sure user is not enrolled in the RSVP
    if (rsvp.usersAttending.includes(userId)){
        throw new Error("User is enrolled in the RSVP they are trying to join")
    }

    // Add the user to the rsvp list
    const rsvpCollection = await rsvps();
    await rsvpCollection.updateOne(
        {_id: new ObjectId(id)},
        {$push: {usersAttending: userId}}
    );

    // Add the RSVP to the user's RSVP list
    const userCollection = await users();
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$push: {RSVP: id}}
    );
    rsvp._id = rsvp._id.toString();
    return rsvp;
}

// User leaves an RSVP
const userLeaveRsvp = async (
    id,
    userId
) => {
    id = helper.checkId(id);
    userId = helper.checkId(userId);

    // make sure the ids exist
    await userData.getUserById(userId);
    const rsvp = await getRsvpById(id);

    // make sure user is enrolled in the RSVP
    if (!rsvp.usersAttending.includes(userId)){
        throw new Error("User is not enrolled in the RSVP they are trying to leave")
    }

    // Remove user from rsvp list
    const rsvpCollection = await rsvps();
    await rsvpCollection.updateOne(
        {_id: new ObjectId(id)},
        {$pull: {usersAttending: userId}}
    );

    // Remove the RSVP from the user's RSVP list
    const userCollection = await users();
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$pull: {RSVP: id}}
    );
    rsvp._id = rsvp._id.toString();
    return rsvp;
}

// POTENTIALLY, IMPLEMENT THIS LATER
// // User (creator) changes the meetUpTime (will discuss potential implementation)
// const changeMeetTime = async (
//     id,
//     userId
// ) => {
//     // TODO
// }

// Exported functions
export default {
    createRsvp,
    getAllRsvps,
    getRsvpById,
    deleteRsvp,
    userJoinRsvp,
    userLeaveRsvp,
}
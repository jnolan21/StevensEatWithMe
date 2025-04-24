import {users} from '../config/mongoCollections.js';
import {ObjectId, ReturnDocument} from 'mongodb';
import helper from './helpers.js'
import bcrypt from 'bcrypt';
const saltRounds = 16;
import crypto from 'crypto'

// Function to create a new user
const createUser = async (
    firstName,  // string
    lastName,   // string
    email,      // string
    username,   // string
    password    // string
) => {
    // Verify each input
    firstName = helper.checkName(firstName, 'firstName');
    lastName = helper.checkName(lastName, 'lastName');
    // Verify that another user does not exist with the same email
    email = helper.checkEmail(email);
    let allUsers = await getAllUsers();
    username = helper.checkString(username, 'username');
    // Check if a user already exists with the given email or username
    for (let i = 0; i < allUsers.length; i++) {
        if (email.toLowerCase() === allUsers[i].email.toLowerCase()) throw new Error(`User with email '${email}' already exists!`);
        if (username.toLowerCase() === allUsers[i].username.toLowerCase()) throw new Error(`User with username '${username}' already exists!`);
    }
    password = helper.checkPassword(password);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Create an email verification token for this user
    const token = crypto.randomBytes(32).toString('hex');
    // Create a new user object to insert into mongodb
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: hashedPassword,
        reviews: [],
        RSVP: [],
        friends: [],
        isVerified: false,
        verificationToken: {
            _id: new ObjectId(),
            token: token
        },
        isAdmin: false
    };
    const userCollection = await users();
    const newUserInformation = await userCollection.insertOne(newUser);
    if (!newUserInformation.acknowledged || !newUserInformation.insertedId) throw new Error("User insert failed!");
    // Get the new inserted user and return the user object
    return await getUserById(newUserInformation.insertedId.toString());
}


// Function to create a new VERIFIED user (only used by seed.js)
const createVerifiedUser = async (
    firstName,  // string
    lastName,   // string
    email,      // string
    username,   // string
    password    // string
) => {
    // Verify each input
    firstName = helper.checkName(firstName, 'firstName');
    lastName = helper.checkName(lastName, 'lastName');
    // Verify that another user does not exist with the same email
    email = helper.checkEmail(email);
    let allUsers = await getAllUsers();
    username = helper.checkString(username, 'username');
    // Check if a user already exists with the given email or username
    for (let i = 0; i < allUsers.length; i++) {
        if (email.toLowerCase() === allUsers[i].email.toLowerCase()) throw new Error(`User with email '${email}' already exists!`);
        if (username.toLowerCase() === allUsers[i].username.toLowerCase()) throw new Error(`User with username '${username}' already exists!`);
    }
    password = helper.checkPassword(password);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //const hashedPassword = password;
    // Create a new user object to insert into mongodb
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: hashedPassword,
        reviews: [],
        RSVP: [],
        friends: [],
        isVerified: true,
        verificationToken: null,
        isAdmin: false
    };
    const userCollection = await users();
    const newUserInformation = await userCollection.insertOne(newUser);
    if (!newUserInformation.acknowledged || !newUserInformation.insertedId) throw new Error("User insert failed!");
    // Get the new inserted user and return the user object
    return await getUserById(newUserInformation.insertedId.toString());
}



// Function to create a new VERIFIED user (only used by seed.js)
const createAdminUser = async (
    firstName,  // string
    lastName,   // string
    email,      // string
    username,   // string
    password    // string
) => {
    // Verify each input
    firstName = helper.checkName(firstName, 'firstName');
    lastName = helper.checkName(lastName, 'lastName');
    // Verify that another user does not exist with the same email
    email = helper.checkEmail(email);
    let allUsers = await getAllUsers();
    username = helper.checkString(username, 'username');
    // Check if a user already exists with the given email or username
    for (let i = 0; i < allUsers.length; i++) {
        if (email.toLowerCase() === allUsers[i].email.toLowerCase()) throw new Error(`User with email '${email}' already exists!`);
        if (username.toLowerCase() === allUsers[i].username.toLowerCase()) throw new Error(`User with username '${username}' already exists!`);
    }
    password = helper.checkPassword(password);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //const hashedPassword = password;
    // Create a new user object to insert into mongodb
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: hashedPassword,
        reviews: [],
        RSVP: [],
        friends: [],
        isVerified: true,
        verificationToken: null,
        isAdmin: true
    };
    const userCollection = await users();
    const newUserInformation = await userCollection.insertOne(newUser);
    if (!newUserInformation.acknowledged || !newUserInformation.insertedId) throw new Error("User insert failed!");
    // Get the new inserted user and return the user object
    return await getUserById(newUserInformation.insertedId.toString());
}


// Get an array of all user objects
const getAllUsers = async () => {
    const userCollection = await users();
    const userList = userCollection.find({}).toArray();
    return userList;
}


// Get a user by their id
const getUserById = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the user from mongodb
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (!user) throw new Error("User not found!");
    // Convert the user _id to a string before returning the user object
    user._id = user._id.toString();
    return user;
}


// Get a user by their verification token
const getUserByVerificationToken = async (tokenId) => {
    // Validate id
    tokenId = helper.checkId(tokenId);
    // Get the user from mongodb
    const userCollection = await users();
    const user = await userCollection.findOne({"verificationToken._id": new ObjectId(tokenId)});
    if (!user) throw new Error(`User not found with verification token id: ${tokenId}!`);
    // Convert the user _id to a string before returning the user object
    user._id = user._id.toString();
    return user;
}


// Delete user given their id
const removeUser = async (id) => {
    // Validate id
    id = helper.checkId(id);
    // Get the user from mongodb
    const userCollection = await users();
    const deletedUser = await userCollection.findOneAndDelete({_id: new ObjectId(id)});
    if (!deletedUser) throw new Error(`Could not remove user with id '${id}'!`);
    // Convert the user _id to a string before returning the deleted user object
    deletedUser._id = deletedUser._id.toString();
    return deletedUser;
}


// Use a PUT request to update a user's username
const updateUsername = async (id, username) => {
    id = helper.checkId(id);
    username = helper.checkString(username, 'username');
    const userCollection = await users();
    const updatedUser = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: {username: username}},
        {ReturnDocument: 'after'}
    );
    // ******* DOUBLE CHECK THIS *******
    if (!updatedUser) throw new Error(`Updated failed, couldn't find user with id '${id}'!`);
    const newUserInfo = await userCollection.findOne({_id: new ObjectId(id)});
    return newUserInfo;
}


// Mark a user as verified once they verify their email
const verifyUserSignup = async (id) => {
    id = helper.checkId(id);
    const userCollection = await users();
    // Mark user as verified and delete their verification token
    const updatedUser = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: {isVerified: true, verificationToken: null}}
    );
    // ******* DOUBLE CHECK THIS *******
    if (!updatedUser) throw new Error(`User verification failed, couldn't find user with id '${id}'!`);
    const newUserInfo = await userCollection.findOne({_id: new ObjectId(id)});
    return newUserInfo;
}

// Add user to a user's friend list
const addFriend = async (id, friendId) => {
    id = helper.checkId(id);
    friendId = helper.checkId(friendId);
    // Prevent self-following
    if (id === friendId) throw new Error('Cannot add or remove yourself as a friend.');
    const allUsers = await getAllUsers();
    // Verify that 'id' and 'friendId' exist
    let idFound = false;
    let friendIdFound = false;
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i]._id.toString() === id) idFound = true;
        if (allUsers[i]._id.toString() === friendId) friendIdFound = true;
    }
    if (!idFound) throw new Error('User id not found!');
    if (!friendIdFound) throw new Error('Friend id not found!');
    // Add the friend to user's friend list (make sure they're not already in the friends list)
    let user = await getUserById(id);
    const userCollection = await users();
    let updatedUser = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$addToSet: {friends: friendId}},
    );
    // Return the user's list of friends
    updatedUser = await getUserById(id);
    return updatedUser.friends;
}

// Remove user from a user's friend list
const removeFriend = async (id, friendId) => {
    id = helper.checkId(id);
    friendId = helper.checkId(friendId);
    if (id === friendId) throw new Error('Cannot add or remove yourself as a friend.');
    const allUsers = await getAllUsers();
    // Verify that 'id' and 'friendId' exist
    let idFound = false;
    let friendIdFound = false;
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i]._id.toString() === id) idFound = true;
        if (allUsers[i]._id.toString() === friendId) friendIdFound = true;
    }
    if (!idFound) throw new Error('User id not found!');
    if (!friendIdFound) throw new Error('Friend id not found!');
    // Remove the friend from user's friend list (make sure they're in the friends list)
    let user = await getUserById(id);
    let inFriendsList = false;
    for (let i = 0; i < user.friends.length; i++) if (user.friends[i] === friendId) inFriendsList = true;
    if (!inFriendsList) throw new Error('This user is not in your friends list!');
    const userCollection = await users();
    let updatedUser = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$pull: {friends: friendId}},
    );
    // Return the user's list of friends
    updatedUser = await getUserById(id);
    return updatedUser.friends;
}


// Get all the users who follow the user with the given id
const getAllPeopleFollowingThisUser = async(id) => {
    id = helper.checkId(id);
    const allUsers = await getAllUsers();
    // Return an array of all the user objects who have this user listed in their 'friends' list
    let following = [];
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].friends.includes(id) && id !== allUsers[i]._id.toString()) following.push(allUsers[i]);
    }

    return following;
}


// Get all the users who follow the user with the given id
const getFollowingList = async(id) => {
    id = helper.checkId(id);
    const user = await getUserById(id);
    // Return an array of all the user objects this user follows
    let following = [];
    for (let i = 0; i < user.friends.length; i++) {
        let followedUser = await getUserById(user.friends[i]);
        following.push(followedUser);
    }

    return following;
}


/* Get all of the user's reviews
// ****************************************** INCOMPLETE ******************************************
const getAllUserReviews = async (id) => {
    id = helper.checkId(id);
    const allUsers = await getAllUsers();
    // Verify that user with 'id' exists
    let idFound = false;
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i]._id.toString() === id) idFound = true;
    }
    if (!idFound) throw new Error('User id not found!');

}
// ****************************************** INCOMPLETE ******************************************
*/



// Exported functions
export default {
    createUser,
    createVerifiedUser,
    createAdminUser,
    getAllUsers,
    getUserById,
    getUserByVerificationToken,
    removeUser,
    updateUsername,
    verifyUserSignup,
    addFriend,
    removeFriend,
    getAllPeopleFollowingThisUser,
    getFollowingList
}

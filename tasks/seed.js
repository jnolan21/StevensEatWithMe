import { ObjectId } from 'mongodb';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import restaurants from '../data/restaurants.js';
import reviews from '../data/reviews.js';
import menuItems from '../data/menuItems.js';

// Command to run seed.js: node ./tasks/seed.js

const db = await dbConnection();
await db.dropDatabase();


// createVerifiedUser() (user1)
let user1;
try {
    user1 = await users.createVerifiedUser("  Atilla ", " Duck ", " atilla@stevens.edu", "atilla1 ", " Hello_world1234 ");
    //console.log(user1);
} catch (e) {
    console.error(`${e.message}`);
}

// createUser() (user2)
let user2;
try {
    user2 = await users.createVerifiedUser("  Donald ", " Duck ", " thedon@stevens.edu", "donaldd1 ", " Quack123$Quack ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createUser() (user3)
let user3;
try {
    user3 = await users.createVerifiedUser("  The ", " Admin ", " admin@stevens.edu", " admin ", " The_0Admin0_Of_EatWithMe ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createRestaurant() (restaurant1)
let restaurant1;
try {
    restaurant1 = await restaurants.createRestaurant(
        "   Pierce Dining Hall  ",
        " 2nd Floor of Wesley J. Howe Center ",
        [],
        [" Mixed-Cuisin ", " Comfort Food ", " Fast Food  "]
    );
    //console.log(restaurant1);
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (menuItem1)
let menuItem1;
try {
    menuItem1 = await menuItems.createMenuItem(
        restaurant1._id,
        " Grilled Chicken Cheddar Sandwich ",
        " Grilled chicken, cheddar cheeese, lettuce, tomato, and onion on a whole wheat roll. "
    );
    //console.log(menuItem1);
} catch (e) {
    console.log(`${e.message}`);
}

// createReview() (review1)
let review1;
try {
    review1 = await reviews.createReview(
        user1._id,
        restaurant1._id,
        menuItem1._id,
        " The best food I've ever had in my life! ",
        5,
        5
    );
    //console.log(review1);
} catch (e) {
    console.log(`${e.message}`);
}

// createReview() (review2)
let review2;
try {
    review2 = await reviews.createReview(
        user2._id,
        restaurant1._id,
        menuItem1._id,
        " Good food, very convient to 'grab-and-go'. ",
        4,
        5
    );
    //console.log(review2);
} catch (e) {
    console.log(`${e.message}`);
}

// createReview() (review3)
let review3;
try {
    review3 = await reviews.createReview(
        user1._id,
        restaurant1._id,
        menuItem1._id,
        " Good to. ",
        4,
        3
    );
    //console.log(review2);
} catch (e) {
    console.log(`${e.message}`);
}


/* createUser() - Error: user already exists with this email
try {
    let user = await users.createUser("  Scrouge ", " McDuck ", " thedon@stevens.edu", "duckman1 ", " i_love_gold ");
    console.log(user);
} catch (e) {
    console.error(`${e.message}`);
} */

/* removeUser(user1)
try {
    let user = await users.removeUser(user1._id);
    console.log(user);
} catch (e) {
    console.error(`${e.message}`);
} */


// addFriend() - add user2 to user1's friend list
try {
    let user1FriendsList = await users.addFriend(user1._id, user2._id);
    //console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}

/* addFriend() - Error user2 is already in user1's friend list
try {
    let user1FriendsList = await users.addFriend(user1._id, user2._id);
    console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}
*/

// removeFriend() - remove user2 from user1's friend list
try {
    let user1FriendsList = await users.removeFriend(user1._id, user2._id);
    //console.log(user1FriendsList);
} catch (e) {
    console.error(`${e.message}`);
}




/* CAN DELETE ALL THESE FUNCTIONS
try {
    console.log("User #1");
    //console.log(await users.getUserById(user1._id));
} catch (e) {
    console.log(`${e.message}`);
}
try {
    console.log("Restaurant #1");
    //console.log(await restaurants.getRestaurantById(restaurant1._id));
} catch (e) {
    console.log(`${e.message}`);
}
try {
    console.log("Review #1")
    //console.log(await reviews.getReviewById(review1._id));
} catch (e) {
    console.log(`${e.message}`);
}
try {
    console.log("Menu Item #1 (for restaurant #1)");
    //console.log(await menuItems.getMenuItemById(menuItem1._id));
} catch (e) {
    console.log(`${e.message}`);
}
*/



console.log('Done seeding database');

await closeConnection();
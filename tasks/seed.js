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

// createVerifiedUser() (user2)
let user2;
try {
    user2 = await users.createVerifiedUser("  Donald ", " Duck ", " thedon@stevens.edu", "donaldd1 ", " Quack123$Quack ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createVerifiedUser() (user3)
let user3;
try {
    user3 = await users.createVerifiedUser("  Foo ", " Bar ", " foobar@stevens.edu", " foobar01 ", " The_Foo_Bar_OG123 ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createAdminUser() (user4)
let user4;
try {
    user4 = await users.createAdminUser("  The ", " Admin ", " admin@stevens.edu", " admin ", " The_0Admin0_Of_EatWithMe ");
    //console.log(user2);
} catch (e) {
    console.error(`${e.message}`);
}

// createRestaurant() (pierceDiningHall)
let pierceDiningHall;
try {
    pierceDiningHall = await restaurants.createRestaurant(
        "   Pierce Dining Hall  ",
        " 2nd Floor of Wesley J. Howe Center ",
        [],
        [" Mixed-Cuisine ", " Comfort Food ", " Fast Food  "],
        {
            "Sunday": "10:00AM - 10:00PM",
            "Monday": "7:00AM - 12:00AM",
            "Tuesday": "7:00AM - 12:00AM",
            "Wednesday": "7:00AM - 12:00AM",
            "Thursday": "7:00AM - 12:00AM",
            "Friday": "7:00AM - 12:00AM",
            "Saturday": "10:00AM - 10:00PM"
        },
        "",
        ["Vegan", "Dairy-free", "Soy-free", "Shellfish-free", "Nut-free", "Gluten-free"]
    );
    //console.log(pierceDiningHall);
} catch (e) {
    console.log("PIERCE ERROR")
    console.log(`${e.message}`);
}

// createRestaurant() (yellas)
let yellas;
try {
    yellas = await restaurants.createRestaurant(
        "   Yellas  ",
        " University Center, 1st Floor ",
        [],
        [" Mixed-Cuisin ", " Comfort Food ", " Fast Food  "],
        {
            "Sunday": "9:00AM - 12:00AM",
            "Monday": "9:00AM - 12:00AM",
            "Tuesday": "9:00AM - 12:00AM",
            "Wednesday": "9:00AM - 12:00AM",
            "Thursday": "9:00AM - 12:00AM",
            "Friday": "9:00AM - 12:00AM",
            "Saturday": "9:00AM - 12:00AM"
        },
        "",
        ["Vegan", "Vegeterian"]
    );
    //console.log(yellas);
} catch (e) {
    console.log("YELLAS ERROR")
    console.log(`${e.message}`);
}

// createMenuItem() (menuItem1)
let menuItem1;
try {
    //console.log(pierceDiningHall)
    //console.log(yellas);
    menuItem1 = await menuItems.createMenuItem(
        pierceDiningHall._id,
        " Grilled Chicken Cheddar Sandwich ",
        " Grilled chicken, cheddar cheeese, lettuce, tomato, and onion on a whole wheat roll. ",
        []
    );
    //console.log(menuItem1);
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (menuItem2)
let menuItem2;
try {
    menuItem2 = await menuItems.createMenuItem(
        yellas._id,
        " The Uncle Babe ",
        " Hot Sub : Deluxe Ham, Salami, Fresh Mozzarella, Roasted Peppers ",
        []
    );
    //console.log(menuItem3);
} catch (e) {
    console.log(`${e.message}`);
}

// createMenuItem() (menuItem3)
let menuItem3;
try {
    menuItem3 = await menuItems.createMenuItem(
        yellas._id,
        " The Fat Angelo ",
        " Hot Sub : Sliced Steak, Roasted Potatoes, Peppers & Onions, American Cheese, Sub Roll ",
        []
    );
    //console.log(menuItem1);
} catch (e) {
    console.log(`${e.message}`);
}

// getAllMenuItems() (yellas)
try {
    let yellasMenuItems = await menuItems.getAllMenuItems(yellas._id);
    //console.log(yellasMenuItems);
} catch (e) {
    console.log(`${e.message}`);
}

// getMenuItemById() (The Fat Angelo)
try {
    let theFatAngelo = await menuItems.getMenuItemById(menuItem3._id.toString());
    //console.log(theFatAngelo);
} catch (e) {
    console.log(`${e.message}`);
}

/*
// createReview() (review1)
let review1;
try {
    review1 = await reviews.createReview(
        user1._id,
        pierceDiningHall._id,
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
        pierceDiningHall._id,
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
        pierceDiningHall._id,
        menuItem1._id,
        " Good. ",
        4,
        3
    );
    //console.log(review2);
} catch (e) {
    console.log(`${e.message}`);
}

// createReview() (review3)
let review4;
try {
    review4 = await reviews.createReview(
        yellas._id,
        pierceDiningHall._id,
        menuItem1._id,
        " Good. ",
        4,
        3
    );
    //console.log(review2);
} catch (e) {
    console.log(`${e.message}`);
}
*/

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





console.log('Done seeding database');

await closeConnection();
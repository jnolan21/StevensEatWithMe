// ************* Used for function testing *************
import userData from '../data/users.js';
import reviewData from '../data/reviews.js'
import restaurantData from '../data/restaurants.js'
import helper from '../data/helpers.js';
import {config} from 'dotenv';

config();

// Command: node ./tasks/tester.js

/* Testing passwords
try {
    helper.checkPassword("  Hello_World1234   ");
    console.log("Valid password!");
} catch (e) {
    console.log(`${e.message}`);
} */

// Testing emails
try {
    helper.checkEmail("  atilla@stevens.edu ");
    //console.log("Valid email!");
} catch (e) {
    console.log(`${e.message}`);
}

// Testing review parameters
try {
    //let review = await reviewData.createReview(movie1);
    //console.log(review);
} catch (e) {
    console.log(`${e.message}`);
}


/* Testing createRestaurant()
try {
    let restaurant = await restaurantData.createRestaurant(
        "   Pierce Dining Hall  ",
        " 2nd Floor of Wesley J. Howe Center ",
        [],
        [" Mixed-Cuisin ", " Comfort Food ", " Fast Food  "]
    );
    console.log(restaurant);
} catch (e) {
    console.log(`${e.message}`);
} */
import {ObjectId, Timestamp} from 'mongodb';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import userData from './users.js'
import reviewData from './reviews.js';
import menuItemData from './menuItems.js';
import restaurants from './restaurants.js'
import users from './users.js'
import xss from 'xss'

// Verifies that a string input is non-empty string, and returns the trimmed string
function checkString(str, str_name) {
    if (str === undefined) throw new Error(`${str_name} cannot be empty.`);
    if (typeof str !== "string") throw new Error(`${str_name} must be a string.`);
    if (str.trim().length === 0) throw new Error(`${str_name} cannot be just spaces.`);
    return str.trim();
}

// Verifies that a mongodb string id is a non-empty, valid ObjectId() and returns the trimed version of it
function checkId(id) {
    if (id === undefined) throw new Error(`Id cannot be empty.`);
    if (typeof id !== 'string') throw new Error(`Id must be a string.`);
    id = id.trim();
    if (id.length === 0) throw new Error(`Id cannot be an empty string.`);
    if (!ObjectId.isValid(id)) throw new Error(`Invalid object ID.`);
    return id;
}

// Verifies that 'name' is a string with no numbers and returns the trimed version of it
function checkName(name, str_name) {
    if (name === undefined) throw new Error(`${str_name} cannot be empty.`);
    if (typeof name !== 'string') throw new Error(`${str_name} must be a string.`);
    name = name.trim();
    if (name.length === 0) throw new Error(`${str_name} cannot be an empty string.`);
    for (let i = 0; i < name.length; i++) if (name[i] !== ' ' && !isNaN(name[i])) throw new Error(`Error in ${func_name}: ${str_name} cannot contain numbers.`);
    return name;
}

// Verifies the username provided is valid
function checkUsername(username) {
    if (username === undefined) throw new Error(`Username cannot be empty.`);
    if (typeof username !== 'string') throw new Error(`Username must be a string.`);
    username = username.trim();
    if (username.length === 0) throw new Error(`Username cannot be an empty string.`);
    if (username.length > 50) throw new Error(`Username can have no more than 50 characters.`);
    for (let i = 0; i < username.length; i++) {
        if (!('a' <= username[i] && username[i] <= 'z') && !('A' <= username[i] && username[i] <= 'Z') && !('0' <= username[i] && username[i] <= '9'))
            throw new Error(`Username can only contain letters and numbers.`);
    }
    return username;
}

// Verifies that an email is of the form "***@stevens.edu"
function checkEmail(email) {
    if (email === undefined) throw new Error('Email cannot be blank.');
    if (typeof email !== 'string') throw new Error('Email must be a string.');
    email = email.trim();
    if (email.length === 0) throw new Error('Email cannot be an empty string.');
    if (email[0] === '@' || email.length < 12 || email.length > 256) throw new Error('Invalid email.');
    if (email.substring((email.length - 12)).toLowerCase() !== '@stevens.edu') throw new Error('Email must be a Stevens email (@stevens.edu).');
    return email.toLowerCase();
}

// Verifies that a password is valid: must have at least 12 characters, one uppercase letter, one lowercase letter, one number, and one symbol
function checkPassword(password) {
    if (password === undefined) throw new Error('Password cannot be empty.');
    if (typeof password !== 'string') throw new Error('Password must be a string.');
    password = password.trim()
    if (password.length === 0) throw new Error('Password cannot be an empty string.');
    if (password.length < 12) throw new Error('Password must have at least 12 characters.');
    let uppercaseFound = false;
    let lowercaseFound = false;
    let numberFound = false;
    let symbolFound = false;
    for (let i = 0; i < password.length; i++) {
        if ('0' <= password[i] && password[i] <= '9') numberFound = true;
        if ('a' <= password[i] && password[i] <= 'z') lowercaseFound = true;
        if ('A' <= password[i] && password[i] <= 'Z') uppercaseFound = true;
        if (/[^a-zA-Z0-9\s]/.test(password[i])) symbolFound = true;
    }
    if (!uppercaseFound || !lowercaseFound || !numberFound || !symbolFound) throw new Error('Password must contain at least one lowercase letter, uppercase letter, number, and symbol.');
    return password;
}

// Verify review rating - should be a number 0 - 5
function checkReviewRating(rating) {
    if (rating === undefined) throw new Error('Rating cannot be empty.');
    if (typeof rating !== 'number') throw new Error('Rating must be a number.');
    if (rating !== 0 && rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4 && rating !== 5) throw new Error('Rating must be a whole number 0 - 5.');
    return rating;
}

function checkWaitTime(time) {
    if (!time || typeof time !== 'string') throw 'Must be a valid time input entered.'
    time = time.trim();
    if (time === "") throw "Time Cannot be Spaces or Empty.";


    const format = /^(\d+)h (\d{1,2})min$/;
    if(!format.test(time)) throw "Time must be in the format #h #min";

    const [hour, minutes] = time.split(" ");

    const h = parseInt(hour);
    const m = parseInt(minutes);

    
    if (m < 0 || m > 59 || h < 0) throw "Hours must be greater than 0 and minutes must be between 0 and 59.";
    if (h > 5) throw "Max of 5 hours"
    return time;
}

// Verify the person's email using 'nodemailer' package
const sendVerificationEmail = async (id) => {
    // Initalize SendGrid with API key from .env
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    id = checkId(id);
    let user = await userData.getUserById(id);
    let token = user.verificationToken;
    let email = user.email;

    const url = `http://localhost:3000/users/verifyEmail?token=${token._id}`;
    const emailInformation = {
        from: process.env.VERIFICATION_EMAIL,
        to: email,
        subject: 'EatWithMe Email Verification',
        text: `Please clink the following link to verify your email: ${url}`,
        html: `<p><a href="${url}">Verify Email</a></p>`,
        // Disable sendGrid API's link encoding so the simple link is sent
        trackingSettings: {
            clickTracking: {
                enable: false,
                enableText: false
            }
        }
    };
    // Send the verification email
    try {
        await sgMail.send(emailInformation);
    } catch (e) {
        throw new Error('Error sending verification email.');
    }
}

// Verifies an array of id's
function checkIdArray(array, arr_name) {
    if (array === undefined) throw new Error(`${arr_name} input cannot be empty.`);
    if (!Array.isArray(array)) throw new Error(`${arr_name} must be an array.`);
    for (let i = 0; i < array.length; i++) {
        if (!(typeof array[i] === 'string')) throw new Error(`${arr_name} can only contain string elements.`);
        // Check each string - make sure its a valid id
        array[i] = array[i].trim();
        try {
            array[i] = checkId(array[i]);
        } catch (e) {
            // If array[i] not an id, throw error
            throw new Error(`${arr_name} can only contain valid ObjectIds.`);
        }
    }
    return array;
}

// Verifies a restaurant's overall rating
function checkOverallRating(rating) {
    if (rating === undefined) throw new Error("Rating cannot be empty.");
    if (typeof rating !== "number") throw new Error("Rating must be a number 0-5");
    if (rating < 0 || rating > 5) throw new Error("Rating must be a number 0-5");
    // If rating is a non-integer number, round to one decimal
   rating = Math.floor((rating * 10)) / 10;
   return rating;
}

// Verifies an array of strings
function checkStringArray(arr, arr_name) {
    if (arr === undefined) throw new Error(`${arr_name} input cannot be empty.`);
    if (!Array.isArray(arr)) throw new Error(`${arr_name} must be an array.`);
    for (let i = 0; i < arr.length; i++) {
        // Call 'checkString()' on each element
        try {
            arr[i] = checkString(arr[i]);
        } catch (e) {
            throw new Error(`${arr_name} must be an array of string.`);
        }
    }
    return arr;
}

//Checks hours of operation for a full thing
function checkHoursOfOperation(ho) {
    if (typeof ho !== 'object' || Array.isArray(ho)) throw new Error ("Hours of Operation must be an object.");
    const days = Object.keys(ho);
    const dayTimePairs = Object.entries(ho);
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (days.length !== validDays.length || !days.every(day => validDays.includes(day))) {
        throw new Error("Hours of Operation must have Monday-Sunday");
    }
    
    const regex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AP][M])) - ((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AP][M]))$/;
    // Check that each value is a string
    for (let [day, time] of dayTimePairs) {
        if (typeof time !== 'string') throw new Error("Daily hours of operation must be a string.");
        time = time.trim();
        if (time === '') throw new Error(`Operating times for ${day} cannot be empty.`);
        if (time.toLowerCase() === 'closed') {
            ho[day] = 'closed';
            continue;
        }
        if(!regex.test(time)) throw new Error("Time must be in the form HH:MM AM/PM, or 'Closed'.");
        ho[day] = ho[day].trim();
    }
    return ho;
}

function checkHours(time) {
    const regex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AP][M]))$/
    if(time.toLowerCase() !== "closed" && (typeof time !== 'string' || !regex.test(time))) {
        throw new Error("Time must be in the form HH:MM AM/PM");
    }
}


  async function calculateMenuItemRating(menuItem) {
    // Before inserting the new review, calculate the new overall rating of that food item
    let reviewsArray = menuItem.reviews;
    if (reviewsArray.length === 0) return 0;
    let overallRating = 0;
    for (let i = 0; i < reviewsArray.length; i++) {
        // Get the full review object's rating
        let review = await reviewData.getReviewById(reviewsArray[i]);
        overallRating += review.rating;
    }
    // Calculate the average menu item rating and truncate it
    overallRating = overallRating / (reviewsArray.length);
    overallRating = Math.floor((overallRating * 100)) / 100;
    return overallRating;
  }

  async function calculateRestaurantRating(restaurant) {
    // Before inserting the new review, calculate the new overall rating of that restaurant
    let reviewsArray = restaurant.reviews;
    if (reviewsArray.length === 0) return 0;
    let overallRating = 0;
    for (let i = 0; i < reviewsArray.length; i++) {
        // Get the full review object's rating
        let review = await reviewData.getReviewById(reviewsArray[i]);
        overallRating += review.rating;
    }
    // Calculate the average rating and truncate it
    overallRating = overallRating / (reviewsArray.length);
    overallRating = Math.floor((overallRating * 100)) / 100;
    return overallRating
  }


  /**
   * 
   * @param {Time for the first movie #h #min} waitTimeOne 
   * @param {Time for the second movie #h #min} waitTimeTwo 
   * 
   * Parses both of these and converts them to minutes so I can then sort them based on wait time
   */
  function subtractWaitTime(waitTimeOne, waitTimeTwo) {
    waitTimeOne = checkWaitTime(waitTimeOne);
    waitTimeTwo = checkWaitTime(waitTimeTwo);

    let [hoursOne, minutesOne] = waitTimeOne.split(" ");
    let [hoursTwo, minutesTwo] = waitTimeTwo.split(" ");
    hoursOne = parseInt(hoursOne) * 60;
    minutesOne = parseInt(minutesOne);
    const timeOne = hoursOne + minutesOne; //Total minutes for waitTimeOne
    hoursTwo = parseInt(hoursTwo) * 60;
    minutesTwo = parseInt(minutesTwo);
    const timeTwo = hoursTwo + minutesTwo; //Total minutes for waitTimeTwo


    return timeOne - timeTwo;
  }

function upTooThree(arr) {
    if (!arr || !Array.isArray(arr)) throw "Must be an array.";

    const size = arr.length;

    if (size >= 3) return 3;
    else return size;
}

function checkMeetUpTime(meetUpTime){
    // make sure it's an object
    if (typeof meetUpTime !== 'object' || meetUpTime === null) {
        throw new Error('meetUpTime must be object.');
    }
    // make sure it has the date and time keys
    const keys = Object.keys(meetUpTime);
    if (keys.length !== 2 || !keys.includes('Date') || !keys.includes('Time')) {
        throw new Error('meetUpTime needs Date and Time keys.')
    }
    let dateStr = meetUpTime['Date'];
    let timeStr = meetUpTime['Time'];
    // make sure dateStr and timeStr are both strs
    if (typeof dateStr !== 'string') throw new Error('meetUpTime[Date] must be str.');
    if (typeof timeStr !== 'string') throw new Error('meetupTime[Time] must be str.');
    // make sure date format is MM/DD/YYY and time format is HH:MM{AM/PM}
    let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    let timeRegex = /^(0[1-9]|1[0-2]):[0-5]\d(?:AM|PM)$/;
    if (!dateRegex.test(dateStr)){
        throw new Error('Date must have format MM/DD/YYYY');
    }
    if (!timeRegex.test(timeStr)){
        timeStr = fixMilitaryTime(timeStr);
        if (!timeRegex.test(timeStr)){
            throw new Error('Time must have format HH:MM{AM/PM}');
        }
    }
    meetUpTime.Time = timeStr;
    return meetUpTime;
}
function fixMilitaryTime(miltime){
    //format the military time 
    let [hourStr, minuteStr] = miltime.split(':');
    let hour = Number(hourStr);
    let minute = minuteStr;
    let period;
    if(hour >=12){ period = 'PM';}
    else{ period = 'AM';}
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    //add leading 0 to hour if needed
    let formattedHour;
    if (hour < 10) {
      formattedHour = '0' + hour;
    }
    else{
      formattedHour = hour;
    }

    miltime = `${formattedHour}:${minute}${period}`;
    miltime=miltime.trim();
    return miltime;

}


async function formatAndCheckRSVPS(allrsvps){ //given a list of raw rsvp objects, returns current rsvps with  (non-expired and happening within current year) with list of attendees as user names rather than just IDs, and also restaurant name instead of ID, and same for the user that posted
    let currentRsvps = [];
    for(let i =0; i< allrsvps.length; i++){
        let [month, day, year] = (allrsvps[i].meetUpTime.Date).split('/');
        let inputDate = new Date(Number(year), Number(month) - 1, Number(day));        
        let today = new Date();
 
        // Compare only the date parts (year, month, day)
        if(inputDate.getFullYear() > today.getFullYear() ||
           (inputDate.getFullYear() === today.getFullYear() && inputDate.getMonth() > today.getMonth()) ||
           (inputDate.getFullYear() === today.getFullYear() && inputDate.getMonth() === today.getMonth() && inputDate.getDate() >= today.getDate())) { //if not a past rsvp
            if(inputDate.getFullYear() === today.getFullYear() && inputDate.getMonth() === today.getMonth() && inputDate.getDate() === today.getDate()){ //if the rsvp is currently today lets make sure its not expired (by more than an hour)
                let [time, period] = (allrsvps[i].meetUpTime.Time).split(/(AM|PM)/); // ex: split into "3:45" and "PM"
                let [hoursStr, minutesStr] = time.split(':'); //seperate mins and hours by colon
                let hours = Number(hoursStr);
                const minutes = Number(minutesStr);
                //convert to military time to comapre to current time
                if (period === 'PM' && hours !== 12) {
                    hours += 12;
                }
                if (period === 'AM' && hours === 12) {
                    hours = 0; //make midnight 0
                }
                //get current time in minutes
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const inputMinutes = hours * 60 + minutes;
                if (inputMinutes > currentMinutes){ // Only check if the time is in the future
                    let rest = await restaurants.getRestaurantById(allrsvps[i].restaurantId);
                    allrsvps[i].restaurantId = rest.name;
                    let userPosted = await users.getUserById(String(allrsvps[i].userId));
                    allrsvps[i].user = userPosted.firstName;
                    currentRsvps.push(allrsvps[i]);
                }
            }
            else{ //future rsvp (not current day),just psush
                let rest = await restaurants.getRestaurantById(allrsvps[i].restaurantId);
                allrsvps[i].restaurantId = rest.name;
                let userPosted = await users.getUserById(String(allrsvps[i].userId));
                allrsvps[i].user = userPosted.firstName;
                currentRsvps.push(allrsvps[i]);
            }


            }




      }
    //now lets update each list of attenders for each current rsvp with the actual names of the users rather than just IDS
      for(let i =0; i< currentRsvps.length; i++){
        let namesAttending = [];
        let userIdsAttending = currentRsvps[i].usersAttending; //get all IDS of users attending
        for (let j=0 ;j<userIdsAttending.length; j++){
            let currUser = (await userData.getUserById(userIdsAttending[j])).firstName;
            namesAttending.push(currUser)
        }
        currentRsvps[i].usersAttending = namesAttending;
      }
      return currentRsvps;
}

function isFutureDateTime(dateStr, timeStr) {
    let [month, day, year] = dateStr.split('/').map(Number);
    let [timePart, period] = timeStr.split(/(AM|PM)/i);
    let [hoursStr, minutesStr] = timePart.split(':');
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);
  
    //convert to 24h format
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    //make Date object for RSVP
    let meetupTime = new Date(year, month - 1, day, hours, minutes);
  
    //get current time
    let now = new Date();

  
    return meetupTime > now;
  }
  
function checkCommentLength(comment){
    const minLength = 10;
    const maxlength = 400;
    comment = comment.trim();
    if(!comment || comment.length < minLength){
        throw new Error("Comment must be at least 10 characters.")
    }
    if(comment.length > maxlength) throw new Error("Comment must be no more than 400 characters. ")
}
function checkreviewlength(review){
    const minLength = 10;
    const maxlength = 1000;
    review = review.trim();
    if(!review || review.length < minLength){
        throw new Error("Review must be at least 10 characters.")
    }
    if(review.length > maxlength) throw new Error("Review must be no more than 1000 characters. ")
}

function stringToArray(str, strName) {
    str = checkString(str, strName);
    let stringArray = [];
    let currentWord = '';
    const regex = /^[A-Za-z ]+$/;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ',') {
            if (currentWord.length > 0) {
                let word = currentWord.trim();
                if (word.length > 0) {
                    if (!regex.test(word)) throw new Error(`${strName} can only contain letters separated by commas.`);
                    stringArray.push(word);
                }
                currentWord = '';
            }
        } else {
            currentWord += str[i];
        }
    }
    if (currentWord.trim().length > 0) {
        if (!regex.test(currentWord.trim())) throw new Error(`${strName} can only contain letters separated by commas.`);
        stringArray.push(currentWord.trim());
    }
    return stringArray;
}


function stringArrayToString(arr, arrName) {
    if (arr === undefined) throw new Error(`${arrName} cannot be empty.`);
    if (!Array.isArray(arr)) throw new Error(`${arrName} must be an array.`);
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== 'string') throw new Error(`${arrName} cannot contain non-string elements.`);
        arr[i] = arr[i].trim();
        if (i != arr.length - 1) str += arr[i] + ', ';
        else str += arr[i];
    }
    return str;
}

function checkDietaryRestrictions(dr) {
    if (dr === undefined) throw new Error(`Restaurant dietary restrictions cannot be empty.`);
    if (!Array.isArray(dr)) throw new Error(`Restaurant dietary restrictions must be an array.`);
    let dietaryRestrictions = ['vegetarian', 'nut-free', 'vegan', 'dairy-free', 'gluten-free'];
    let drSet = new Set();
    for (let i = 0; i < dr.length; i++) {
        let element;
        try {
            element = checkString(dr[i], 'Dietary restriction element');
        } catch (e) {
            throw new Error(`Invalid dietary restriction: ${e.message}.`);
        }
        // Check if this is a valid dietary restriction
        if (!dietaryRestrictions.includes(element.toLowerCase())) throw new Error(`${element} is not a valid dietary restriction.`);
        element = element.toLowerCase();
        // Capitalize the first letter
        element = element.charAt(0).toUpperCase() + element.slice(1);
        drSet.add(element);
    }
    // Return the dietaryRestrictions sorted for consistency
    return Array.from(drSet).sort();
}

function checkReview(review) {

    if (typeof review !== 'string') throw "Review Must be a valid input";
    review.trim();
    if (review.length < 10 && review.length > 1000) throw "Review Must be between 10-1000 characters";
    return review;
  }



function convertWaitTime(waitTime) {
    waitTime = checkWaitTime(waitTime);
    let [hours, minutes] = waitTime.split(" ");
    hours = parseInt(hours) * 60;
    minutes = parseInt(minutes);
    const time = hours + minutes; //Total minutes for waitTime
    return time;
}

function convertNumber(number) {

    if (typeof number !== 'number') throw 'must be a number';
    
    let hours = Math.trunc(number/60);
    let minutes = Math.round(number%60);

    return hours + "h " + minutes + "min" 

}

async function averageRestaurantWaitTime(restaurantId) {

    restaurantId = checkId(restaurantId);
    
    //let restaurant = await getRestaurantById(restaurantId);
    let restaurantReviews = await reviewData.getAllRestaurantReviews(restaurantId);
    //let restaurantReviews = restaurant.reviews;
    let numberOfReviews = restaurantReviews.length;
    let totalwaitTime = 0;

    for (let i = 0; i < numberOfReviews; i++) {
        let waitTime = convertWaitTime(restaurantReviews[i].waitTime);
        totalwaitTime += waitTime; 
    }
    if (numberOfReviews > 0) totalwaitTime = totalwaitTime/numberOfReviews; 
    
    totalwaitTime = convertNumber(totalwaitTime);

    return totalwaitTime;

}


const addHasReviewsKey = (allRestaurants) => {
    for (let i = 0; i < allRestaurants.length; i++) {
        let restaurant = allRestaurants[i];
        let menuItems = restaurant.menuItems;
        if (menuItems && Array.isArray(menuItems)) {
            for (let j = 0; j < menuItems.length; j++) {
                if (menuItems[j].reviews && (menuItems[j].reviews.length > 0)) menuItems[j].hasReviews = true;
                else menuItems[j].hasReviews = false;
            }
        }
    }
}


const clearAdminSession = (session) => {
    session.reviewDeleted = false;
    session.restaurantDeleted = false;
    session.menuItemDeleted = false;
    session.editingRestaurant = false;
    session.editingMenuItem = false;
    session.restaurantInfo = null;
    session.menuItemInfo = null;
    session.message = null;
    session.restaurantDietaryCheckBox = null;
    session.menuItemDietaryCheckBox = null;
}

const buildDietaryCheckBox = (selectedDietaryRestrictions) => {
    const dietaryRestrictions = ['Vegetarian', 'Nut-free', 'Vegan', 'Dairy-free', 'Gluten-free'];
    let dietaryCheckBox = {};
    dietaryRestrictions.forEach(dr => {
        dietaryCheckBox[dr] = selectedDietaryRestrictions.includes(dr);
    })
    return dietaryCheckBox;
}

const fixDietaryInput = (dietaryRestrictions) => {
    if (!dietaryRestrictions) return [];
    if (!Array.isArray(dietaryRestrictions)) return [dietaryRestrictions];
    return dietaryRestrictions;
}

const xssForObjects = (o) => {
    if (o === undefined) throw new Error('Input not provided for xssForObjects()');
    if (typeof o !== 'object' || Array.isArray(o)) throw new Error('Object expected in xssForObjects()');
    let returnObject = {};
    for (let key in o) {
        returnObject[key] = xss(o[key]);
    }
    return returnObject;
}

const xssForArrays = (arr) => {
    if (arr === undefined) throw new Error('Input not provided for xssForArrays()');
    if (!Array.isArray(arr)) throw new Error('Array expected in xssForArrays()');
    return arr.map((element) => xss(element));
}

const checkImgURL = (imageURL) => {
    imageURL = checkString(imageURL, 'Restaurant image URL');
    let checkingURL = new URL(imageURL);
    if (!checkingURL.protocol.startsWith('http')) throw new error('Image URL must be a valid absolute URL starting with http:// or https://');
    return imageURL;
}

const getMinutes = (waitTime) => {

    waitTime = checkWaitTime(waitTime);

    const parts = waitTime.split(" ");
  if (parts.length < 2) return 0;
  const minutesPart = parts[1].trim();      
  
  const minutes = parseInt(minutesPart); 

    if (isNaN(minutes)) throw "Could not get a number"

  
  return minutes;
    
}

const getHours = (waitTime) => {
    waitTime = checkWaitTime(waitTime);

    const hour = parseInt(waitTime);

    if (isNaN(hour)) throw "Could not get a number";

    return hour;
    
}

function waitTimeConversion (time) {

    time = checkWaitTime(time);

    const [hour, minutes] = time.split(" ");
    
    
    let h = parseInt(hour);
    let m = parseInt(minutes);

    h = h * 60
    m = h + m

    return m;

}

function filt (d, w, r, rest) {

    if (!w || typeof w !== 'number') throw "Must enter a valid waitTime"
    r = checkOverallRating(r);
    d = checkDietaryRestrictions(d);

    for (let i = rest.length - 1; i >= 0; i--) {
        const restI = rest[i];
        if (
            waitTimeConversion(restI.averageWaitTime) > w ||
            restI.averageRating < r ||
            (d.length !== 0 &&
            !d.every(restriction => restI.dietaryRestrictions.includes(restriction)))
        ) {
            rest.splice(i, 1);
        }
    }
    return rest;
  }

  const parseTime = (fullHours, time) => {

    let [open, close] = fullHours.split(" - ");

    let o;
    if (open.slice(-2) === 'AM') {
        if (open.slice(0,2) == '12') {
            o = 0;
        } else {
        o = open.slice(0,2);
        if (isNaN(o)) o = open.slice(0,1);
        o = Number(o);
        }
    } else if (open.slice(-2) === 'PM') {
        if (open.slice(0,2) === '12') o = 12;
        else {
            o = open.slice(0,2);
            if (isNaN(o)) o = open.slice(0,1);
            o = Number(o);
            o = o + 12;
        }
    }

    let c;
    if (close.slice(-2) === 'AM') {
        if (close.slice(0,2) === '12') {
            c = 24;
        } else {
        c = close.slice(0,2);
        if (isNaN(c)) c = close.slice(0,1);
        c = Number(c);
        }
    } else if (close.slice(-2) === 'PM') {
        if (close.slice(0,2) == '12') c = 12;
        else {
            c = close.slice(0,2);
            if (isNaN(c)) c = close.slice(0,1);
            c = Number(c);
            c = c + 12;
        }
    }

    let t;
    if (time.slice(-2) === 'AM') {
        t = time.slice(0,2);
        if (isNaN(t)) t = time.slice(0,1);
        t = Number(t);
    } else if (time.slice(-2) === 'PM') {
        if (time.slice(0,2) == '12') t = 12;
        else {
            t = time.slice(0,2);
            t = Number(t);
            t = t + 12;
        }
    }

    

    if (t > o && t < c) return true;

    return false;


}

const isValidMeetupTime = (time,date,ho) => {

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = new Date(date);
    day = day.getDay();

    let weekday = days[day];
    let validTime = ho[weekday];
    if (validTime === 'closed') throw "Restaurant is Closed on this day";


    if (parseTime(validTime, time)) return true;
    else throw "Restaurant is closed at that time";
    
}


// Export all the functions
export default {
    checkString,
    checkId,
    checkName,
    checkEmail,
    checkUsername,
    checkPassword,
    checkReviewRating,
    checkWaitTime,
    sendVerificationEmail,
    checkIdArray,
    checkOverallRating,
    checkStringArray,
    calculateMenuItemRating,
    calculateRestaurantRating,
    subtractWaitTime,
    checkHoursOfOperation,
    upTooThree,
    checkMeetUpTime,
    formatAndCheckRSVPS,
    stringToArray,
    stringArrayToString,
    checkDietaryRestrictions,
    checkReview,
    convertWaitTime,
    convertNumber,
    averageRestaurantWaitTime,
    isFutureDateTime,
    checkCommentLength,
    checkreviewlength,
    addHasReviewsKey,
    clearAdminSession,
    buildDietaryCheckBox,
    fixDietaryInput,
    xssForObjects,
    xssForArrays,
    checkImgURL,
    getHours,
    getMinutes,
    filt,
    isValidMeetupTime
};


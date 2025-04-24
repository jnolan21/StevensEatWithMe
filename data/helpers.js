import {ObjectId} from 'mongodb';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import userData from './users.js'
import reviewData from './reviews.js';
import menuItemData from './menuItems.js';

// Verifies that a string input is non-empty string, and returns the trimmed string
function checkString(str, str_name) {
    if (str === undefined) throw new Error(`${str_name} cannot be empty!`);
    if (typeof str !== "string") throw new Error(`${str_name} must be a string!`);
    if (str.trim().length === 0) throw new Error(`${str_name} cannot be just spaces!`);
    return str.trim();
}

// Verifies that a mongodb string id is a non-empty, valid ObjectId() and returns the trimed version of it
function checkId(id) {
    if (id === undefined) throw new Error(`Id cannot be empty!`);
    if (typeof id !== 'string') throw new Error(`Id must be a string!`);
    id = id.trim();
    if (id.length === 0) throw new Error(`Id cannot be an empty string!`);
    if (!ObjectId.isValid(id)) throw new Error(`Invalid object ID!`);
    return id;
}

// Verifies that 'name' is a string with no numbers and returns the trimed version of it
function checkName(name, str_name) {
    if (name === undefined) throw new Error(`${str_name} cannot be empty!`);
    if (typeof name !== 'string') throw new Error(`${str_name} must be a string!`);
    name = name.trim();
    if (name.length === 0) throw new Error(`${str_name} cannot be an empty string!`);
    for (let i = 0; i < name.length; i++) if (name[i] !== ' ' && !isNaN(name[i])) throw new Error(`Error in ${func_name}: ${str_name} cannot contain numbers!`);
    return name;
}

// Verifies that an email is of the form "***@stevens.edu"
function checkEmail(email) {
    if (email === undefined) throw new Error('Email cannot be blank!');
    if (typeof email !== 'string') throw new Error('Email must be a string!');
    email = email.trim();
    if (email.length === 0) throw new Error('Email cannot be an empty string!');
    if (email[0] === '@' || email.length < 12) throw new Error('Invalid email!');
    if (email.substring((email.length - 12)) !== '@stevens.edu') throw new Error('Email must be a Stevens email (@stevens.edu)!');
    return email.toLowerCase();
}

// Verifies that a password is valid: must have at least 12 characters, one uppercase letter, one lowercase letter, one number, and one symbol
function checkPassword(password) {
    if (password === undefined) throw new Error('Password cannot be empty!');
    if (typeof password !== 'string') throw new Error('Password must be a string!');
    password = password.trim()
    if (password.length === 0) throw new Error('Password cannot be an empty string!');
    if (password.length < 12) throw new Error('Password must have at least 12 characters!');
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
    if (!uppercaseFound || !lowercaseFound || !numberFound || !symbolFound) throw new Error('Error: Password must contain at least one lowercase letter, uppercase letter, number, and symbol!');
    return password;
}

// Verify review rating - should be a number 0 - 5
function checkReviewRating(rating) {
    if (rating === undefined) throw new Error('Rating cannot be empty!');
    if (typeof rating !== 'number') throw new Error('Rating must be a number!');
    if (rating !== 0 && rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4 && rating !== 5) throw new Error('Rating must be a whole number 0 - 5!');
}

// Verifies the wait time - format: "0h 00min"
// function checkWaitTime(time) {
//     // 'waitTime' format: "#h #min"
//     // both #'s must be positive, whole numbers, but min must be between 0 - 59
//     time = time.trim();
//     let hour = "";
//     let minute = "";
//     let checkingHour = true;
//     let checkingMinute = false;
//     let mustBeSpace = false;
//     let hDetected = false;
//     let minDetected = false;
//     for (let i = 0; i < time.length; i++) {
//         // If extra chars found after 'min', throw error
//         if (checkingHour === false && checkingMinute === false && mustBeSpace === false) throw new Error("Invalid 'waitTime'. format: '#h #min'");
//         // If this char should be a space, and isn't, throw an error
//         if (mustBeSpace && (time[i] != ' ')) {
//             throw new Error("Invalid 'waitTime'. format: '#h #min'");
//         } else if (mustBeSpace && (time[i] === ' ')) {
//             // If this char should be a space, and is, then check minutes next
//             mustBeSpace = false;
//             checkingMinute = true;
//             continue;
//         }
//         // Getting the hour number and verifying it is followed by 'h'
//         if (checkingHour && ('0' <= time[i] && time[i] <= '9')) {
//             hour += time[i];
//             continue;
//         } else if (checkingHour && (time[i] === 'h')) {
//             // If the 'h' is found at the end of hour, set next char to be a space
//             hDetected = true;
//             checkingHour = false;
//             mustBeSpace = true;
//             continue;
//         } else if (checkingHour && !('0' <= time[i] && time[i] <= '9')) {
//             // If a non-number char found in the hour, throw error
//             throw new Error("Invalid 'waitTime'. format: '#h #min'");
//         }
//         // Getting the minute number and verifying it is followed by 'h'
//         if (checkingMinute && ('0' <= time[i] && time[i] <= '9')) {
//             minute += time[i];
//             continue;
//         } else if (checkingMinute && (time[i] === 'm')) {
//             // If 'm' is found, check the next two chars to be 'in'
//             if ((i + 1 >= time.length) || (time[i+1] != 'i')) throw new Error("Invalid 'waitTime'. format: '#h #min'");
//             if ((i + 2 >= time.length) || (time[i+2] != 'n')) throw new Error("Invalid 'waitTime'. format: '#h #min'");
//             // Set checkingMinute to false, to indicate the string should be empty
//             minDetected = true;
//             i += 2;
//             checkingMinute = false;
//         } else if (checkingMinute && !('0' <= time[i] && time[i] <= '9')) {
//             // If a non-number char found in the hour, throw error
//             throw new Error("Invalid 'waitTime'. format: '#h #min'");
//         }
//     }
//     // Validating hour and minute
//     if (hour === '' || minute === '' || !minDetected || !hDetected) throw new Error("Invalid 'waitTime'. format: '#h #min'");
//     hour = Number(hour);
//     minute = Number(minute);
//     if (isNaN(hour) || isNaN(minute)) throw new Error("Invalid 'waitTime'. format: '#h #min'");
//     // Make sure minute is valid
//     if ((minute < 0 || minute >= 60)) throw new Error("Invalid 'waitTime' minute value");
//     return `${String(hour)}h ${String(minute)}min`;

// }

function checkWaitTime(time) {
    if (!time || typeof time !== 'string') throw 'Error: Must be a valid time input entered'
    time = time.trim();
    if (time === "") throw "Error: Time Cannot be Spaces or Empty";


    const format = /^(\d+)h (\d{1,2})min$/;
    if(!format.test(time)) throw "Error: Time must be in the format #h #min";

    const [hour, minutes] = time.split(" ");

    const h = parseInt(hour);
    const m = parseInt(minutes);

    
    if (m < 0 || m > 59 || h < 0) throw "Error: Hours must be greater than 0 and minutes must be between 0 and 59";

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
        //await sender.sendMail(emailInformation);
    } catch (e) {
        //console.log("Error sending verification email!");
        throw new Error('Error sending verification email!');
    }
}

// Verifies an array of id's
function checkIdArray(array, arr_name) {
    if (array === undefined) throw new Error(`${arr_name} input cannot be empty!`);
    if (!Array.isArray(array)) throw new Error(`${arr_name} must be an array!`);
    for (let i = 0; i < array.length; i++) {
        if (!(typeof array[i] === 'string')) throw new Error(`${arr_name} can only contain string elements!`);
        // Check each string - make sure its a valid id
        array[i] = array[i].trim();
        try {
            array[i] = checkId(array[i]);
        } catch (e) {
            // If array[i] not an id, throw error
            throw new Error(`${arr_name} can only contain valid ObjectIds!`);
        }
    }
    return array;
}

// Verifies a restaurant's overall rating
function checkOverallRating(rating) {
    if (rating === undefined) throw new Error("'rating' for cannot be empty");
    if (typeof rating !== "number") throw new Error("'rating' for must be a number 0-5");
    if (rating < 0 || rating > 5) throw new Error("'rating' must be a number 0-5");
    // If rating is a non-integer number, round to one decimal
   rating = Math.floor((rating * 10)) / 10;
   return rating;
}

// Verifies an array of strings
function checkStringArray(arr, arr_name) {
    if (arr === undefined) throw new Error(`${arr_name} input cannot be empty!`);
    if (!Array.isArray(arr)) throw new Error(`${arr_name} must be an array!`);
    for (let i = 0; i < arr.length; i++) {
        // Call 'checkString()' on each element
        try {
            arr[i] = checkString(arr[i]);
        } catch (e) {
            throw new Error(`${arr_name} must be an array of string!`);
        }
    }
    return arr;
}

//Checks hours of operation for a full thing
function checkHoursOfOperation(ho) {
    if (typeof ho !== 'object' || Array.isArray(ho)) throw new Error ("Hours of Operation Must be an object!");
    const days = Object.keys(ho);
    const times = Object.values(ho);
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (days.length !== validDays.length || !days.every(day => validDays.includes(day))) {
        throw new Error("Hours of Operation must have Monday-Sunday");
    }
    
    const regex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm])) - ((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$/;
  
    times.forEach(time => {
        if(time !== "closed" && (typeof time !== 'string' || !regex.test(time))) {
            throw new Error("Time must be in the form HH:MM AM/PM");
        }
    });
  }

  function checkHours(time) {
    const regex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$/
    if(time !== "closed" && (typeof time !== 'string' || !regex.test(time))) {
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
        //console.log(review.rating)
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
        //console.log(review.rating)
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
    if (!arr || !Array.isArray(arr)) throw "Must be an array!";

    const size = arr.length;

    if (size >= 3) return 3;
    else return size;
}

function checkMeetUpTime(meetUpTime){
    // make sure it's an object
    if (typeof meetUpTime !== 'object' || meetUpTime === null) {
        throw new Error('meetUpTime must be object');
    }
    // make sure it has the date and time keys
    const keys = Object.keys(meetUpTime);
    if (keys.length !== 2 || !keys.includes('Date') || !keys.includes('Time')) {
        throw new Error('meetUpTime needs Date and Time keys')
    }
    let dateStr = meetUpTime['Date'];
    let timeStr = meetUpTime['Time'];
    // make sure dateStr and timeStr are both strs
    if (typeof dateStr !== 'string') throw new Error('meetUpTime[Date] must be str');
    if (typeof timeStr !== 'string') throw new Error('meetupTime[Time] must be str');
    // make sure date format is MM/DD/YYY and time format is H:MM{AM/PM}
    let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    let timeRegex = /^(1[0-2]|[1-9]):[0-5]\d(?:AM|PM)$/;
    if (!dateRegex.test(dateStr)){
        throw new Error('Date must have format MM/DD/YYYY');
    }
    if (!timeRegex.test(timeStr)){
        throw new Error('Time must have format H:MM{AM/PM}');
    }
    return meetUpTime;
}




// Export all the functions
export default {
    checkString,
    checkId,
    checkName,
    checkEmail,
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
    checkMeetUpTime
};
// Used for client side server processing AND will be submitted to the server (if it passes)

(function () {
    // Get the restaurants's name, location, types of food, hours of operation, image URL, dietary restrictions, form, and list of errors
    let name = document.getElementById('restaurant-name');
    let location = document.getElementById('restaurant-location');
    let typesOfFood = document.getElementById('restaurant-typesOfFood');
    let imageURL = document.getElementById('restaurant-imageURL');
    let dietaryRestrictions = document.getElementById('restaurant-dietaryRestrictions');
    let serverForm = document.getElementById('restaurant-form');
    let errorList = document.getElementById('restaurant-errors');
    let submitButton = document.getElementById('restaurant-button');
  
    let errors = [];
    // Checks the string
    const checkString = (str, str_name) => {
        if (str === undefined) return errors.push(`${str_name} cannot be empty.`);
        if (typeof str !== "string") return errors.push(`${str_name} must be a string.`);
        if (str.trim().length === 0) return errors.push(`${str_name} cannot be just spaces.`);
        return str.trim();
    };

    // Convert a string to an array of strings
    const stringToArray = (str, strName) => {
        str = checkString(str, strName);
        let stringArray = [];
        let currentWord = '';
        const regex = /^[A-Za-z]+$/;
        for (let i = 0; i < str.length; i++) {
            if (str[i] == ',' || str[i] === ' ') {
                if (currentWord.length > 0) {
                    if (!regex.test(currentWord)) return errors.push(`${strName} can only contain letters separated by commas or spaces`);
                    stringArray.push(currentWord);
                    currentWord = '';
                }
            } else {
                currentWord += str[i];
            }
        }
        if (currentWord.length > 0) {
            if (!regex.test(currentWord)) return errors.push(`${strName} can only contain letters separated by commas or spaces`);
            stringArray.push(currentWord);
        }
        return stringArray;
    }

    // Checks the hours of operation
    const checkHoursOfOperation = (ho) => {
        if (typeof ho !== 'object' || Array.isArray(ho)) return errors.push ("Hours of Operation must be an object.");
        const days = Object.keys(ho);
        const dayTimePairs = Object.entries(ho);
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (days.length !== validDays.length || !days.every(day => validDays.includes(day))) {
            return errors.push("Hours of Operation must have Monday-Sunday");
        }
        
        const regex = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm])) - ((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$/;
        // Check that each value is a string
        for (let [day, time] of dayTimePairs) {
            if (typeof time !== 'string') return errors.push("Daily hours of operation must be a string.");
            time = time.trim();
            if (time === '') {
              return errors.push(`${day}'s hours of operation cannot be empty.`);
              continue;
            }            
            if (time.toLowerCase() === 'closed') {
                ho[day] = 'closed';
                continue;
            }
            if(!regex.test(time)) return errors.push("Time must be in the form HH:MM AM/PM, or 'Closed'.");
            ho[day] = ho[day].trim();
        }
        return ho;
    }

    // Verify the image URL
    const checkImgURL = (imageURL) => {
      imageURL = checkString(imageURL, 'Restaurant image URL');
      try {
        let checkingURL = new URL(imageURL);
        if (!checkingURL.protocol.startsWith('http')) throw new Error('Invalid URL');
      } catch (e) {
        return errors.push('Image URL must be a valid absolute URL starting with http:// or https://');
      }
      return imageURL;
    }

    // If a form was submitted, this executes
    if (serverForm) {
      serverForm.addEventListener('submit', (event) => {
        errors = [];
        // Make sure all previous errors in the list are removed (if they exist)
        errorList.innerHTML = '';
        // Hide the error list
        if (errorList) errorList.hidden = true;
  
        // Check all input
        let nameValue = name.value.trim();
        let locationValue = location.value.trim();
        let typesOfFoodValue = typesOfFood.value.trim();
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let hoursOfOperationValue = {};
        for (let day of days) {
          let input = document.getElementById(`restaurant-hoursOfOperation-${day}`);
          if (input) hoursOfOperationValue[day] = input.value.trim();
        }
        let imageURLValue = imageURL.value.trim();
        let dietaryRestrictionsValue = dietaryRestrictions.value.trim();
        nameValue = checkString(nameValue, "Restaurant name");
        locationValue = checkString(locationValue, "Restaurant location");
        typesOfFoodValue = stringToArray(typesOfFoodValue, "Restaurant types of food");
        hoursOfOperationValue = checkHoursOfOperation(hoursOfOperationValue);
        imageURLValue = checkImgURL(imageURLValue);
        dietaryRestrictionsValue = stringToArray(dietaryRestrictionsValue, "Restaurant dietary restrictions");

        // Display all errors that have been caught
        if (errors.length > 0) {
  
          // Since there are errors, we prevent the form from going to the server
          event.preventDefault();
          // Display all errors found!
          for (let i = 0; i < errors.length; i++) {
            let myLi = document.createElement('li');
            myLi.classList.add('error');
            myLi.innerHTML = errors[i];
            errorList.appendChild(myLi);
          }
          // Display the error list
          errorList.hidden = false;
        } else {
          /* If there are no errors, disable the submit button to prevent multiple requests */
          submitButton.disabled = true;
        }

    });
  }
})();
// Used for client side server processing AND will be submitted to the server (if it passes)

(function () {
    // Get the restaurants's name, location, types of food, hours of operation, image URL, dietary restrictions, form, and list of errors
    let name = document.getElementById('restaurant-name');
    let location = document.getElementById('restaurant-location');
    let typesOfFood = document.getElementById('restaurant-typeOfFood');
    let imageURL = document.getElementById('restaurant-imageURL');
    let serverForm = document.getElementById('restaurant-create-form') || document.getElementById('restaurant-edit-form');
    let menuItemForm = document.getElementById('menuItem-create-form') || document.getElementById('menuItem-edit-form');
    let errorList = document.getElementById('restaurant-errors');
    let submitButton = document.getElementById('restaurant-button');
    // Menu item input
    let menuItemName = document.getElementById('menuItem-name');
    let menuItemDescription = document.getElementById('menuItem-description');
    let menuItemErrorList = document.getElementById('menuItem-errors');
    let menuItemSubmitButton = document.getElementById('menuItem-button');
  
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
        if (!checkingURL.protocol.startsWith('http')) return errors.push('Invalid URL');
      } catch (e) {
        return errors.push('Image URL must be a valid absolute URL starting with http:// or https://');
      }
      return imageURL;
    }

    // Verify the dietary restrictions
    function checkDietaryRestrictions(dr) {
      if (dr === undefined) return errors.push(`Restaurant dietary restrictions cannot be empty.`);
      if (!Array.isArray(dr)) return errors.push(`Restaurant dietary restrictions must be an array.`);
      let dietaryRestrictions = ['vegetarian', 'nut-free', 'vegan', 'dairy-free', 'gluten-free'];
      let drSet = new Set();
      for (let i = 0; i < dr.length; i++) {
          let element;
          try {
              element = checkString(dr[i], 'Dietary restriction element');
          } catch (e) {
              return errors.push(`Invalid dietary restriction: ${e.message}.`);
          }
          // Check if this is a valid dietary restriction
          if (!dietaryRestrictions.includes(element.toLowerCase())) return errors.push(`${element} is not a valid dietary restriction.`);
          element = element.toLowerCase();
          // Capitalize the first letter
          element = element.charAt(0).toUpperCase() + element.slice(1);
          drSet.add(element);
      }
      // Return the dietaryRestrictions sorted for consistency
      return Array.from(drSet).sort();
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
          nameValue = checkString(nameValue, "Restaurant name");
          locationValue = checkString(locationValue, "Restaurant location");
          typesOfFoodValue = stringToArray(typesOfFoodValue, "Restaurant types of food");
          hoursOfOperationValue = checkHoursOfOperation(hoursOfOperationValue);
          imageURLValue = checkImgURL(imageURLValue);
          // Get all checked dietary restriction values
          let selectedDietaryRestrictions = document.querySelectorAll('input[name="dietaryRestrictions"]:checked');
          let dietaryRestrictions = [];
          // Convert the node list, into a list of the values
          for (let i = 0; i < selectedDietaryRestrictions.length; i++) {
            dietaryRestrictions.push(selectedDietaryRestrictions[i].value);
          }
          dietaryRestrictions = checkDietaryRestrictions(dietaryRestrictions);

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


    // If a form was submitted, this executes
    if (menuItemForm) {
      menuItemForm.addEventListener('submit', (event) => {
          errors = [];
          // Make sure all previous errors in the list are removed (if they exist)
          menuItemErrorList.innerHTML = '';
          // Hide the error list
          if (menuItemErrorList) menuItemErrorList.hidden = true;
    
          // Check all input
          let nameValue = menuItemName.value.trim();
          let descriptionValue = menuItemDescription.value.trim();
          nameValue = checkString(nameValue, "Menu item name");
          descriptionValue = checkString(descriptionValue, "Menu item description");
          // Get all checked dietary restriction values
          let selectedDietaryRestrictions = document.querySelectorAll('input[name="dietaryRestrictions"]:checked');
          let dietaryRestrictions = [];
          // Convert the node list, into a list of the values
          for (let i = 0; i < selectedDietaryRestrictions.length; i++) {
            dietaryRestrictions.push(selectedDietaryRestrictions[i].value);
          }
          dietaryRestrictions = checkDietaryRestrictions(dietaryRestrictions);

          // Display all errors that have been caught
          if (errors.length > 0) {
    
            // Since there are errors, we prevent the form from going to the server
            event.preventDefault();
            // Display all errors found!
            for (let i = 0; i < errors.length; i++) {
              let myLi = document.createElement('li');
              myLi.classList.add('error');
              myLi.innerHTML = errors[i];
              menuItemErrorList.appendChild(myLi);
            }
            // Display the error list
            menuItemErrorList.hidden = false;
          } else {
            /* If there are no errors, disable the submit button to prevent multiple requests */
            menuItemSubmitButton.disabled = true;
          }

      });
    }


    // Validation for the DELETE review button
    // Get each form with class='deleteReviewForm' and add an event listener that executes when it is submitted
    document.querySelectorAll('.deleteReviewForm').forEach((reviewForm) => {
      reviewForm.addEventListener('submit', (event) => {
        const reviewId = reviewForm.querySelector()
      })
    })


})();
(function () {
  // functions for validation
  const showError = (form, msg) => {
    let errorDiv = form.querySelector('.clientError');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'clientError error';
      form.appendChild(errorDiv);
    }
    errorDiv.textContent = msg;
    errorDiv.hidden = false;
    return false; // Indicate validation failed
  };

  const hideError = (form) => {
    const errorDiv = form.querySelector('.clientError');
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.hidden = true;
    }
  };

  const validateId = (id, field) => {
    if (!id) throw `you must provide a ${field}`;
    if (typeof id !== 'string') throw `${field} must be a string`;
    id = id.trim();
    if (id.length === 0) throw `${field} cannot be an empty string`;
    return id;
  };

  const validateNotSelf = (id1, id2, action) => {
    if (id1 === id2) throw `you can not ${action}`;
    return true;
  };

  // RSVP form validation
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(event) {
      event.preventDefault();
      hideError(rsvpForm);

      try {
        const userId = validateId(document.getElementById('rsvp-userId').value, 'user ID');
        const rsvpId = validateId(document.getElementById('rsvp-id').value, 'RSVP ID');
        const posterId = validateId(document.getElementById('rsvp-posterId').value, 'poster ID');
        validateNotSelf(userId, posterId, 'RSVP to your own meetup');
        return true; // Indicate validation passed
      } catch (e) {
        showError(rsvpForm, e);
        return false; // Indicate validation failed
      }
    });
  }

  // follow form validation
  const followForm = document.getElementById('follow-form');
  if (followForm) {
    followForm.addEventListener('submit', function(event) {
      event.preventDefault();
      hideError(followForm);

      try {
        const friendId = validateId(document.getElementById('follow-friendId').value, 'friend ID');
        const userId = validateId(document.getElementById('follow-userId').value, 'user ID');
        validateNotSelf(friendId, userId, 'follow yourself');
        return true; // Indicate validation passed
      } catch (e) {
        showError(followForm, e);
        return false; // Indicate validation failed
      }
    });
  }

  // delete form validation
  const deleteForm = document.getElementById('delete-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', function(event) {
      event.preventDefault();
      hideError(deleteForm);

      try {
        const reviewId = validateId(document.getElementById('delete-reviewId').value, 'review ID');
        const userId = validateId(document.getElementById('delete-userId').value, 'user ID');
        return true; // Indicate validation passed
      } catch (e) {
        showError(deleteForm, e);
        return false; // Indicate validation failed
      }
    });
  }
})();

function checkReview(review) {

  if (typeof review !== 'string') throw "Review must be a string";
  review = review.trim();
  if (review.length === 0) throw "Review cannot be empty";
  if (review.length > 1000) throw "Review is too long";
  return review;
}

function checkRating(rating) {
  if (rating === '') throw "Rating is required.";
  const numberRating = Number(rating);
  if (isNaN(numberRating) || numberRating < 1 || numberRating > 5) throw "Rating must be between 1 and 5.";
  return numberRating;
}

function checkWaitTime(hour, minute) {

  hour = hour.trim();
  minute = minute.trim();
  if (hour === '' || minute === '') throw "Please enter both hour and minute values.";
  

  hour = Number(hour);
  minute = Number(minute);

  if (isNaN(hour) || isNaN(minute)) throw "Time must be entered as a number";
  if (hour < 0) throw "Hours must be a positive number";
  if (minute < 0 || minute > 59) throw "Minutes must be between 0-59";

  let h = hour.toString();
  let m = minute.toString().padStart(2, '0');

  return `${h}h ${m}min`;

}

const validateId = (id, field) => {
  if (!id) throw `you must provide a ${field}`;
  if (typeof id !== 'string') throw `${field} must be a string`;
  id = id.trim();
  if (id.length === 0) throw `${field} cannot be an empty string`;
  return id;
};


  // create review form validation
const reviewForm = document.getElementById('review-form');

if (reviewForm) {
  reviewForm.addEventListener('submit', function(event) {
  event.preventDefault();
  document.querySelectorAll('.error').forEach(e => e.innerText = '');
  //console.log("testsdkjgjksdfhgkjsdhfgkjhsdfgkhsdfkghsdfkjghkdfhgkljhgkjdhgkjdhgkhdfgkdfjkgdfhgkjd");
  let errors = {};
  let restaurantId;
  
  try {
    restaurantId = document.querySelector('#restaurant input:checked').value;
  } catch(e) {
    errors.Restaurant = "Must enter a restaurant";
  }
  

  try {
    restaurantId = validateId(restaurantId, "restaurantId");
  } catch(e) {
    errors.Restaurant = e.message || "Must enter a restaurant";
  }
  let menuItemId;
  
  try {
  menuItemId = document.querySelector('#menuItems input:checked').value;
  console.log(menuItemId);
  if (menuItemId !== "") {
    menuItemId = validateId(menuItemId, "menuItemId");
  }
  } catch(e) {
    
  }
  let review;
  try {
    review = document.getElementById('review').value;
    review = checkReview(review);
  } catch(e) {
    errors.Review = e.message || "Enter a valid review";
  }
  let rating;
  try {
    rating = document.getElementById('rating').value;
    rating = checkRating(rating);
  } catch(e) {
    errors.Rating = e.message || "Enter a valid rating";
  }
  let time;
  try {
    hour = document.getElementById('waitTimeHour').value;
    minute = document.getElementById('waitTimeMinute').value
    time = checkWaitTime(hour, minute);
  } catch(e) {
    errors.Time = e.message || "Enter a valid time";
  }

  if (Object.keys(errors).length > 0) {
    for (const key in errors) {
        const errorElement = document.getElementById(`error${key}`);
        if (errorElement) errorElement.innerText = errors[key];
    }
} else {
    reviewForm.submit();
}      


    });
};



//check comment, date, time, and restaruant
//make sure all input is provided
//make sure date is in the corresp format
//make sure time is in the corresp format
//make sure comment is not too short or too long 

// Client-side validation for createRSVP form
(function () {
  // Validation helper functions
  const showError = (form, msg) => {
    let errorDiv = form.querySelector('.clientError');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'clientError error';
      form.appendChild(errorDiv);
    }
    errorDiv.textContent = msg;
    errorDiv.hidden = false;
    return false;
  };

  const hideError = (form) => {
    const errorDiv = form.querySelector('.clientError');
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.hidden = true;
    }
  };

  // Validate date format (YYYY-MM-DD) and is in future
  const validateDate = (date) => {
    if (!date) throw 'Please select a date';
    
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) throw 'Date must be in YYYY-MM-DD format';
    
    // Check if date is in future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) throw 'Date must be in the future';
    
    return true;
  };

  // Validate time format (H:MM AM/PM) and is reasonable
  const validateTime = (time) => {
    if (!time) throw 'Please select a time';
    
    // Check format H:MM AM/PM
    const timeRegex = /^(1[0-2]|[1-9]):[0-5][0-9] ?(?:AM|PM)$/i;
    if (!timeRegex.test(time)) throw 'Time must be in H:MM AM/PM format';
    
    // Extract hour and period
    const [timePart, period] = time.split(' ');
    const [hours] = timePart.split(':');
    let hour = parseInt(hours);
    
    // Convert to 24-hour for validation
    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    
    // Check if time is between 6 AM and 10 PM
    if (hour < 6 || hour > 22) throw 'Time must be between 6 AM and 10 PM';
    
    return true;
  };

  // Validate comment length (max 500 characters)
  const validateComment = (comment) => {
    if (!comment) throw 'Please provide a comment';
    comment = comment.trim();
    if (comment.length === 0) throw 'Comment cannot be empty';
    if (comment.length > 500) throw 'Comment must be 500 characters or less';
    return true;
  };

  // Validate restaurant selection
  const validateRestaurant = (restaurant) => {
    if (!restaurant) throw 'Please select a restaurant';
    return true;
  };

  // Main form validation
  const meetupForm = document.querySelector('.meetupForm');
  if (meetupForm) {
    meetupForm.addEventListener('submit', function(event) {
      event.preventDefault();
      hideError(meetupForm);

      const date = document.getElementById('rsvpDate').value;
      const time = document.getElementById('rsvpTime').value;
      const restaurant = document.getElementById('restaurantSelect').value;
      const comment = document.getElementById('comment').value;

      try {
        // Validate all fields
        validateDate(date);
        validateTime(time);
        validateRestaurant(restaurant);
        validateComment(comment);

        // If all validation passes, submit the form
        this.submit();
      } catch (e) {
        showError(meetupForm, e);
      }
    });
  }
})();

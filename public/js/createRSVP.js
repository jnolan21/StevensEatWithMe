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
    
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    // If it's the same day, we'll let the time validation handle it
    if (selectedDate.toDateString() === today.toDateString()) {
      return true;
    }
    
    // For other days, check if the date is in the future
    if (selectedDate < today) throw 'Date must be in the future';
    
    return true;
  };

  // Validate time format (HH:MM) and is reasonable
  const validateTime = (time) => {
    if (!time) throw 'Please select a time';
    
    // Check format HH:MM (24-hour format)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(time)) throw 'Time must be in HH:MM format';
    
    // Extract hour
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    
    // Check if time is between 6 AM and 10 PM
    if (hour < 6 || hour > 22) throw 'Time must be between 6 AM and 10 PM';
    
    // Only check if time is in the future if the date is today
    const date = document.getElementById('rsvpDate').value;
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    
    if (selectedDate.toDateString() === today.toDateString()) {
      const [selectedHours, selectedMinutes] = time.split(':').map(Number);
      const currentHours = today.getHours();
      const currentMinutes = today.getMinutes();
      
      if (selectedHours < currentHours || (selectedHours === currentHours && selectedMinutes <= currentMinutes)) {
        throw 'Time must be in the future';
      }
    }
    
    return true;
  };

  // Validate comment length (10-400 characters)
  const validateComment = (comment) => {
    if (!comment) throw 'Please provide a comment';
    comment = comment.trim();
    if (comment.length === 0) throw 'Comment cannot be empty';
    if (comment.length < 10) throw 'Comment must be at least 10 characters';
    if (comment.length > 400) throw 'Comment must be no more than 400 characters';
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

        // Convert date from YYYY-MM-DD to MM/DD/YYYY with leading zeros
        const [year, month, day] = date.split('-');
        const formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;

        // Convert time from 24-hour (HH:MM) to 12-hour (H:MM AM/PM)
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        // Add leading zero for single-digit hours
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedTime = `${formattedHour}:${minutes}${period}`;

        // Create hidden inputs for the formatted values
        const dateInput = document.createElement('input');
        dateInput.type = 'hidden';
        dateInput.name = 'rsvpDate';
        dateInput.value = formattedDate;

        const timeInput = document.createElement('input');
        timeInput.type = 'hidden';
        timeInput.name = 'rsvpTime';
        timeInput.value = formattedTime;

        // Remove the original inputs
        document.getElementById('rsvpDate').remove();
        document.getElementById('rsvpTime').remove();

        // Add the hidden inputs with formatted values
        meetupForm.appendChild(dateInput);
        meetupForm.appendChild(timeInput);

        this.submit();
      } catch (e) {
        showError(meetupForm, e);
      }
    });
  }
})();

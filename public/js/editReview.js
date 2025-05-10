//make sure review comment is a string (do we have a max limit for the reivew?)
//make sure wait time is valid integer
//make sure rating is valid integer 

// Client-side validation for edit review form
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

  // Validate rating (0-5)
  const validateRating = (rating) => {
    if (!rating) throw 'Please select a rating';
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      throw 'Rating must be a number between 0 and 5';
    }
    return true;
  };

  // Validate wait time (hours and minutes)
  const validateWaitTime = (hours, minutes) => {
    if (hours === undefined || minutes === undefined) {
      throw 'Please enter both hours and minutes';
    }
    
    const hoursNum = parseInt(hours);
    const minutesNum = parseInt(minutes);
    
    if (isNaN(hoursNum) || isNaN(minutesNum)) {
      throw 'Wait time must be numbers';
    }
    
    if (hoursNum < 0 || hoursNum > 5) {
      throw 'Hours must be between 0 and 5';
    }
    
    if (minutesNum < 0 || minutesNum > 59) {
      throw 'Minutes must be between 0 and 59';
    }
    
    if (hoursNum === 0 && minutesNum === 0) {
      throw 'Wait time cannot be 0 hours and 0 minutes';
    }
    
    return true;
  };

  // Validate review comment
  const validateComment = (comment) => {
    if (!comment) throw 'Please provide a review';
    comment = comment.trim();
    if (comment.length === 0) throw 'Review cannot be empty';
    if (comment.length < 10) throw 'Review must be at least 10 characters';
    if (comment.length > 1000) throw 'Review must be 1000 characters or less';
    return true;
  };

  // Main form validation
  const editReviewForm = document.querySelector('.doneEdit');
  if (editReviewForm) {
    editReviewForm.addEventListener('submit', function(event) {
      event.preventDefault();
      hideError(editReviewForm);

      const rating = document.querySelector('select[name="rating"]').value;
      const waitHours = document.querySelector('input[name="waitHours"]').value;
      const waitMinutes = document.querySelector('input[name="waitMinutes"]').value;
      const comment = document.querySelector('textarea[name="comment"]').value;

      try {
        // Validate all fields
        validateRating(rating);
        validateWaitTime(waitHours, waitMinutes);
        validateComment(comment);

        this.submit();
      } catch (e) {
        showError(editReviewForm, e);
      }
    });
  }
})(); 

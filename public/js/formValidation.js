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
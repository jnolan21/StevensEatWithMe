// Used for client side server processing AND will be submitted to the server (if it passes)

(function () {
  // Get the user's information, and list of errors
  let firstName = document.getElementById('signup-firstName');
  let lastName = document.getElementById('signup-lastName');
  let email = document.getElementById('signup-email');
  let username = document.getElementById('signup-username');
  let password = document.getElementById('signup-password');
  let passwordConfirm = document.getElementById('signup-passwordConfirm');
  let serverForm = document.getElementById('signup-form');
  let errorList = document.getElementById('signup-errors');
  let submitButton = document.getElementById('signup-button');

  let errors = [];
  // Checks the user's first name
  function checkName(name, str_name) {
    if (name === undefined) return errors.push(`${str_name} cannot be empty.`);
    if (typeof name !== 'string') return errors.push(`${str_name} must be a string.`);
    name = name.trim();
    if (name.length === 0) return errors.push(`${str_name} cannot be an empty string.`);
    for (let i = 0; i < name.length; i++) if (name[i] !== ' ' && !isNaN(name[i])) return errors.push(`${str_name} cannot contain numbers.`);
}

  // Checks the user's email
  const checkEmail = (email) => {
      if (email === undefined) return errors.push("Email field cannot be empty.");
      if (typeof email !== 'string') return errors.push("Email field cannot be empty.");
      email = email.trim();
      if (email.length === 0) return errors.push("Email field cannot be empty.");
      if (email[0] === '@' || email.length < 12 || email.length > 256) return errors.push("Invalid email.");
      if (email.substring((email.length - 12)).toLowerCase() !== '@stevens.edu') return errors.push("Email must be a valid Stevens email (@stevens.edu).");
  };

  // Check's the user's username
  function checkUsername(username) {
    if (username === undefined) return errors.push(`Username cannot be empty.`);
    if (typeof username !== 'string') return errors.push(`Username must be a string.`);
    username = username.trim();
    if (username.length === 0) return errors.push(`Username cannot be an empty string.`);
    if (username.length > 50) return errors.push(`Username can have no more than 50 characters.`);
    for (let i = 0; i < username.length; i++) {
        if (!('a' <= username[i] && username[i] <= 'z') && !('A' <= username[i] && username[i] <= 'Z') && !('0' <= username[i] && username[i] <= '9'))
            return errors.push(`Username can only contain letters and numbers.`);
    }
    return username;
  }

  // Checks the user's password
  const checkPassword = (password) => {
      if (password === undefined) return errors.push("Password field cannot be empty.");
      if (typeof password !== 'string') return errors.push("Password field cannot be empty.");
      password = password.trim()
      if (password.length === 0) return errors.push("Password field cannot be empty.");
      if (password.length < 12) return errors.push("Password must be longer than 12 characters and contain at least one lowercase letter, uppercase letter, number, and symbol.");
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
      if (!uppercaseFound || !lowercaseFound || !numberFound || !symbolFound) return errors.push("Password must be longer than 12 characters and contain at least one lowercase letter, uppercase letter, number, and symbol.");
  }

  // If a form was submitted, this executes
  if (serverForm) {
    serverForm.addEventListener('submit', (event) => {
      console.log(firstName.value)
      errors = [];
      // Make sure all previous errors in the list are removed (if they exist)
      errorList.innerHTML = '';
      // Hide the error list
      if (errorList) errorList.hidden = true;

      // Check all input
      let firstNameValue = firstName.value.trim();
      let lastNameValue = lastName.value.trim();
      let emailValue = email.value.trim();
      let usernameValue = username.value.trim()
      let passwordValue = password.value.trim();
      let passwordConfirmValue = passwordConfirm.value.trim();
      checkName(firstNameValue, 'First name');
      checkName(lastNameValue, 'Last name');
      checkEmail(emailValue);
      checkUsername(usernameValue);
      if (passwordValue !== passwordConfirmValue) errors.push('Password and confirm password must match.');
      checkPassword(passwordValue);

      // Display all errors that have been caught
      if (errors.length > 0) {

        // Since there are errors, we prevent the form from going to the server
        event.preventDefault();
        // Display all errors!
        for (let i = 0; i < errors.length; i++) {
          let myLi = document.createElement('li');
          myLi.classList.add('error');
          myLi.innerHTML = errors[i];
          errorList.appendChild(myLi);
        }
        // Display the error list
        errorList.hidden = false;
        // Clear the password and passwordConfirm input for security
        password.value = '';
        passwordConfirm.value = '';
      } else {
        /* If there are no errors, disable the submit button to prevent multiple requests */
        submitButton.disabled = true;
      }
      /* If the program reaches this point (passed the error checking if-statement above)
        the form is automatically submitted to the server
      */
  });
}
})();
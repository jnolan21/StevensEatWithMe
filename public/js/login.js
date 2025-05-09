// Used for client side server processing AND will be submitted to the server (if it passes)

(function () {
    // Get the user's email, password, form, and list of errors
    let email = document.getElementById('login-email');
    let password = document.getElementById('login-password');
    let serverForm = document.getElementById('login-form');
    let errorList = document.getElementById('login-errors');
    let submitButton = document.getElementById('login-button');
  
    let errors = [];
  // Checks the user's email
  const checkEmail = (email) => {
      if (email === undefined) return errors.push("Email field cannot be empty.");
      if (typeof email !== 'string') return errors.push("Email field cannot be empty.");
      email = email.trim();
      if (email.length === 0) return errors.push("Email field cannot be empty.");
      if (email[0] === '@' || email.length < 12 || email.length > 256) return errors.push("Invalid email.");
      if (email.substring((email.length - 12)).toLowerCase() !== '@stevens.edu') return errors.push("Email must be a valid Stevens email (@stevens.edu).");
  };

    // Checks the user's password
    const checkPassword = (password) => {
        if (password === undefined) return errors.push("Invalid email or password.");
        if (typeof password !== 'string') return errors.push("Invalid email or password.");
        password = password.trim()
        if (password.length === 0) return errors.push("Invalid email or password.");
        if (password.length < 12) return errors.push("Invalid email or password.");
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
        if (!uppercaseFound || !lowercaseFound || !numberFound || !symbolFound) return errors.push("Invalid email or password.");
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
        let emailValue = email.value.trim();
        let passwordValue = password.value.trim();
        checkEmail(emailValue);
        checkPassword(passwordValue);

        // Display all errors that have been caught
        if (errors.length > 0) {
  
          // Since there are errors, we prevent the form from going to the server
          event.preventDefault();
          // Display the first error found!
          let myLi = document.createElement('li');
          myLi.classList.add('error');
          myLi.innerHTML = errors[0];
          errorList.appendChild(myLi);
          // Display the error list
          errorList.hidden = false;
          // Clear the password input for security
          password.value = '';
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
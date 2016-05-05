var email = document.getElementById("email");
var emailValid = false;

function validateEmail() {
    // @ TODO : the following line has to compare the email.value (which is a string)
    // all values from the database that tells us if the email is valid or not
    // this function is called on every keystroke, idk if this will be a performance issue
    //if (email.value != "existing@gmail.com") {
    if (true)
        email.validity = false;
        emailValid = false;
        email.setCustomValidity("Email is not valid");
        email.style.borderColor = invalid;
    }
    else {
        email.validity = true;
        emailValid = true;
        email.setCustomValidity("");
        email.style.borderColor = valid;
    }
}

function enableEmailBorderColor() {
    if (emailValid) {
        email.style.borderColor = valid;
    }
    else {
        email.style.borderColor = invalid;
    }
}

function disableEmailBorderColor() {
    email.style.borderColor = unselected;
}

email.onkeyup = validateEmail;
email.onfocus = enableEmailBorderColor;
email.onblur = disableEmailBorderColor; 

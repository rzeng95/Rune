// Validation Code

var valid = "#66afe9";
var invalid = "#e60000";
var unselected = "#ccc";

var password = document.getElementById("pwd");
var confirmPassword = document.getElementById("confirmPwd");
var confirmValid = false;

function validatePwd() {
    if (password.value != confirmPassword.value) {
        confirmValid = false;
        confirmPassword.setCustomValidity("Please enter passwords that match.");
        confirmPassword.style.borderColor = invalid;
    }
    else {
        confirmValid = true;
        confirmPassword.setCustomValidity("");
        confirmPassword.style.borderColor = valid;
    }
}

function enableConfirmPwdBorderColor() {
    if (confirmValid) {
        confirmPassword.style.borderColor = valid;
    }
    else {
        confirmPassword.style.borderColor = invalid;
    }
}

function disableConfirmPwdBorderColor() {
    confirmPassword.style.borderColor = unselected;

}

password.onchange = validatePwd;
confirmPassword.onkeyup = validatePwd;
confirmPassword.onfocus = enableConfirmPwdBorderColor;
confirmPassword.onblur = disableConfirmPwdBorderColor;

// User Icon Code

var checks = document.getElementsByClassName("check-icon-small");
var colors = ["red", "redorange", "orange", "yelloworange", "yellow", "yellowgreen",
              "green", "bluegreen", "blue", "bluepurple", "purple", "redpurple"];
var colorInput = document.getElementById("hidden-color-input");
var selected = 0;

var selectIcon = function(selectColor) {
    if(selected != selectColor) {
        checks[selectColor].style.opacity = "1";
        colorInput.value = colors[selectColor];
        checks[selected].style.opacity = 0;
        selected = selectColor;
    }         
}
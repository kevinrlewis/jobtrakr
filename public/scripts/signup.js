var green = "41, 193, 26, 1";
var red = "255, 0, 0, 1"

$(document).ready(function () {
  // call functions everytime a key is pressed
  $("#enterpwd").keyup(checkPassword);
  $('#confirmpwd').keyup(checkPasswordMatch);
  $('#enteremail').keyup(validate);
});

$(document).keypress(function(event){
  if(event.keyCode == 13){
    $("#signup_submit").click();
  }
});

// function to check if the password is greater than the
// required length and contains a number
function checkPassword() {
    var password = $("#enterpwd").val();

    // if the password meets the length requirements
    if(password.length >= 7) {
      if($('#char').hasClass('showInfo')) {
        $('#char').toggleClass('hideInfo').toggleClass('showInfo');
      }
    // if the password doesn't meet the length requirements
    } else {
      if($('#char').hasClass('hideInfo')) {
        $('#char').toggleClass('hideInfo').toggleClass('showInfo');
      }
    }

    // if the password has a number in it
    if(/\d/.test(password)) {
      if($('#num').hasClass('showInfo')) {
        $('#num').toggleClass('hideInfo').toggleClass('showInfo');
      }
    // if the password does not have a number in it
    } else {
      if($('#num').hasClass('hideInfo')) {
        $('#num').toggleClass('hideInfo').toggleClass('showInfo');
      }
    }
}

// function to check that the passwords match
function checkPasswordMatch() {
  var password = $("#enterpwd").val();
  var confirmPassword = $("#confirmpwd").val();

  // password and confirmation password do not match then border color is red
  if(password != confirmPassword) {
    $("#enterpwd").css("border", "solid 2px rgba(" + red + ")");
    $("#confirmpwd").css("border", "solid 2px rgba(" + red + ")");
  } else {
    $("#enterpwd").css("border", "solid 2px rgba(" + green + ")");
    $("#confirmpwd").css("border", "solid 2px rgba(" + green + ")");
  }
}

// function to validate email by regex
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// function to validate email and change border of input field
function validate() {
  var email = $("#enteremail").val();
  if (validateEmail(email)) {
    $("#enteremail").css("border", "solid 2px rgba(" + green + ")");
  } else {
    $("#enteremail").css("border", "solid 2px rgba(" + red + ")");
  }
}

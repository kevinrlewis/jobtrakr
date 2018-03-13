function changeToCheck() {
  // var inner = '<i class="fas fa-check"></i>';
  var temp = document.getElementById('check');
  temp.innerHTML = '';
  // temp.innerHTML = inner;

  $('#check').toggleClass('fas');
  $('#check').toggleClass('fa-check');
}

function changeBackCheck() {
  $('#check').toggleClass('fas');
  $('#check').toggleClass('fa-check');

  var inner = 'Applied';
  var temp = document.getElementById('check');
  temp.innerHTML = '';
  temp.innerHTML = inner;
}

// remove job-box
function remove(el, i) {
  $(el).closest('.job-box').remove();
}

// show messageAlert
function showMessage() {
  $('#messageAlert').css("display", "block");
}

// When the user clicks on the button, open the modal
function addjob_click() {
  $('#addjobarea').toggleClass('hide').toggleClass('show');
}

function addprospect_click() {
  $('#addprospectarea').toggleClass('hide').toggleClass('show');
}

// when comments are clicked, toggle the comments
function comments_click(index) {
  $('#comment' + index).toggleClass('hide').toggleClass('show');
}

// when prospect comments are clicked, toggle the comments
function prospectcomments_click(index) {
  $('#prospectcomment' + index).toggleClass('hide').toggleClass('show');
}

// when the reject comments are clicked, toggle the comments
function rejectcomments_click(index) {
  $('#rejectcomment' + index).toggleClass('hide').toggleClass('show');
}

// function called to show interviews
function interviewsClick(index) {
  $('#interviewsDiv-' + index).toggleClass('hide').toggleClass('show');
  $('#interviews-' + index).toggleClass('fa-caret-up').toggleClass('fa-caret-down');
}

// function called when the add interview button is clicked
function addInterviewClick(index) {
  // make sure the both the interviewer and date are filled
  if(!$('#interviewDate').val() || !$('#interviewer').val()) {
    // set border of the interviewDate input to red if empty
    if(!$('#interviewDate').val()) {
      $('#interviewDate').css('border', 'solid 2px red');
    }
    // set border of the interviewer field to red if empty
    if(!$('#interviewer').val()) {
      $('#interviewer').css('border', 'solid 2px red');
    }
    return;
  }

  // get input
  var date = $('#interviewDate').val();
  var interviewer = $('#interviewer').val();

  // send post request
  $.ajax({
    type: 'POST',
    url: "/interviews",
    contentType: 'application/json',
    data: JSON.stringify({
      interviewDate: date,
      interviewer: interviewer,
      interviewJobIndex: index
    }),
    datatype: "json",
    success: function(data, status) {
      // post to db was successful
      location.reload();
    }
  });
}

// when the submit adding a job is clicked
function addJob(url) {
  // temporary flag variables
  var prospect;
  if(window.location.pathname === '/prospective') {
    // VALIDATIONS
    var companyValid = true;
    var titleValid = true;
    var linkValid = true;
    if(!$('#pcompanyTextField').val()) {
      companyValid = false;
    }
    if(!$('#ptitleTextField').val()) {
      titleValid = false;
    }
    if(!$('#plinkTextField').val()) {
      linkValid = false;
    }
    if(!urlValid($('#plinkTextField').val()) && $('#plinkTextField').val()) {
      $('#urlMessageAlert').css("display", "block");
      linkValid = false;
    }

    var company;
    var jobtitle;
    var link;
    if(!companyValid) {
      $('#pcompanyTextField').css('border', 'solid 2px red');
    } else {
      $('#pcompanyTextField').css('border', '0');
    }
    if(!titleValid) {
      $('#ptitleTextField').css('border', 'solid 2px red');
    } else {
      $('#ptitleTextField').css('border', '0');
    }
    if(!linkValid) {
      $('#plinkTextField').css('border', 'solid 2px red');
    } else {
      $('#plinkTextField').css('border', '0');
    }

    if(companyValid && titleValid && linkValid) {
      company = $('#pcompanyTextField').val();
      jobtitle = $('#ptitleTextField').val();
      link = $("#plinkTextField").val();
      if(link.substring(0, 6).toLowerCase() !== "http://") {
        link = "http://" + link;
      }
    } else {
      return;
    }

    // handle empty comments
    var comments;
    if(!$('#pjobCommentField').val()) {
      comments = "";
    } else {
      comments = $('#pjobCommentField').val();
    }

    $.ajax({
      type: 'POST',
      url: "/prospective",
      contentType: 'application/json',
      data: JSON.stringify({
        joblink: link,
        comments: comments,
        company: company,
        jobtitle: jobtitle,
        interviews: []
      }),
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        //console.log("post success");
        location.reload();
      },
      error: function(data, status) {
        //console.log("post error");
        showMessage();
      }
    });
  } else if(window.location.pathname === '/applied') {

    // VALIDATIONS
    var companyValid = true;
    var titleValid = true;
    var linkValid = true;
    if(!$('#companyTextField').val()) {
      companyValid = false;
    }
    if(!$('#titleTextField').val()) {
      titleValid = false;
    }
    if(!$('#linkTextField').val()) {
      linkValid = false;
    }
    if(!urlValid($('#linkTextField').val()) && $('#linkTextField').val()) {
      $('#urlMessageAlert').css("display", "block");
      linkValid = false;
    }

    var company;
    var jobtitle;
    var link;
    if(!companyValid) {
      $('#companyTextField').css('border', 'solid 2px red');
    } else {
      $('#companyTextField').css('border', '0');
    }
    if(!titleValid) {
      $('#titleTextField').css('border', 'solid 2px red');
    } else {
      $('#titleTextField').css('border', '0');
    }
    if(!linkValid) {
      $('#linkTextField').css('border', 'solid 2px red');
    } else {
      $('#linkTextField').css('border', '0');
    }

    if(companyValid && titleValid && linkValid) {
      company = $('#companyTextField').val();
      jobtitle = $('#titleTextField').val();
      link = $("#linkTextField").val();
      if(link.substring(0, 6).toLowerCase() !== "http://") {
        link = "http://" + link;
      }
    } else {
      return;
    }

    // handle empty comments
    var comments;
    if(!$('#jobCommentField').val()) {
      comments = "";
    } else {
      comments = $('#jobCommentField').val();
    }

    $.ajax({
      type: 'POST',
      url: "/applied",
      contentType: 'application/json',
      data: JSON.stringify({
        joblink: link,
        comments: comments,
        company: company,
        jobtitle: jobtitle,
        interviews: []
      }),
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        location.reload();
      },
      error: function(data, status) {
        showMessage();
      }
    });
  }
}

function showRemoveOptions(type, index) {
  //console.log(type, index);
  $('#doubleCheck' + index).toggleClass('hide').toggleClass('show');
}

function removeJob(type, index) {
  // type 1 prospective
  // type 2 applied
  // type 3 interviews
  // type 4 rejected
  switch(type) {
    case 1: $.ajax({
      type: 'POST',
      url: "/remove?prospect="+index,
      contentType: 'application/json',
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        // TODO: possible just remove the job-box versus reloading the page
        location.reload();
      }
    });
    case 2: $.ajax({
      type: 'POST',
      url: "/remove?index="+index,
      contentType: 'application/json',
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        // TODO: possible just remove the job-box versus reloading the page
        location.reload();
      }
    });
    case 3: $.ajax({
      type: 'POST',
      url: "/remove?inter="+index,
      contentType: 'application/json',
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        // TODO: possible just remove the job-box versus reloading the page
        location.reload();
      }
    });
    case 4: $.ajax({
      type: 'POST',
      url: "/remove?reject="+index,
      contentType: 'application/json',
      datatype: "json",
      success: function(data, status) {
        // post to db was successful
        // TODO: possible just remove the job-box versus reloading the page
        location.reload();
      }
    });
  }
}

function urlValid(url) {
  return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(url);
}

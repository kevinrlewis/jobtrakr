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
    // if the link field is empty
    if(!$('#plinkTextField').val()) {
      $('#plinkTextField').css('border', 'solid 2px red');
      return;
    }
    // adding a prospective job
    // link
    var link = $("#plinkTextField").val();

    // handle empty comments
    var comments;
    if(!$('#pjobCommentField').val()) {
      comments = "no comments";
    } else {
      comments = $('#pjobCommentField').val();
    }

    // company
    var company;
    if(!$('#pcompanyTextField').val()) {
      $('#pcompanyTextField').css('border-color', 'red');
      return;
    } else {
      company = $('#pcompanyTextField').val();
    }

    var jobtitle;
    if(!$('#ptitleTextField').val()) {
      $('#ptitleTextField').css('border-color', 'red');
      return;
    } else {
      jobtitle = $('#ptitleTextField').val();
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
    // if the link text field is empty
    if(!$('#linkTextField').val()) {
      $('#linkTextField').css('border-color', 'red');
      return;
    }

    // check if a url is a valid url
    if(!urlValid($('#linkTextField').val())) {
      $('#linkTextField').css('border-color', 'red');
      $('#urlMessageAlert').css("display", "block");
      return;
    }
    // adding a regular job
    // create link element to parse
    var link = $("#linkTextField").val();
    if(link.substring(0, 3).toLowerCase() !== "http") {
      link = "http://" + link;
    }

    // handle empty comments
    var comments;
    if(!$('#jobCommentField').val()) {
      comments = "no comments";
    } else {
      comments = $('#jobCommentField').val();
    }

    // company
    var company;
    if(!$('#companyTextField').val()) {
      $('#companyTextField').css('border-color', 'red');
      return;
    } else {
      company = $('#companyTextField').val();
    }

    // title
    var jobtitle;
    if(!$('#titleTextField').val()) {
      $('#titleTextField').css('border-color', 'red');
      return;
    } else {
      jobtitle = $('#titleTextField').val();
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

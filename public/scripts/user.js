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
  $('#interviews-' + index).toggleClass('fa-caret-right').toggleClass('fa-caret-down');
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
    // adding a regular job
    // create link element to parse
    var link = $("#linkTextField").val();

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

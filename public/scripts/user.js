// remove job-box
function remove(el, i) {
  console.log("-----------------------------------------");
  console.log("in remove function");

  $(el).closest('.job-box').remove();
  console.log("-----------------------------------------");
}

// show messageAlert
function showMessage() {
  $('#messageAlert').css("display", "block");
}

// toggle to show/hide jobs applied div
function toggleJobsApplied() {
  if($('#jobsapplied').hasClass('show')) {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
}

// toggle to show/hide prospective div
function toggleProspective() {
  if($('#prospective').hasClass('show')) {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
}

// toggle to show/hide reject-box div
function toggleReject() {
  if($('#reject-box').hasClass('show')) {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
}

// toggle to show/hide home div
function toggleHome() {
  if($('#home').hasClass('show')) {
    $('#home').toggleClass('hide').toggleClass('show');
  }
}

// show jobs applied
function showJA() {
  if($('#navbarSupportedContent').hasClass('hide')) {
    $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  }

  if($('#jobsapplied').hasClass('show')) {
    return;
  } else {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
  toggleProspective();
  toggleReject();
  toggleHome();
}

// show prospective jobs
function showPJ() {
  if($('#navbarSupportedContent').hasClass('hide')) {
    $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  }
  if($('#prospective').hasClass('show')) {
    return;
  } else {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
  toggleJobsApplied();
  toggleReject();
  toggleHome();
}

// show rejected jobs
function showRJ() {
  if($('#navbarSupportedContent').hasClass('hide')) {
    $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  }
  if($('#reject-box').hasClass('show')) {
    return;
  } else {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
  toggleProspective();
  toggleJobsApplied();
  toggleHome();
}

// show interviews
function showInterviews() {
  $('#tt').tooltip('toggle');
}

// When the user clicks on the button, open the modal
function addjob_click() {
  $('#addjobarea').toggleClass('hide').toggleClass('show');
  if($('#addprospectarea').hasClass('show')) {
    $('#addprospectarea').toggleClass('hide').toggleClass('show');
  }
}

function addprospect_click() {
  $('#addprospectarea').toggleClass('hide').toggleClass('show');
  if($('#addjobarea').hasClass('show')) {
    $('#addjobarea').toggleClass('hide').toggleClass('show');
  }
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

// when the submit adding a job is clicked
function addJob(url) {
  console.log('add job pressed...');
  // temporary flag variables
  var prospect;

  // determine if a prospective job or regular job is being added
  if($('#addprospectarea').hasClass('show')) {
    prospect = 2;
  } else {
    prospect = 1;
  }

  if(prospect === 2) {

    // VALIDATIONS
    // if the link field is empty
    if(!$('#plinkTextField').val()) {
      $('#plinkTextField').css('border', 'solid 2px red');
      return;
    }
    // adding a prospective job
    console.log('adding prospective job....');

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
      title = $('#ptitleTextField').val();
    }

    $.ajax({
      type: 'POST',
      url: "/addprospect",
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
  } else {
    // if the link text field is empty
    if(!$('#linkTextField').val()) {
      $('#linkTextField').css('border-color', 'red');
      return;
    }
    // adding a regular job
    console.log('adding job....');

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
    if(!$('#jobtitleTextField').val()) {
      $('#jobtitleTextField').css('border-color', 'red');
      return;
    } else {
      jobtitle = $('#jobtitleTextField').val();
    }

    //console.log('before ajax call...');
    $.ajax({
      type: 'POST',
      url: "/add",
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
  }
}

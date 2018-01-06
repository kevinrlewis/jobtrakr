function remove(el, i) {
  console.log("-----------------------------------------");
  console.log("in remove function");

  $(el).closest('.job-box').remove();
  console.log("-----------------------------------------");
}

function showMessage() {
  $('#messageAlert').css("display", "block");
}

function hideAll() {
  if($('#home').hasClass('show')) {
    return;
  } else {
    $('#home').toggleClass('hide').toggleClass('show');
  }
  if($('#jobsapplied').hasClass('show')) {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
  if($('#prospective').hasClass('show')) {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
  if($('#reject-box').hasClass('show')) {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
}

function showJA() {
  $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  if($('#jobsapplied').hasClass('show')) {
    return;
  } else {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
  if($('#prospective').hasClass('show')) {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
  if($('#reject-box').hasClass('show')) {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
  if($('#home').hasClass('show')) {
    $('#home').toggleClass('hide').toggleClass('show');
  }
}

function showPJ() {
  $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  if($('#prospective').hasClass('show')) {
    return;
  } else {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
  if($('#jobsapplied').hasClass('show')) {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
  if($('#reject-box').hasClass('show')) {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
  if($('#home').hasClass('show')) {
    $('#home').toggleClass('hide').toggleClass('show');
  }
}

function showRJ() {
  $('#navbarSupportedContent').toggleClass('hide').toggleClass('show');
  if($('#reject-box').hasClass('show')) {
    return;
  } else {
    $('#reject-box').toggleClass('hide').toggleClass('show');
  }
  if($('#prospective').hasClass('show')) {
    $('#prospective').toggleClass('hide').toggleClass('show');
  }
  if($('#jobsapplied').hasClass('show')) {
    $('#jobsapplied').toggleClass('hide').toggleClass('show');
  }
  if($('#home').hasClass('show')) {
    $('#home').toggleClass('hide').toggleClass('show');
  }
}

// When the user clicks on the button, open the modal
function addjob_click() {
  $('#addjobarea').toggleClass('hide').toggleClass('show');
  if($('#addprospectarea').hasClass('show')) {
    $('#addprospectarea').toggleClass('hide').toggleClass('show');
  }
  // if add job area is not displayed then display it
  // if(document.getElementById('addjobarea').style.display === "none") {
  //   //$('#addjobarea').css('display', 'block');
  //   //$('#addjobarea').toggleClass('show');
  //   // if prospect area is open while job area is trying to be opened the close it
  //   // if(document.getElementById('addprospectarea').style.display === "block") {
  //   //   $('#addprospectarea').css('display', 'none');
  //   // }
  // // if job area is open then close it
  // } else {
  //   //$('#addjobarea').css('display', 'none');
  //   //$('#addjobarea').toggleClass('hide');
  // }
}

function addprospect_click() {
  $('#addprospectarea').toggleClass('hide').toggleClass('show');
  if($('#addjobarea').hasClass('show')) {
    $('#addjobarea').toggleClass('hide').toggleClass('show');
  }

  // if add prospect area is not displayed
  // if(document.getElementById('addprospectarea').style.display === "none") {
  //   // show the area
  //   $('#addprospectarea').css('display', 'block');
  //   // if add job area is open close it
  //   if(document.getElementById('addjobarea').style.display === "block") {
  //     $('#addjobarea').css('display', 'none');
  //   }
  // // if prospect area is displayed then hide it
  // } else {
  //   $('#addprospectarea').css('display', 'none');
  // }
}


function comments_click(index) {
  $('#comment' + index).toggleClass('hide').toggleClass('show');
  // if(document.getElementById('comment' + index).style.display === "block") {
  //   document.getElementById('comment' + index).style.display = "none";
  // } else {
  //   document.getElementById('comment' + index).style.display = "block";
  // }
}

function prospectcomments_click(index) {
  $('#prospectcomment' + index).toggleClass('hide').toggleClass('show');
  // if(document.getElementById('prospectcomment' + index).style.display === "block") {
  //   document.getElementById('prospectcomment' + index).style.display = "none";
  // } else {
  //   document.getElementById('prospectcomment' + index).style.display = "block";
  // }
}

function rejectcomments_click(index) {
  $('#rejectcomment' + index).toggleClass('hide').toggleClass('show');
  // if(document.getElementById('rejectcomment' + index).style.display === "block") {
  //   document.getElementById('rejectcomment' + index).style.display = "none";
  // } else {
  //   document.getElementById('rejectcomment' + index).style.display = "block";
  // }
}
// When the user clicks on <span> (x), close the modal
function comments_modalclose_click(index) {
  document.getElementById('commentPopupModal' + index).style.display = "none";
  location.reload();
}


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
    // if the link field is empty
    if(!$('#plinkTextField').val()) {
      $('#plinkTextField').css('border', 'solid 2px red');
      return;
    }
    // adding a prospective job
    console.log('adding prospective job....');

    // create link element
    var el = document.createElement('a');
    el.href = $("#plinkTextField").val();

    // handle generic job pages
    var modhost;
    if(el.hostname == 'www.indeed.com') {
      modhost = 'job on indeed';
    } else {
      modhost = el.hostname;
    }

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

    //TODO: deprecate the link parsing, that data also does not need
    //      to be saved to database.
    $.ajax({
      type: 'POST',
      url: "/addprospect",
      contentType: 'application/json',
      data: JSON.stringify({
        hostname: modhost,
        hash: el.hash,
        pathname: el.pathname,
        search: el.search,
        joblink: el.href,
        comments: comments,
        company: company
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
    var el = document.createElement('a');
    el.href = $("#linkTextField").val();

    // handle generic job pages
    var modhost;
    if(el.hostname == 'www.indeed.com') {
      modhost = 'job on indeed';
    } else {
      modhost = el.hostname;
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

    //console.log('before ajax call...');
    $.ajax({
      type: 'POST',
      url: "/add",
      contentType: 'application/json',
      data: JSON.stringify({
        hostname: modhost,
        hash: el.hash,
        pathname: el.pathname,
        search: el.search,
        joblink: el.href,
        comments: comments,
        company: company
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

// function for when editting comments is available
/*function editCommentClick() {
  var comments;
  comments = $('#modalCommentLabel').val();
  $('#modalCommentLabel').replaceWith("<input type='plaintext' value='" + comments + "'/>");
}*/


function remove(el, i) {
  console.log("-----------------------------------------");
  console.log("in remove function");

  $(el).closest('.job-box').remove();
  console.log("-----------------------------------------");
}

function showMessage() {
  $('#messageAlert').css("display", "block");
}

function addJob(url) {
  console.log('add job pressed...');
  var prospect;

  if($('#addprospectarea').hasClass('show')) {
    prospect = 2;
  } else {
    prospect = 1;
  }
  console.log("addJob: " + prospect);
  if(prospect === 2) {
    // if the link field is empty
    if(!$('#plinkTextField').val()) {
      $('#plinkTextField').css('border-color', 'red');
      return;
    }
    // adding a prospective job
    console.log('adding prospective job....');

    // link element
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

    //console.log('before ajax call...');
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


/*function editCommentClick() {
  var comments;
  comments = $('#modalCommentLabel').val();
  $('#modalCommentLabel').replaceWith("<input type='plaintext' value='" + comments + "'/>");
}*/

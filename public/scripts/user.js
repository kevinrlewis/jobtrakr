
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
  if(!$('#linkTextField').val()) {
    $('#linkTextField').css('border-color', 'red');
    return;
  }

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
      comments: comments
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

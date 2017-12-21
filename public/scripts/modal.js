// When the user clicks on the button, open the modal
function addjob_click() {
  // if add job area is not displayed then display it
  if(document.getElementById('addjobarea').style.display === "none") {
    $('#addjobarea').css('display', 'block');
    // if prospect area is open while job area is trying to be opened the close it
    if(document.getElementById('addprospectarea').style.display === "block") {
      $('#addprospectarea').css('display', 'none');
    }
  // if job area is open then close it
  } else {
    $('#addjobarea').css('display', 'none');
  }
}

function addprospect_click() {
  // if add prospect area is not displayed
  if(document.getElementById('addprospectarea').style.display === "none") {
    // show the area
    $('#addprospectarea').css('display', 'block');
    // if add job area is open close it
    if(document.getElementById('addjobarea').style.display === "block") {
      $('#addjobarea').css('display', 'none');
    }
  // if prospect area is displayed then hide it
  } else {
    $('#addprospectarea').css('display', 'none');
  }
}

function comments_click(index) {
  if(document.getElementById('comment' + index).style.display === "block") {
    document.getElementById('comment' + index).style.display = "none";
  } else {
    document.getElementById('comment' + index).style.display = "block";
  }
}

function prospectcomments_click(index) {
  if(document.getElementById('prospectcomment' + index).style.display === "block") {
    document.getElementById('prospectcomment' + index).style.display = "none";
  } else {
    document.getElementById('prospectcomment' + index).style.display = "block";
  }
}

function rejectcomments_click(index) {
  if(document.getElementById('rejectcomment' + index).style.display === "block") {
    document.getElementById('rejectcomment' + index).style.display = "none";
  } else {
    document.getElementById('rejectcomment' + index).style.display = "block";
  }
}
// When the user clicks on <span> (x), close the modal
function comments_modalclose_click(index) {
  document.getElementById('commentPopupModal' + index).style.display = "none";
  location.reload();
}

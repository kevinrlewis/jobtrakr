function showAlert() {
  // alert the user that the job has already been added
  $("#existsAlert").show();
}

function checkJobExist(jobs) {
  console.log("-----------------------------------------");
  console.log("checking if job exists...");
  for(var i = 0; i < jobs.length; i++) {
    if(jobs[i].website == $("linkTextField").val()) {
      /*if(event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false; // for IE as dont support preventDefault;
      }*/
      showAlert();
      return false;
    }
  }
  console.log("-----------------------------------------");
}


function remove(el, i) {
  console.log("-----------------------------------------");
  console.log("in remove function");

  $(el).closest('.job-box').remove();
  console.log("-----------------------------------------");
}

function add() {
  console.log("-----------------------------------------");
  console.log("in add function");

  $.post("/add", function() {
    console.log("add success...");
  })
  .fail(function() {
    showAlert();
  });
  console.log("-----------------------------------------");
}

function checkJobExist() {
  console.log("in check job exist");
  console.log($("#linkTextField").val());
  $.ajax({
    url: '/add?link=' + $("#linkTextField").val(),
    type: "POST",
    success: function(response){
      console.log("job successfully added...");
      location.reload();
    },
    error: function(response){
      console.log("job failed to addd");
      $("#existsAlert").show();
    }
  });
}


function remove(el, i) {
  console.log("-----------------------------------------");
  console.log("in remove function");

  $(el).closest('.job-box').remove();
  console.log("-----------------------------------------");
}

$(document).ready(function() {
  var path = window.location.pathname;
  // call functions everytime a key is pressed
  if(path === "/prospective") {
    $('#prospectiveNavLink').css('font-style', 'italic');
    $('#prospectiveNavLink').css('color', 'var(--accent)');
  } else if(path === "/applied") {
    $('#appliedNavLink').css('font-style', 'italic');
    $('#appliedNavLink').css('color', 'var(--accent)');
  } else if(path === "/interviews") {
    $('#interviewsNavLink').css('font-style', 'italic');
    $('#interviewsNavLink').css('color', 'var(--accent)');
  } else if(path === "/rejected") {
    $('#rejectedNavLink').css('font-style', 'italic');
    $('#rejectedNavLink').css('color', 'var(--accent)');
  }
});

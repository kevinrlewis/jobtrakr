// When the user clicks on the button, open the modal
function addjob_click() {
    document.getElementById('popupModal').style.display = "block";
}

// When the user clicks on <span> (x), close the modal
function modalclose_click() {
    document.getElementById('popupModal').style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById('popupModal')) {
        document.getElementById('popupModal').style.display = "none";
    }
}

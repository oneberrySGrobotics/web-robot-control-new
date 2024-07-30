const dialogBox = document.getElementById('dialog-box');
var dialogBoxStatus = dialogBox.getAttribute('data-visibility');
const openDialogBoxButton = document.getElementById('openDialogBoxButton');
const closeDialogBoxButton = document.getElementById('closeDialogBoxButton');

events.forEach(function(event) {
    openDialogBoxButton.addEventListener(event, function() {
        dialogBox.setAttribute('data-visibility', true);
    });

    closeDialogBoxButton.addEventListener(event, function() {
        dialogBox.setAttribute('data-visibility', false);
    });
});
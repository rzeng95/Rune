// Add a confirmation prompt for deleting projects.
$('.profile-delete-form').submit(function(e) {
    e.preventDefault();
    var confirmDialogue = "Are you sure you want to delete your user profile?";
    var confirmEvent = confirm(confirmDialogue);
    if (confirmEvent) {
        var urlDelete = $(this).attr('action');
        $.ajax({
            url: urlDelete,
            method: 'POST',
            success: function(data) {
                window.location.href = data.redirect;
            }
        });
    }
});

console.log("loaded");

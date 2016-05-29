// Create task page namespace.
var Task = Task || {};

Task.taskEditLoad = function() {
    $.ajax({
        url: 'edit/',
        success: function(data) {
            $('.modal-content').html(data);
        },
    });
}

// Make edit button AJAX'd.
$('.btn-task-edit').click(function(e) {
    e.preventDefault();
    Task.taskEditLoad(); 
});

// Add a confirmation prompt for deleting projects.
$('.task-delete-form').submit(function(e) {
    e.preventDefault();
    var confirmDialogue = "Are you sure you want to delete this task?";
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

// Create task page namespace.
var Task = Task || {};

Task.taskEditLoad = function() {
    $.ajax({
        url : 'edit/',
        success : function(data) {
            $('.modal-content').html(data);
        },
    });
}

// Make edit button AJAX'd.
$('.btn-task-edit').click(function(e) {
    e.preventDefault();
    Task.taskEditLoad(); 
});


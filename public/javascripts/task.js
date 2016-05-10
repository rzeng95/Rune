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

// Create task page namespace.
var Task = Task || {};

Task.taskEditLoad = function() {
    $.ajax({
        url : 'edit/',
        success : function(data) {
            // var temp = $($.parseHTML(data)).filter(".task-body");
            $('.modal-content').html(data);
        },
    });
}

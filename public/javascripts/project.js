// Create project page namespace.
var Page = Page || {};
Page.Project = Page.Project || {};

Page.Project.taskCreateLoad = function() {
    $.ajax({
        url : 'createtask/',
        success : function(data) {
            $('.modal-content').html(data);
        },
    });
}

// Add a sortable property to Kanban board task objects.
$('.kanban-col').sortable({
    connectWith : '.kanban-col',
    stop : function(event, ui) {
        $.ajax({
            type : 'POST',
            url : window.location.href + 'movetask/',
            success : function(data) {
                console.log('success');
            }
        });
    }
});

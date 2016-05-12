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

// Add a confirmation prompt for deleting projects.
$('#btn-proj-del').click(function(e) {
    var projectName = $('#project-name').text();
    var promptDialogue = "Warning - deleting a project may have substantial repercussions!\n" + 
        "Are you sure you want to delete this project?\n\n" +
        "Type in the full project name to confirm that you want to delete this project:";
    var promptEvent = prompt(promptDialogue);
    if (promptEvent != projectName) {
        e.preventDefault();
    }
});

// Add a sortable property to Kanban board task objects.
$('.kanban-col').sortable({
    connectWith : '.kanban-col',
    stop : function(event, ui) {
        $.ajax({
            type : 'POST',
            data : {
                status : $(ui.item).parent().attr('id'),
                taskid : $(ui.item).attr('id')
            },
            url : 'movetask/',
            success : function(data) {
                console.log('success');
            }
        });
    }
});

// Clamp the text on the kanban board.
var clamps = document.getElementsByClassName("js-clamp");
for(var i = 0; i < clamps.length; i++)
{
    $clamp(clamps[i], {clamp: 2});
}

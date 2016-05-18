////////////////////////////////////////////////////////////////////////////////
// Global declarations.
////////////////////////////////////////////////////////////////////////////////

// Create project page namespace.
var Page = Page || {};
Page.Project = Page.Project || {};
var currTaskID = '';

////////////////////////////////////////////////////////////////////////////////
// Utility functions.
////////////////////////////////////////////////////////////////////////////////

// GET function for generating the "create task" modal HTML.
Page.Project.taskCreateLoad = function() {
    $.ajax({
        url : 'createtask/',
        success : function(data) {
            $('.modal-content').html(data);
        }
    });
};

// GET function for generating the "edit task" modal HTML.
Page.Project.taskEditLoad = function(taskid) {
    $.ajax({
        url : 't/' + taskid + '/edit/',
        success : function(data) {
            // With the generated HTML, place the HTML into the modal.
            $('.modal-content').html(data);

            // Add a listener for when the "edit task" form gets submitted.
            $('.task-edit-form').submit(function(e) {
                e.preventDefault();
                var postData = $(this).serializeArray();
                $.ajax({
                    method : 'POST',
                    url : 't/' + taskid + '/edit/',
                    data : postData,
                    success : function(data) {
                        Page.Project.taskWindowUpdate(taskid);
                    }
                });
                $('#task-modal').modal('toggle');
                e.unbind();
            });
        }
    });
};

// GET function for injecting task browser window with task page HTML.
Page.Project.taskWindowLoad = function(taskid) {
    $('.task-browser-window-el').hide();
    $('#' + taskid + '.task-browser-window-el').show();
};

Page.Project.taskWindowUpdate = function(taskid) {
    $.ajax({
        url : 't/' + taskid + '/',
        success : function(data) {
            $('#' + taskid + '.task-browser-window-el').html(data);
            Page.Project.taskWindowListeners();
        }
    });
};

////////////////////////////////////////////////////////////////////////////////
// Listeners and actual applications to page elements.
////////////////////////////////////////////////////////////////////////////////

Page.Project.taskWindowListeners = function() {
    // Make edit button AJAX'd.
    $('.btn-task-edit').click(function(e) {
        e.preventDefault();
        Page.Project.taskEditLoad(currTaskID); 
    });

    // Make task delete button work on task browser tab.
    $('.task-delete-form').submit(function(e) {
        $(this).attr('action', 't/' + currTaskID + '/delete/');
    });

    // Make comment submission work on task browser tab.
    $('.task-comment-form').submit(function(e) {
        e.preventDefault();
        var postData = $(this).serializeArray();
        $.ajax({
            method : 'POST',
            url : 't/' + currTaskID + '/comment/',
            data : postData,
            success : function(data) {
                Page.Project.taskWindowUpdate(currTaskID);
            }
        });
        e.unbind();
    });
};

// Load the task listeners.
Page.Project.taskWindowListeners();

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
            method : 'POST',
            data : {
                status : $(ui.item).parent().attr('id'),
                taskid : $(ui.item).attr('id')
            },
            url : 'movetask/'
        });
    }
});

// Clamp the text on the kanban board.
var clamps = document.getElementsByClassName("js-clamp");
for (var i = 0; i < clamps.length; i++) {
    $clamp(clamps[i], {clamp: 2});
}

// Make it such that selecting a task element loads the right column window.
$('.task-browser-list-el-link').click(function(e) {
    e.preventDefault();
    currTaskID = $(this).parent().attr('id');
    Page.Project.taskWindowLoad(currTaskID); 
});

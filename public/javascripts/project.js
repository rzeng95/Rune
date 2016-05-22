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

            // Add a listener for when the "create task" form gets submitted.
            $('.task-create-form').submit(function(e) {
                $('#task-modal').modal('toggle');
                e.unbind();
            });
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
    });
};

// Load the task listeners.
Page.Project.taskWindowListeners();

// Add a confirmation prompt for deleting projects.
$('.project-del-form').submit(function(e) {
    var projectName = $('#project-name-text').text();
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

// Task List Manipulation
var $tasks = $('.task-browser-list');
var $tasksli = $tasks.children('li');

//Task Sorting
//Sort Types:
//datecreated
//priority

//Sort Orders:
//ascending
//descending
$('.sort1-el').click(function(e) {
    SortTasks($(this).attr('sort-type'), $(this).attr('sort-order'));
});

var SortTasks = function(attribute, order) {
    $tasksli.sort(function(a, b) {
        var an = convertAttributeForSort(a.getAttribute(attribute));
        var bn = convertAttributeForSort(b.getAttribute(attribute));
        if (order == "ascending") {
            if (an > bn) {
                return 1;
            }  else if (an < bn) {
                return -1;
            }
        } else if (order == "descending") {
            if (an < bn) {
                return 1;
            } 
            else if(an > bn) {
                return -1;
            }
        }
        if (a.id < b.id) {
            return 1;
        } else if (a.id > b.id) {
            return -1;
        }
        return 0;
    });
    $tasksli.detach().appendTo($tasks);
}

var convertAttributeForSort = function(attribute) {
    switch(attribute) {
        case "High":
            return 2;
            break;
        case "Medium":
            return 1;
            break;
        case "Low":
            return 0;
            break;
        default:
            return attribute;
    }
}

SortTasks("datecreated", "descending");

//Task Filtering
//Filter types:
//Priority
//  High
//  Medium
//  Low
//Status
//  Backlog
//  Selected for Development
//  In Progress
//  Completed
//  Archived

$('.filter-el').click(function(e) {
    FilterTasks($(this).attr('filter-type'), $(this).attr('filter-val'));
});

var filters = [];
var FilterTasks = function(attribute, value) {
    if(filters[attribute] != null) {
        var valueIndex = filters[attribute].indexOf(value);
        if(valueIndex > -1) {
            filters[attribute].splice(valueIndex, 1);
        }
        else {
            filters[attribute].push(value);
        }
    }
    else {
        var newType = [value];
        filters[attribute] = newType;
    }
    Filter();
}

var Filter = function() {
    $tasksli.show();
    for (var filterType in filters) {
        if (filters[filterType].length > 0) {
            $tasksli.each(function() {
                var isType = false;
                for (var filterValue in filters[filterType]) {
                    if ($(this).attr(filterType) == filters[filterType][filterValue]) {
                        isType = true;
                    }
                }
                if (!isType) {
                    $(this).hide();
                }
            });
        }
    }
}

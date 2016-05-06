function loadCreateTask() {
    $.get('createtask/', function(data) {
        $('.modal-content').html(data);
    });
}

function submitCreateTask() {
    $.ajax({
        type : 'POST',
        data : $('form').serializeArray(),
        url : 'createtask/',
        success : function(data) {
            console.log('IT WORKS');
            location.reload();
        }
    });
}

// Add a sortable property to Kanban board task objects.
$('.kanban-col').sortable({
    // revert: true
    connectWith : '.kanban-col',
    stop : function(event, ui) {
        $.ajax({
            type : 'POST',
            // data : $('form').serializeArray(),
            url : window.location.href + 'movetask/',
            success : function(data) {
                console.log('success');
            }
        });
    }
});

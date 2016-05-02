// jQuery's safe way of adding dynamic functions to HTML pages.
$(function() {
    // Add a sortable property to Kanban board task objects.
    $(".kanban-col").sortable({
        // revert: true
        connectWith: '.kanban-col',
        stop: function() {

        }
    });
});

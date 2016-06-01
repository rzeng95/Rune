var $userRows = $('.user-row')
$userRows.hide();
$('#search').each(function(){
	$(this).data('prev', $(this).val());
	$(this).bind("propertychange change click keyup input paste", function(event){
		if($(this).data('prev') != $(this).val()) {
			$(this).data('prev', $(this).val());
			if($(this).val() === "") {
				$userRows.hide();
			} else {
				searchUsers($(this).val().toLowerCase());
			}
		}
	});
});

var searchUsers = function(query) {
	$userRows.each(function() {
		$(this).hide();
		if($(this).attr('skills') != null && $(this).attr('skills').toLowerCase().indexOf(query) !== -1) {
			$(this).show();
		} else if($(this).attr('firstname') != null && $(this).attr('firstname').toLowerCase().indexOf(query) !== -1) {
			$(this).show();
		} else if($(this).attr('lastname') != null && $(this).attr('lastname').toLowerCase().indexOf(query) !== -1) {
			$(this).show();
		} else if($(this).attr('description') != null && $(this).attr('description').toLowerCase().indexOf(query) !== -1) {
			$(this).show();
		}
	});
}
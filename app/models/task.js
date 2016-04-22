var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({

    parent            : {
        projectid     : String,
        projectname   : String,
        projectkey    : String

    }



});

module.exports = mongoose.model('Task', taskSchema);

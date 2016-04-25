var mongoose = require('mongoose');

var taskModel = require('./task.js');
var taskSchema = taskModel.schema;

var projectSchema = mongoose.Schema({
    projectid      : String,
    projectname    : String,
    projectkey     : String,
    members        : [String],  // roland.zeng@gmail.com, alexlw92@yahoo.com
    tasks          : [taskSchema] // see task schema

});

module.exports = mongoose.model('Project', projectSchema);

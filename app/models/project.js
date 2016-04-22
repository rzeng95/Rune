//var taskModel = require('task.js');

var mongoose = require('mongoose');

//var taskSchema = require('mongoose').model(taskModel).schema;

var projectSchema = mongoose.Schema({
    projectid : String,
    projectname : String,
    projectkey : String,
    members : [String]
    /*,
    tasks: [taskSchema]
    */
});

module.exports = mongoose.model('Project', projectSchema);

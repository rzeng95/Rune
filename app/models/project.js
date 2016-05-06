var mongoose = require('mongoose');

//var taskModel = require('./task.js');
//var taskSchema = taskModel.schema;

var projectSchema = mongoose.Schema({
    projectid      : String,
    projectname    : String,
    projectkey     : String,
    members        : [String],  // roland.zeng@gmail.com, alexlw92@yahoo.com
    tasks          :  [
        {
            projectid       : String,   // 571b042d4bd894d80a71c2a2
            taskname        : String,   // "As a user I wish to see updated tasks"
            taskid          : Number,   // BSH-001 where BSH is the prefix of the project
            taskdescription : String,   // "implement task schema"
            createdby       : String,   // email of the account who used it
            assignedto      : String,   // email of the person who will handle the task
            status          : String,   // todo, in progress, etc.
            datecreated     : String,   // current date at creation of the task (date.now)
            priority        : String,   // high / medium / low
            issuetype       : String    // core / feature / bug

        }
    ]
});

module.exports = mongoose.model('Project', projectSchema);

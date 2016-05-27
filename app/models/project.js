var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    projectid      : String,
    projectname    : String,
    projectkey     : String,
    admin          : String,
    members        : [String],  // roland.zeng@gmail.com, alexlw92@yahoo.com
    counter        : Number,    // Stores the task number
    history        : [
        {
            date : String,
            link : String,
            action : String,
            description: String
        }
    ],
    description	   : String,
    projectskills  : String,
    ispublic       : Boolean,
    pending        : [String],
    tasks          :  [
        {
            projectid       : String,   // 571b042d4bd894d80a71c2a2
            taskname        : String,   // "As a user I wish to see updated tasks"
            taskid          : String,   // BSH-001 where BSH is the prefix of the project
            taskdescription : String,   // "implement task schema"
            createdby       : String,   // email of the account who used it
            assignedto      : String,   // email of the person who will handle the task
            status          : String,   // todo, in progress, etc.
            datecreated     : String,   // current date at creation of the task (date.now)
            priority        : String,   // high / medium / low
            issuetype       : String,    // core / feature / bug
            comments        : [
                {
                    date    : String,
                    authorname : String,
                    authorid : String,
                    comment : String,
                    github : String
                }
            ]

        }
    ],
    github_owner    : String,
    github_repo     : String,
    github_url      : String
});

module.exports = mongoose.model('Project', projectSchema);

# RUNE
### An intuitive and student-focused Kanban project management tool   



[![Build Status](https://travis-ci.org/rzeng95/Rune.svg?branch=master)](https://travis-ci.org/rzeng95/Rune.svg?branch=master) 
[![Dependencies](https://david-dm.org/rzeng95/rune.svg)](https://david-dm.org/rzeng95/rune.svg)

#### Live Site  
https://rune130.herokuapp.com

#### Documentation  
<a href="https://github.com/rzeng95/Rune/blob/master/documentation/Rune%20Design%20Doc.pdf">Design Document</a>   
<a href="https://github.com/rzeng95/Rune/blob/master/documentation/Rune%20Final%20Report.pdf">Final Report</a>   

#### Description  
Rune is a Kanban project management tool designed as our team's senior capstone project. We've all worked with Jira in the past, and realize its importance for managing software development among large teams. Throughout our time at UCLA, we've participated in large software development groups where it's hard to keep track of what everyone's working on, and projects tend to stagnate until they turn into last-minute hackathon sessions. Thus it was our intention to create some sort of issue tracker for students, and we created Rune with these issues in mind.  
  
Rune promotes a Kanban workflow - You can create tasks for your project that can be placed in a backlog. When you or one of your teammates picks up a task, simply move it to a new state (Selected for Development, In Progress, Completed). You can also add comments to existing tasks, or associate completed tasks with Github commits. 

<img src="https://i.gyazo.com/3a9a56fe7f69465dfa05c23b67d9907b.png">  
<i>Six weeks into development, we started being able to use Rune to track our own project!</i>

Rune's biggest difference from existing task tracking tools is the Project Finder. Many services (Jira, Trello) assume you've already found your team. However, sometimes, students in project-driven courses sometimes aren't sure who they're working with. Also, they may only want to join projects they're interested in working on. On the flip side, teams could be looking for more members - people who have certain skills or similar goals. With Rune's Project Finder, teams can list their project pages, along with project descriptions, and other users can apply to those projects. Teams can visit users' profiles before accepting their applications, to see if their goals and skills align.

<img src="https://i.gyazo.com/fdb3aaee8bd39ede213d4b4129902437.png">
<i>Rune Development, our team's project page, has been listed on Project Finder</i>


#### Future Goals  
Email Capabilities
- Password Recovery 
- Notifications to relevant users when tickets are assigned or modified 

Project Metrics  
- Number of tasks completed per member  
- Tasks completed per week  

Caching
- Currently each Kanban board loads up the list of every single task upon page load; this means caching is very useful as many existing tasks don't need to be modified upon page load.

UCLA Integration
- Users log in with their UID and can be added to separate Project Finder 

#### Members  

<a href="https://github.com/JustinYHou">Justin Hou</a>  
<a href="https://github.com/brandonly101">Brandon Ly</a>   
<a href="https://github.com/siolaterr">Brendan Sio</a>  
<a href="https://github.com/xkevintong">Kevin Tong</a>  
<a href="https://github.com/alexlw92">Alex Wang</a>   
<a href="https://github.com/rzeng95">Roland Zeng</a>  
<a href="https://github.com/Thessiah">Kevin Zuo</a>  


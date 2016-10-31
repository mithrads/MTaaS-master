var express = require('express');
var router = express.Router();

/* GET Create project. */

//Tester - Phase
router.get('/TesterPhase/Dashboard', function(req, res) {
	var db=req.db;
  var userid = req.cookies.user;
  	var collect = db.get('project');
    var collect1 = db.get('users');
    console.log(req.session.user);
    if(req.query.sourcepg=="joinpr")
    {
       collect1.update(
               { "user_id" : userid },
               { $push: { "proj_id": parseInt(req.query.proj_id) }},
                { upsert: true },function(){
                  res.redirect('/TesterPhase/Dashboard');
                });
    }
    else
    {
      collect.find({},function(err,result){
          collect1.findOne({"user_id" : userid},function(err,result2){
             res.render('TesterPhase/Dashboard/Dashboard',{projs : result,jprojs:result2.proj_id,session:req.session.user});
           });
    });
    }
  
});

router.get('/TesterPhase/JoinedProjects', function(req, res) {
	var db=req.db;
	var name = req.cookies.user;
  	var collect = db.get('users');
  	collect.findOne({"user_id" : name},function(err,result){
         res.render('TesterPhase/JoinedProjects/JoinedProjectList',{projs : result.proj_id});
    });
});

router.get('/TesterPhase/ProjectMan', function(req, res) {

	var db=req.db;
	var name = req.cookies.user;
	var proj_id = 234;
	var i=0,j=0;
	var status;
  	var collect = db.get('project');
  	collect.findOne({"proj_id" : proj_id},function(err,result){
  		do
  		{
  		var testers = result.tester[i].user_id;
  		if(testers==name)
  		{
  			status = "Waiting for Admin Approval";
  			if(result.tester[i].approv)
  			{
  				status = "Approved by Admin - Working in Project" ;
  				if(result.tester[i].completed)
  					status = "Completed this Project" ;
  			}
  			if(result.tester[i].drop_reason)
  				status = "Droped the Project" ;
  			break;
  		}
  		i++;
  		}while(i<result.tester.length)
  		
  		j=i;
  		i=0;
  		var valid=0,invalid=0;
  		
  		do
  		{
  		var testers = result.bugs[i].det_by;
  		if(testers==name)
  		{
  			if(result.bugs[i].validated)
  				valid++;
  			else
  				invalid++;
  		}
  		i++;
  		}while(i<result.bugs.length)

  		if(req.query.sourcepg=="reason")
		  {
				console.log(result.tester[j].user_id);
				console.log(req.query.reasons);
				
				collect.update(
				{ "proj_id" : proj_id, "tester.user_id" : name }
				,
   				{ $set: { "tester.$.drop_reason" : req.query.reasons} }
				);

				res.redirect('/TesterPhase/ProjectMan');
		  }
		else
			res.render('TesterPhase/JoinedProjects/ProjectMan',{projs : result, status_now : status,reportd : invalid+valid,approv : valid});
    });

});

router.get('/TesterPhase/Announcements', function(req, res) {
    res.render('TesterPhase/JoinedProjects/Announcements');
});

router.get('/TesterPhase/Bugs', function(req, res) {

	var db=req.db;
	var name = req.cookies.user;
	var proj_id = 234;
	var collect = db.get('project');

	collect.findOne({"proj_id" : proj_id},function(err,result){
				console.log(result.bugs);


				if(req.query.sourcepg)  //For report bug page
				{

         
					collect.update(
       				 { "proj_id" : proj_id },
       				 { $push: {
           			 bugs: {
            			"bugs_id" : 33,
            			"bug_desc" : req.query.bug_descri,
            			"det_date" : "22-Nov-2012",  //current date
            			"det_by"   : name,
            			"validated" :  "",
            			"dev_id" : 456,
            			"bug_detail" : []
                	},  
                	}},
            		{ upsert: true },function(){
            			res.redirect('/TesterPhase/Bugs');
            		});

				}

				else
				{
            	res.render('TesterPhase/JoinedProjects/Bugs' ,{bugs : result.bugs}); 
            	}
    });

});

router.get('/TesterPhase/DeviceManagement', function(req, res) {
    res.render('TesterPhase/DeviceManagement/DeviceManagement');
})
router.get('/TesterPhase/OverviewClient', function(req, res) {
    res.render('TesterPhase/Payment/OverviewClient');
})
router.get('/TesterPhase/Transactions', function(req, res) {
    res.render('TesterPhase/Payment/Transactions');
})


module.exports = router;

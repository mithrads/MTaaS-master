var express = require('express');
var router = express.Router();


/////Dashboard///////////////////////////////////////////////////////////////

router.get('/', function(req, res, next) {
  
  var db=req.db;
  var collect = db.get('project');
    if(req.query.sourcepg=='set_now')
    {
        res.cookie('project',req.query.proj_now);
        res.redirect('/Status');
    }
    else
    {

  collect.find({},function(err,result){
         res.render('ClientPhase/Dashboard/Dashboard',{projs : result,session:req.cookies.user});
    });
    }
});

/////Dashboard-End///////////////////////////////////////////////////////////////


/////Current Project///////////////////////////////////////////////////////////////

router.get('/Announcement', function(req, res) {

    var user_id=req.cookies.user; 
    var proj_ids=parseInt(req.cookies.project);  
    var db=req.db;
    var uno=new Date().valueOf();

    var collect = db.get('project');
   
    if(req.query.sourcepg=="ann_pg")
    {
        
        collect.update(
                { "proj_id" : proj_ids },
                { $push: { "announcements": 
                    
                    {
                        "ann_id" : uno,
                        "ann_sub" : req.query.ann_sub,
                        "ann_date" : "12-Nov-2015",
                        "ann_detail" : []
                    }
                }},  
                { upsert: true },function(){
                    res.redirect('/Announcement');
                });
    }
    else
    
    collect.findOne({"proj_id" : proj_ids},function(err,result){
         res.render('ClientPhase/CurrentProjects/Announcement',{anns:result.announcements});

    });

    //write code to reply to announcement    
    
});

router.get('/NewBugs', function(req, res) {

    var user_id=req.cookies.user; 
    var proj_ids=234;  
    var db=req.db;
    var collect = db.get('project');
    var status;
    if(req.query.sourcepg)
    {
        if(req.query.sourcepg=='app_bugspg')
            status = true;
        if(req.query.sourcepg=='rej_bugspg')
            status = false;

        console.log(status);
        collect.update(
                { "proj_id" : proj_ids, "bugs.bugs_id" : parseInt(req.query.bug_id) }
                ,
                { $set: { "bugs.$.validated" : status} }
                );
        console.log("approve here"+req.query.bug_id);
        res.redirect('/NewBugs');
        
    }
    else{ if(req.query.sourcepg=='rej_bugspg')
        console.log("reject here"+req.query.bug_id);
    
    
    collect.findOne({"proj_id" : proj_ids},function(err,result){
         res.render('ClientPhase/CurrentProjects/NewBugs',{bugs:result.bugs});

    });
    }
});

router.get('/AllBugs', function(req, res) {
    var user_id=req.cookies.user; 
    var proj_ids=parseInt(req.cookies.project); 
    var db=req.db;
    var collect = db.get('project');

    collect.findOne({"proj_id" : proj_ids},function(err,result){
    res.render('ClientPhase/CurrentProjects/AllBugs',{bugs:result.bugs});
    });
});

router.get('/Status', function(req, res) {

    var user_id=req.cookies.user;
    var proj_ids=parseInt(req.cookies.project); 
    var db=req.db;
    var collect = db.get('project');
    var collect1 = db.get('devices');

    collect.findOne({"proj_id" : proj_ids},function(err,result){
        var perc=result.no_tested_dev*100/(result.no_tested_dev+result.no_pend_dev);
        var cdevices =  [];
        var pdevices =  [];
        var i=0;
        for(var i=0;i<result.no_tested_dev+result.no_pend_dev;i++)
        {
            console.log();
            if(result.devices[i].completed==true)
                    cdevices.push(result.devices[i].dev_id);
            else
                    pdevices.push(result.devices[i].dev_id);
        }
            
        collect1.findOne({"dev_id" : cdevices[0]},function(err,result2){
            collect1.findOne({"dev_id" : pdevices[0]},function(err,result3){
             res.render('ClientPhase/CurrentProjects/Status',{percent:perc,dead:result.deadline,com_devices:cdevices,com_device_dt:result2,pen_devices:pdevices,pen_device_dt:result3});   
            });
        });
    });
});

router.get('/ModifyingTestingDevice', function(req, res) {

    var user_id=req.cookies.user; 
    var proj_ids=parseInt(req.cookies.project); 
    var db=req.db;
    var collect = db.get('project');

    collect.findOne({"proj_id" : proj_ids },function(err,result){
    
    if(req.query.sourced=="add_device")
    {
        var db=req.db;
        var collect = db.get('devices');
        var collect1 = db.get('project');
        var devic_id = new Date().valueOf();

        collect.insert({
        "dev_id" : devic_id,          
        "dev_name" : req.query.add_devname,
        "dev_os" : req.query.add_devos,
        "dev_os_ver" : parseInt(req.query.add_version),
        "dev_proc_spd_gz" : parseInt(req.query.add_procspd),
        "dev_proc_type" : req.query.add_proctyp,
        "dev_ram_gb" : parseInt(req.query.add_ram),
        "dev_bat_mAh" : parseInt(req.query.add_battery),
        "dev_con" : req.query.add_contype
        }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {

              collect1.update(
                { "proj_id" : proj_ids },
                { $push: { devices: 
                    {
                    "dev_id" : devic_id,
                    "started" : false,
                    "completed" : false
                    } 
                }},  
                { upsert: true },function(){

                    res.redirect('/ModifyingTestingDevice');
                });
        }
        }); 

    }
    else
    {
         res.render('ClientPhase/CurrentProjects/ModifyingTestingDevice',{cre_devices:result.devices});
    }

    });

});


router.get('/ChangeDeadline', function(req, res) {

    var db=req.db;
    var projid = parseInt(req.cookies.project); 
    var collect = db.get('project');
    if(req.query.cg_reason)
    {
    //console.log(req.query);
    {
    collect.update(
            { "proj_id" : projid },
            { $set: { deadline: req.query.cg_date, deadline_cg_reason: req.query.cg_reason }},  
            { upsert: true });
    }
    }
    res.render('ClientPhase/CurrentProjects/ChangeDeadline');
});

router.get('/ApproveRejectTesters', function(req, res) {
    res.render('ClientPhase/CurrentProjects/ApproveRejectTesters');
});
router.get('/MyTesters', function(req, res) {
    res.render('ClientPhase/CurrentProjects/MyTesters');
});

/////Current Project-End///////////////////////////////////////////////////////////////

router.get('/HistoryProjects', function(req, res) {
    res.render('ClientPhase/HistoryProjects/HistoryProjects');
});



/////////////////////////////////////////////////////////////////////////////////Create Projects///////////////////

router.get('/ProjectSpecific', function(req, res) {
    res.render('ClientPhase/CreateProject/ProjectSpecific');
});

router.post('/Devices', function(req, res) {
    
    if(req.body.source=="add_device")
    {
        var db=req.db;
        var collect = db.get('devices');
        var uno = new Date().valueOf();
        
        
        livevalue = {cre_name : req.body.cre_name, cre_url : req.body.cre_url, cre_dead : req.body.cre_dead, cre_award : req.body.cre_award, cre_expec : req.body.cre_expec, cre_devices: req.body.cre_devices, inputs : JSON.parse(req.body.inputs)};
        devices=livevalue.inputs;
        devices.push(req.body.add_devname);
        livevalue = {cre_name : req.body.cre_name, cre_url : req.body.cre_url, cre_dead : req.body.cre_dead, cre_award : req.body.cre_award, cre_expec : req.body.cre_expec, cre_devices: devices, inputs : JSON.stringify(devices)};
        
        collect.insert({
        "dev_id" : uno,          //generate id
        "dev_name" : req.body.add_devname,
        "dev_os" : req.body.add_devos,
        "dev_os_ver" : parseInt(req.body.add_version),
        "dev_proc_spd_gz" : parseInt(req.body.add_procspd),
        "dev_proc_type" : req.body.add_proctyp,
        "dev_ram_gb" : parseInt(req.body.add_ram),
        "dev_bat_mAh" : parseInt(req.body.add_battery),
        "dev_con" : req.body.add_contype

        }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
                res.render('ClientPhase/CreateProject/Devices',livevalue);
        }
        }); 
    }  
    else  
    {
        livevalue = {cre_name : req.body.cre_name, cre_url : req.body.cre_url, cre_dead : req.body.cre_dead, cre_award : req.body.cre_award, cre_expec : req.body.cre_expec, cre_devices: [], inputs : JSON.stringify([]) };
        res.render('ClientPhase/CreateProject/Devices',livevalue);
    } 
});

router.post('/Expenditure', function(req, res) {

    var db=req.db;
    var name=req.cookies.user; 
    var proj_ids = parseInt(req.cookies.project); 
    var collect = db.get('project');
    console.log(req.body);
    livevalue = req.body;
    var devices = JSON.parse(req.body.inputs);
    var collect1 = db.get('payment');
    var data = [];
    var i=0;
    do
    {
    data.push(parseInt(devices[i]));
    i++;
    }while(devices[i]!=null);
    console.log(data);


        collect1.findOne({"user_id" : name},function(err,result){
            balance = 0;
            var collect2 = db.get('coupon');
            console.log()
            collect2.findOne({"coupon_cd" : req.body.ccode},function(err,result2){
                balance = balance + result2.dis_amnt;

                res.render('ClientPhase/CreateProject/Expenditure',{devices : JSON.stringify(data),
                    dev_count:devices.length,avail_cred:result.usable_cred,disc_cred:balance,proj_id : proj_ids,location : req.body.cre_url,proj_name : req.body.cre_name,proj_des : req.body.cre_expec,no_tested_dev : 0,deadline : req.body.cre_dead,award_per_bug : req.body.cre_award,no_pend_dev : devices.length,approved : false,client : [{user_id : name}],devices : JSON.stringify(data)});

            });

        });

  
});


///////////////////////////////////Create Projects-End //////////////////////////////////////////////////////////////

/////Dashboard///////////////////////////////////////////////////////////////

router.post('/Home', function(req, res, next) {

    console.log(req.body);
    var db=req.db;
    var name=req.cookies.user; 
    var uno = new Date().valueOf();
    var collect = db.get('project');
    var collect1 = db.get('payment');
    var data=[];
    var i=0;
    devices=JSON.parse(req.body.devices);
    do
    {
    data.push({dev_id : devices[i],started : false, completed : false});
    i++;
    }while(devices[i]!=null);

    collect.insert({
        "proj_id" : parseInt(uno),          
        "proj_des" : req.body.proj_des,
        "proj_name" : req.body.proj_name,
        "no_tested_dev" : parseInt(req.body.no_tested_dev),
        "no_pend_dev" : parseInt(req.body.no_pend_dev),
        "deadline" : req.body.deadline,
        "location" : parseInt(req.body.locations),
        "approved" : false,
        "award_per_bug" : parseInt(req.body.award_per_bug),
        "devices" : data,
        "client" : [{user_id : name}],
        "announcements":[],
        "bugs":[]
        }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {

        collect1.findOne({"user_id" : name},function(err,result1){

        var total= parseInt(result1.usable_cred)-(i*parseInt(req.body.award_per_bug));
       
        collect1.update(
        { "user_id" : "kavin_91" },
        { $push: {
            trans: {
            "trans_amnt" : i*parseInt(req.body.award_per_bug),
            "desc" : "Paid for project "+req.body.proj_name,
            "date" : "22-Nov-2012",                         //get current date
            "balance" :  total
                },  
                }},
            { upsert: true },function(){
        
         collect1.update(
            { "user_id" : "kavin_91" },
            { $set: { usable_cred: total }},  
            { upsert: true });
         console.log({ usable_cred: total });

         collect1.update(
        { "user_id" : "kavin_91" },
        { $push: {
            projs: {
            "proj_id" : parseInt(req.body.proj_id),
            "lock_cred" : result1.lock_cred+(i*parseInt(req.body.award_per_bug)),
            "client" : [ 
                {
                    "spent_cred" : 0.0000000000000000,
                    "spent_bug" : 0.0000000000000000,
                    "spent_dev" : 0.0000000000000000
                }
            ],
            "nonclient" : [ 
                {
                    "earnd_cred" : 0.0000000000000000,
                    "bugs_rep" : 0.0000000000000000
                }]
                },  
                }},
            { upsert: true });

             res.redirect('/');

        });
        }); 

                
        }
        }); 
   
});

/////Dashboard-End///////////////////////////////////////////////////////////////


///////////////////////////////////Payment////////////////////////////////////////////////////////////////////////////
router.get('/OverviewClient', function(req, res) {

    var name =req.cookies.user; 
    var db=req.db;
    var collect = db.get('payment');
    collect.findOne({"user_id" : name},function(err,result){
         res.render('ClientPhase/Payment/OverviewClient',{projs : result.projs,avail_cred : result.usable_cred, lock_cred : result.lock_cred,spent_cred : result.spent_cred});
    });

});

router.get('/Transactions', function(req, res) {

    var name =req.cookies.user;               
    var db=req.db;
    var collect = db.get('payment');

    collect.findOne({"user_id" : name},function(err,result){
        res.render('ClientPhase/Payment/Transactions',{trans : result.trans});
    });
});

router.post('/Cli_PayNow', function(req, res) {

    var name=req.cookies.user;    
    var db=req.db;
    var collect = db.get('payment');

    collect.findOne({"user_id" : name},function(err,result){

        var total= parseInt(result.usable_cred)+parseInt(req.body.amnt);
       
        collect.update(
        { "user_id" : "kavin_91" },
        { $push: {
            trans: {
            "trans_amnt" : -req.body.amnt,
            "desc" : "Money to Credits from "+req.body.accn_no,
            "date" : "22-Nov-2012",                         //get current date
            "balance" :  total
                },  
                }},
            { upsert: true },function(){
        
         collect.update(
            { "user_id" : "kavin_91" },
            { $set: { usable_cred: total }},  
            { upsert: true });

            collect.findOne({"user_id" : name},function(err,result){
                res.render('ClientPhase/Payment/Transactions',{trans : result.trans});
            });
        });
        }); 
});

router.post('/Cli_Encash', function(req, res) {

    var name = req.cookies.user; 
    var db=req.db;
    var collect = db.get('payment');

    collect.findOne({"user_id" : name},function(err,result){

         var total= parseInt(result.usable_cred)-parseInt(req.body.enc_amnt);
      
        collect.update(
        { "user_id" : "kavin_91" },
        { $push: {
            trans: {
            "trans_amnt" : parseInt(req.body.enc_amnt),
            "desc" : "Encashed - "+req.body.enc_accnno,
            "date" : "22-Nov-2012",                         //get current date
            "balance" : total
                },  
                }},
            { upsert: true },function(){
        
         collect.update(
            { "user_id" : "kavin_91" },
            { $set: { usable_cred: total }},  
            { upsert: true });

            collect.findOne({"user_id" : name},function(err,result){
                res.render('ClientPhase/Payment/Transactions',{trans : result.trans});
            });
        });
        }); 
});

module.exports = router;

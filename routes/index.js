var express = require('express');
var router = express.Router();

router.post('/login', function(req, res) {

    var db=req.db;
    var collect = db.get('users');
    collect.findOne({user_id:req.body.username},function(err,result){
    if(req.body.password==result.password)
    {
       res.cookie('user',req.body.username);
       if(result.tester_b)
        res.redirect('/TesterPhase/Dashboard');
        if(result.client_b)
        res.redirect('/');
        if(result.admin_b)
        res.redirect('/Admin/ApproveProject');
     }
     else
     {
        res.render('SignIn');
     }
    });
    
})

router.get('/Admin/ApproveProject', function(req, res) {
    var db=req.db;
    var collect = db.get('project');
    if(req.query.sourcepg=='approv')
    {
        console.log(req.query.proj_id);

        collect.update(
                { "proj_id" : parseInt(req.query.proj_id) },
                { $set: { "approved" : true } },
                { upsert: true });

        res.redirect('/Admin/ApproveProject');
    }
    else
    {
         collect.find({approved: false},function(err,result){
         res.render('Admin/ApproveProject/ApproveProject',{projs:result});
    });
    }
});

router.get('/Admin/ApplicationFeedback', function(req, res) {
    res.render('Admin/ViewFeedback/ApplicationFeedback');
})
router.get('/Admin/ClientFeedback', function(req, res) {
    res.render('Admin/ViewFeedback/ClientFeedback');
})
router.get('/Admin/TesterFeedback', function(req, res) {
    res.render('Admin/ViewFeedback/TesterFeedback');
})
router.get('/Admin/AddAdmin', function(req, res) {
    res.render('Admin/AddAdmin/AddAdmin');
})
router.get('/Admin/ViewMember', function(req, res) {
    res.render('Admin/ViewMember/ViewMember');
})
router.get('/Admin/AddCoupan', function(req, res) {
    res.render('Admin/AddCoupan/AddCoupan');
})
router.get('/Admin/CreateClient', function(req, res) {
    res.render('Admin/CreateMulti/CreateClient');
})
router.get('/Admin/CreateTester', function(req, res) {
    res.render('Admin/CreateMulti/CreateTester');
})
router.get('/Admin/ConfirmMulti', function(req, res) {
    res.render('Admin/CreateMulti/ConfirmMulti');
})
router.get('/Admin/ManageUser', function(req, res) {
    res.render('Admin/ManageUser/BlockUnblockUser');
})

router.get('/TestMania', function(req, res) {
         res.render('SignIn');
})

module.exports = router;

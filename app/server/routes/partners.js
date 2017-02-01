var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_customer(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Partner deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Partner not found")});
          }
        });
      }
      DB.partners.find({}).sort( { brand: 1 } ).toArray(function(e, result) {
        var conta = 0;
        if (result.length) {
          console.log("trovati");
          res.render('partners_all', { title: __("Partners"), result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true });
        } else {
          helpers.getPartners(function(result){
            //console.log(result);
            DB.insert_partner(result,function() {
              res.render('partners_all', { title: __("Partners"), result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true });
            });
          });
        }

      });
      /*
       DB.partners.find({}).sort( { name: 1 } ).toArray(function(e, result) {
       res.render('partners', {  locals: { title: __("Partners"), result : result, msg: msg, udata : req.session.user } });
       });
       */
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.getProject = function getProject(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_customer(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Partner deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Partner not found")});
          }
        });
      }
      DB.partners.find({"partnerships.name": req.params.project}).sort( { brand: 1 } ).toArray(function(e, result) {
        res.render('partners', { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true  });
      });
      /*
       DB.partners.find({}).sort( { name: 1 } ).toArray(function(e, result) {
       res.render('partners', {  locals: { title: __("Partners"), result : result, msg: msg, udata : req.session.user } });
       });
       */
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

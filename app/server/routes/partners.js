var ObjectID = require('mongodb').ObjectID;
var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');
/*
exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_partner(req.query.id, function(err, obj){
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
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
*/
exports.getProject = function getProject(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_partner(req.query.id, function(err, obj){
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
        var sez = req.url.split(req.params.project)[1].split("/").join("");
        console.log(sez);
        res.render('partners'+(sez ? "_"+sez : ""), { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true  });
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

exports.setPartner = function setPartner(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      helpers.validateFormPartner(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            console.log(e);
            res.render('partners_new', { title: __("Partner"), project:req.params.project, result : o, msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
          }
        } else {
          if (req.body.id) {
            var id = req.body.id;
            DB.update_partner(o, function(o){
              var e = [];
              if (!o) e.push({name:"", m:__("Error updating partner")});
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  o._id = o.id;
                  res.render('partners_new', { title: __("Partner"), project:req.params.project, result : o, msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
                }
              } else {
                e.push({m:__("Partner saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e}});
                } else {
                  DB.partners.findOne({_id:new ObjectID(id)},function(err, result) {
                    res.render('partners_new', { title: __("Partner"), project:req.params.project, result : result, msg: {c:e}, udata : req.session.user, js:'/js/partners.js' });
                  });
                }
              }
            });
          } else {
            DB.insert_partner(req.body, function(e, o){
              e = [];
              if (!o){
                e.push({name:"",m:__("Error updating partner")});
              }
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  res.render('partners_new', { title: __("Partner"), project:req.params.project, result : o[0], msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
                }
              } else {
                console.log(o);
                e.push({name:"",m:__("Partner saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e,redirect:"/" + global.settings.dbName + "/partners/partner/"+o._id+"/edit/"}});
                } else {
                  res.redirect("/" + global.settings.dbName + "/partners/partner/"+o._id+"/edit/")
                  /*
                   DB.actions.findOne({_id:o._id},function(err, result) {
                   res.render('partners_actions_new', { title: __("Partner"), project:req.params.project, result : result, msg: {c:e}, udata : req.session.user, js:'/js/partners.js' });
                   });
                   */
                }
              }
            });
          }
        }
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.getPartners = function getPartners(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_partner(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Partner deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Partner not found")});
          }
        });
      }
      if (req.params.partner == "new") {
        res.render('partners_new', { title: __("Partners"), project:req.params.project, result : {}, msg: msg, udata : req.session.user, js:'/js/partners.js' });
      } else {
        var query = {};
        if (req.params.project) query["partnerships.name"] = req.params.project;
        if (req.params.partner) {
          query._id = new ObjectID(req.params.partner);
          console.log(query);
          DB.partners.findOne(query, function(e, result) {
            var pug = req.url.split(req.params.partner)[1].split("/").join("") == "edit" ?  "partners_new" : "partners_dett";
            res.render(pug, { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js'  });
          });
        } else {
          DB.partners.find(query).sort({brand: 1}).toArray(function (e, result) {
            var sez = "";
            if (req.params.project) sez = req.url.split(req.params.project)[1].split("/").join("");
            console.log(sez);
            res.render('partners'+(sez ? "_"+sez : ""), { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true  });
          });
        }
      }

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

exports.getActions = function getActions(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_action(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Partner deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Partner not found")});
          }
        });
      }
      if (req.params.action == "new") {
        res.render('partners_actions_new', { title: __("Partners"), project:req.params.project, result : {}, msg: msg, udata : req.session.user, js:'/js/partners.js' });
      } else {
        var query = {"project": req.params.project};
        if (req.params.action) {
          query._id = new ObjectID(req.params.action);
          DB.actions.findOne(query, function(e, result) {
            console.log(result);
            var pug = req.url.split(req.params.action)[1].split("/").join("") == "edit" ?  "partners_actions_new" : "partners_actions_dett";
            res.render(pug, { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:true  });
          });
        } else {
          DB.actions.find(query).sort( { date: 1 } ).toArray(function(e, result) {
            res.render('partners_actions', { title: __("Partners"), project:req.params.project, result : result, msg: msg, udata : req.session.user, js:'/js/partners.js', bootstraptable:false  });
          });
        }
      }
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

exports.setAction = function setAction(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      helpers.validateFormAction(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            console.log(e);
            res.render('partners_actions_new', { title: __("Action"), project:req.params.project, result : o, msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
          }
        } else {
          if (req.body.id) {
            var id = req.body.id;
            DB.update_action(o, function(o){
              var e = [];
              if (!o) e.push({name:"", m:__("Error updating action")});
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  o._id = o.id;
                  res.render('partners_actions_new', { title: __("Action"), project:req.params.project, result : o, msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
                }
              } else {
                e.push({m:__("Action saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e}});
                } else {
                  DB.actions.findOne({_id:new ObjectID(id)},function(err, result) {
                    res.render('partners_actions_new', { title: __("Action"), project:req.params.project, result : result, msg: {c:e}, udata : req.session.user, js:'/js/partners.js' });
                  });
                }
              }
            });
          } else {
            DB.insert_action(req.body, function(e, o){
              e = [];
              if (!o){
                e.push({name:"",m:__("Error updating action")});
              }
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  res.render('partners_actions_new', { title: __("Action"), project:req.params.project, result : o[0], msg: {e:e}, udata : req.session.user, js:'/js/partners.js' });
                }
              } else {
                console.log(o);
                e.push({name:"",m:__("Action saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e,redirect:"/"+global.settings.dbName+"/actions/"+o._id+"/edit/"}});
                } else {
                  res.redirect("/" + global.settings.dbName + "/partners/"+req.params.project+"/actions/"+o._id+"/edit/")
                  /*
                  DB.actions.findOne({_id:o._id},function(err, result) {
                    res.render('partners_actions_new', { title: __("Action"), project:req.params.project, result : result, msg: {c:e}, udata : req.session.user, js:'/js/partners.js' });
                  });
                  */
                }
              }
            });
          }
        }
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};


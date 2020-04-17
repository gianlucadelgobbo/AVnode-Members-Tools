var ObjectID = require('mongodb').ObjectID;
var DB = require('../../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('../../helpers/helpers');
var fs = require("fs");

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.offers.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          if (result) {
            if (req.query.api==1) {
              res.send(result);
            } else {
              result = helpers.formatMoney(result);
              res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user });
            }
          } else {
            res.render('404', { title: "Page Not Found", udata : req.session.user});
          }
        });
      } else {
        var dd = new Date();
        var start = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1));
        var end = new Date(Date.UTC(dd.getUTCFullYear(), 12, 31));

        DB.offers.find({doc_date:{$gte: start, $lt: end}},{doc_date:1,doc_number:1}).sort({doc_number:1}).toArray(function(e, resultOffer) {
          if (req.query.dup) {
            DB.offers.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
              result = helpers.formatMoney(result);
              result.doc_date = new Date();
              result.doc_number = resultOffer.length+1;
              delete result._id;
              res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else {
            var resultEmpty = {doc_date:new Date(),doc_number:resultOffer.length+1,vat_perc:_config.vat_perc,doc_to:{address:{}},offer:{},items:[{}]};
            res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : resultEmpty, udata : req.session.user });
          }
        });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.post = function post(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var errors = [];
      errors = errors.concat(Validators.checkCustomerID(req.body.doc_to._id));
      errors = errors.concat(Validators.checkOfferNumber(req.body.doc_number));
      errors = errors.concat(Validators.checkOfferDate(req.body.doc_date));
      var d = req.body.doc_date.split("/");
      if(errors.length === 0){
        DB.customers.findOne({_id:new ObjectID(req.body.doc_to._id)},function(e, result) {
        if (result) {
          d = req.body.doc_date.split("/");
          var date=new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
          var q = {doc_date:{$gt: date},doc_number:(req.body.doc_number-1).toString() };
          DB.offers.find(q).toArray(function(e, result) {
          if(errors.length === 0){
            //var myid = req.body.id;
            if (req.body.id) {
            DB.update_offer(req.body, req.session.user, function(e, o){
              errors.push({name:"",m:__("Offer saved with success")});
              res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user });
            });
            } else {
            DB.insert_offer(req.body, req.session.user, function(e,o){
              var msg = {};
              if (e){
              msg.e = [];
              msg.e.push({name:"",m:__("Error updating offer")});
              } else {
              msg.c = [];
              msg.c.push({name:"",m:__("Offer saved with success")});
              }
              res.redirect('/'+global.settings.dbName+'/accounting/offer/?id='+o._id);
              //res.render('offer', {  title: __("Offer"), result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user });
            });
            }
          } else {
            if (req.body.id) req.body._id = req.body.id;
            errors.push({name:"doc_date",m:__("Data must be greater than")+": "+result.doc_date});
            d = req.body.doc_date.split("/");
            req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            if (req.body.delivery_date) {
            d = req.body.delivery_date.split("/");
            req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            }
            if (req.body.doc_date) {
            d = req.body.doc_date.split("/");
            req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            }
            req.body.doc_to.address={};
            res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
          }
          });
        } else {
          if (req.body.id) req.body._id = req.body.id;
          errors.push({name:"doc_to[name]",m:__("You have to insert a valid customer")});
          d = req.body.doc_date.split("/");
          req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
          if (req.body.delivery_date) {
          d = req.body.delivery_date.split("/");
          req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
          }
          if (req.body.doc_date) {
          d = req.body.doc_date.split("/");
          req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
          }
          req.body.doc_to.address={};
          res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
        }
        });
      } else {
        if (req.body.id) req.body._id = req.body.id;
        errors.push({name:"doc_to[name]",m:__("You have to insert a valid customer")});
        d = req.body.doc_date.split("/");
        req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        if (req.body.delivery_date) {
        d = req.body.delivery_date.split("/");
        req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        }
        if (typeof req.body.invoice!== "undefined" && req.body.invoice.doc_date) {
        d = req.body.invoice.doc_date.split("/");
        req.body.invoice.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        }
        req.body.doc_to.address={};
        res.render('offer', {  title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.print = function print(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.offers.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          result = helpers.formatMoney(result);
          var folder = '/accounts/'+global.settings.dbName+'/offers/'+result.doc_date.getUTCFullYear()+'/';
          var filename = result.doc_date.getUTCFullYear()+'-'+(result.doc_date.getUTCMonth()+1)+'-'+result.doc_date.getUTCDate()+'_'+result.doc_number+'_'+global.settings.companyName+'_'+result.doc_to.name+'.pdf';
          //fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
          DB.customers.findOne({_id:new ObjectID(result.doc_to._id)},function(e, doc_to) {
            if (!doc_to.contacts) doc_to.contacts = [];
            res.render('accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
              res.render('offer_preview', {  title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:"/js/sendemail.js", doc_to:doc_to}, function (error1, html1) {
                // PDF START
                var pdf = require('html-pdf');
                var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
                res.render('offer_pdf', { layout: 'layout_pdf.pug' ,  title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user, style:style }, function (error, html) {
                  if (!error) {
                    pdf.create(html, options).toFile('./warehouse'+folder+filename, function(pdferr, pdfres) {
                      res.status(200).send(html1);
                    });
                  }
                });
                // PDF END
              });
            });
          });
        });
      } else {
        res.redirect('/'+global.settings.dbName+'/accounting/offers');
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

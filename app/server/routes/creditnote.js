var DB = require('./../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./../helpers/helpers');
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.creditnotes.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          if (result) {
            if (req.query.api==1) {
              res.send(result);
            } else {
              result = helpers.formatMoney(result);
              res.render('creditnote', { title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user });
            }
          } else {
            res.render('404', { title: "Page Not Found", udata : req.session.user});
          }
        });
      } else {
        var dd = new Date();
        var start = new Date(dd.getUTCFullYear()+"-01-01");
        var end = new Date(dd.getUTCFullYear()+"-12-31");

        DB.creditnotes.find({creditnote_date:{$gte: start, $lt: end}},{creditnote_date:1,creditnote_number:1}).sort({creditnote_number:1}).toArray(function(e, resultCreditNote) {
          if (req.query.invoice) {
            DB.invoices.findOne({_id:new ObjectID(req.query.invoice)},function(e, result) {
              result = helpers.formatMoney(result);
              result.creditnote_date = new Date();
              result.creditnote_number = resultCreditNote.length+1;
              result.invoice = {invoice_number:result.invoice_number,invoice_date:result.invoice_date};
              delete result._id;
              res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else if (req.query.dup) {
            DB.creditnotes.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
              result = helpers.formatMoney(result);
              result.creditnote_date = new Date();
              result.creditnote_number = resultCreditNote.length+1;
              delete result._id;
              res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else {
            var resultEmpty = {creditnote_date:new Date(),creditnote_number:resultCreditNote.length+1,vat_perc:_config.vat_perc,to_client:{address:{}},invoice:{},items:[{}]};
            res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : resultEmpty, udata : req.session.user });
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
      errors = errors.concat(Validators.checkCustomerID(req.body.to_client._id));
      errors = errors.concat(Validators.checkCreditNoteNumber(req.body.creditnote_number));
      errors = errors.concat(Validators.checkCreditNoteDate(req.body.creditnote_date));
      errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
      var d = req.body.creditnote_date.split("/");
      if (errors.length === 0){
        DB.customers.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
          var d;
          if (result) {
            d = req.body.creditnote_date.split("/");
            var date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            var q = {creditnote_date:{$gt: date},creditnote_number:(req.body.creditnote_number-1).toString() };
            DB.creditnotes.find(q).toArray(function(e, result) {
              if(errors.length === 0){
                if (req.body.id) {
                  DB.update_creditnote(req.body, req.session.user, function(e, o){
                    errors.push({name:"",m:__("CreditNote saved with success")});
                    res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user });
                  });
                } else {
                  DB.insert_creditnote(req.body, req.session.user, function(e, o){
                    var msg = {};
                    if (e){
                      msg.e = [];
                      msg.e.push({name:"",m:__("Error updating creditnote")});
                    } else {
                      msg.c = [];
                      msg.c.push({name:"",m:__("CreditNote saved with success")});
                    }
                    res.redirect('/'+global.settings.dbName+'/accounting/creditnote/?id='+o._id.toString());
//                  res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user });
                  });
                }
              } else {
                if (req.body.id) req.body._id = req.body.id;
                errors.push({name:"creditnote_date",m:__("Data must be greater than")+": "+result.creditnote_date});
                var d = req.body.invoice_date.split("/");
                req.body.creditnote_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                if (req.body.delivery_date) {
                  d = req.body.delivery_date.split("/");
                  req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                }
                if (req.body.invoice.invoice_date) {
                  d = req.body.invoice.invoice_date.split("/");
                  req.body.invoice.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                }
                req.body.to_client.address={};
                res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
              }
            });
          } else {
            if (req.body.id) req.body._id = req.body.id;
            errors.push({name:"to_client[name]",m:__("You have to insert a valid customer")});
            d = req.body.invoice_date.split("/");
            req.body.creditnote_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            if (req.body.delivery_date) {
              d = req.body.delivery_date.split("/");
              req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            }
            if (req.body.invoice.invoice_date) {
              d = req.body.invoice.invoice_date.split("/");
              req.body.invoice.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            }
            req.body.to_client.address={};
            res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
          }
        });
      } else {
        if (req.body.id) req.body._id = req.body.id;
        req.body.creditnote_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        if (req.body.delivery_date) {
          d = req.body.delivery_date.split("/");
          req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        }
        if (req.body.invoice.invoice_date) {
          d = req.body.invoice.invoice_date.split("/");
          req.body.invoice.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        }
        req.body.to_client.address={};
        res.render('creditnote', {  title: __("Credit Note"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
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
        DB.creditnotes.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          result = helpers.formatMoney(result);
          var folder = '/accounts/'+global.settings.dbName+'/creditnotes/'+result.creditnote_date.getUTCFullYear()+'/';
          var filename = result.creditnote_date.getUTCFullYear()+'-'+(result.creditnote_date.getUTCMonth()+1)+'-'+result.creditnote_date.getUTCDate()+'_'+result.creditnote_number+'_'+global.settings.companyName+'_'+result.to_client.name+'.pdf';
          //fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
          DB.customers.findOne({_id:new ObjectID(result.to_client._id)},function(e, to_client) {
            if (!to_client.contacts) to_client.contacts = [];
            res.render('accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
              res.render('creditnote_preview', {  title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:"/js/sendemail.js", to_client:to_client}, function (error1, html1) {
                // PDF START
                var pdf = require('html-pdf');
                var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
                res.render('creditnote_pdf', { layout: 'layout_pdf.pug' ,  title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user, style:style }, function (error, html) {
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
        res.redirect('/'+global.settings.dbName+'/accounting/creditnotes');
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.xml = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      DB.creditnotes.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
        result = helpers.formatMoney(result);
        res.set('Content-Type', 'text/xml');
        res.render('creditnote_xml', { title: __("Credit Note"), country:global._config.company.country, result : result, udata : req.session.user });
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

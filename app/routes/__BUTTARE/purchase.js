var DB = require('../../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('../../helpers/helpers');
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");

var types = ["GEN", "LPM", "LCF", "FNT", "WEB", "PRD", "OTR"];
var years = [new Date(new Date().getTime()-(365*24*60*60*1000)).getUTCFullYear(), new Date().getUTCFullYear(), new Date(new Date().getTime()+(365*24*60*60*1000)).getUTCFullYear()];

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.purchases.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          if (result) {
            if (req.query.api==1) {
              res.send(result);
            } else {
              result = helpers.formatMoney(result);
              res.render('purchase', { title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            }
          } else {
            res.render('404', { title: "Page Not Found", udata : req.session.user});
          }
        });
      } else {
        var dd = new Date();
        var start = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1));
        var end = new Date(Date.UTC(dd.getUTCFullYear(), 12, 31));

        DB.purchases.find({doc_date:{$gte: start, $lt: end}},{doc_date:1,doc_number:1}).sort({doc_number:1}).toArray(function(e, resultPurchase) {
          if (req.query.offer) {
            DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
              result = helpers.formatMoney(result);
              result.doc_date = new Date();
              result.doc_number = resultPurchase.length+1;
              result.offer = {doc_number:result.doc_number,doc_date:result.doc_date};
              delete result._id;
              res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else if (req.query.dup) {
            DB.purchases.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
              result = helpers.formatMoney(result);
              result.doc_date = new Date();
              result.doc_number = resultPurchase.length+1;
              delete result._id;
              res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else {
            var resultEmpty = {doc_date:new Date(),doc_number:resultPurchase.length+1,vat_perc:_config.vat_perc,doc_from:{address:{}},offer:{},items:[{}]};
            res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : resultEmpty, udata : req.session.user });
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
      errors = errors.concat(Validators.checkCustomerID(req.body.doc_from._id));
      errors = errors.concat(Validators.checkPurchaseNumber(req.body.doc_number));
      errors = errors.concat(Validators.checkPurchaseDate(req.body.doc_date));
      errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
      var d = req.body.doc_date.split("/");
      if (errors.length === 0){
        DB.customers.findOne({_id:new ObjectID(req.body.doc_from._id)},function(e, result) {
          var d;
          if (result) {
            d = req.body.doc_date.split("/");
            var date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            var q = {doc_date:{$gt: date},doc_number:(req.body.doc_number-1).toString() };
            DB.purchases.find(q).toArray(function(e, result) {
              if(errors.length === 0){
                if (req.body.id) {
                  DB.update_purchase(req.body, req.session.user, function(e, o){
                    errors.push({name:"",m:__("Purchase saved with success")});
                    res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user });
                  });
                } else {
                  DB.insert_purchase(req.body, req.session.user, function(e, o){
                    var msg = {};
                    if (e){
                      msg.e = [];
                      msg.e.push({name:"",m:__("Error updating purchase")});
                    } else {
                      msg.c = [];
                      msg.c.push({name:"",m:__("Purchase saved with success")});
                    }
                    res.redirect('/'+global.settings.dbName+'/accounting/purchase/?id='+o._id.toString());
//                  res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user });
                  });
                }
              } else {
                if (req.body.id) req.body._id = req.body.id;
                errors.push({name:"doc_date",m:__("Data must be greater than")+": "+result.doc_date});
                var d = req.body.doc_date.split("/");
                req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
                if (req.body.delivery_date) {
                  d = req.body.delivery_date.split("/");
                  req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
                }
                if (req.body.offer.doc_date) {
                  d = req.body.offer.doc_date.split("/");
                  req.body.offer.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
                }
                req.body.doc_from.address={};
                res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
              }
            });
          } else {
            if (req.body.id) req.body._id = req.body.id;
            errors.push({name:"doc_from[name]",m:__("You have to insert a valid customer")});
            d = req.body.doc_date.split("/");
            req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            if (req.body.delivery_date) {
              d = req.body.delivery_date.split("/");
              req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            }
            if (req.body.offer.doc_date) {
              d = req.body.offer.doc_date.split("/");
              req.body.offer.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            }
            req.body.doc_from.address={};
            res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
          }
        });
      } else {
        if (req.body.id) req.body._id = req.body.id;
        req.body.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        if (req.body.delivery_date) {
          d = req.body.delivery_date.split("/");
          req.body.delivery_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        }
        if (req.body.offer.doc_date) {
          d = req.body.offer.doc_date.split("/");
          req.body.offer.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
        }
        req.body.doc_from.address={};
        res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
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
        DB.purchases.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
          if (result) {
            if (req.query.api==1) {
              res.send(result);
            } else {
              global._config.ModalitaPagamento = {
                "MP01": "contanti",
                "MP02": "assegno",
                "MP03": "assegno circolare",
                "MP04": "contanti presso Tesoreria",
                "MP05": "bonifico",
                "MP06": "vaglia cambiario",
                "MP07": "bollettino bancario",
                "MP08": "carta di pagamento",
                "MP09": "RID",
                "MP10": "RID utenze",
                "MP11": "RID veloce",
                "MP12": "RIBA",
                "MP13": "MAV",
                "MP14": "quietanza erario",
                "MP15": "giroconto su conti di contabilità speciale",
                "MP16": "domiciliazione bancaria",
                "MP17": "domiciliazione postale",
                "MP18": "bollettino di c/c postale",
                "MP19": "SEPA Direct Debit",
                "MP20": "SEPA Direct Debit CORE",
                "MP21": "SEPA Direct Debit B2B",
                "MP22": "Trattenuta su somme già riscosse",
                "MP23": "PagoPA"
              };
              global._config.CondizioniPagamento = {
                "TP01": "pagamento a rate",
                "TP02": "pagamento completo",
                "TP03": "anticipo"
              };
              result = helpers.formatMoney(result);
              var folder = '/accounts/'+global.settings.dbName+'/purchases/'+result.doc_date.getUTCFullYear()+'/';
              var filename = result.doc_date.getUTCFullYear()+'-'+(result.doc_date.getUTCMonth()+1)+'-'+result.doc_date.getUTCDate()+'_'+result.doc_number+'_'+global.settings.companyName+'_'+result.doc_from.name+'.pdf';
              //fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
              DB.customers.findOne({_id:new ObjectID(result.doc_from._id)},function(e, doc_from) {
                if (!doc_from.contacts) doc_from.contacts = [];
                res.render('accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
                  res.render('purchase_preview', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:"/js/sendemail.js", doc_from:doc_from}, function (error1, html1) {
                    console.log(error1);
                    // PDF START
                    var pdf = require('html-pdf');
                    var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
                    res.render('purchase_pdf', { layout: 'layout_pdf.pug' ,  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user, style:style }, function (error, html) {
                      console.log(error);
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
            }
          } else {
            res.render('404', { title: "Page Not Found", udata : req.session.user});
          }
        });
      } else {
        res.redirect('/'+global.settings.dbName+'/accounting/purchases');
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.xml = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      DB.purchases.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
        result = helpers.formatMoney(result);
        res.set('Content-Type', 'text/xml');
        res.render('purchase_xml', { title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};


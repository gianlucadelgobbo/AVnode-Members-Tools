var DB = require('./../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./../helpers/helpers');
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");

var types = ["GEN", "LPM", "LCF", "FNT", "WEB", "PRD", "OTR"];
var years = [new Date(new Date().getTime()-(365*24*60*60*1000)).getFullYear(), new Date().getFullYear(), new Date(new Date().getTime()+(365*24*60*60*1000)).getFullYear()];

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
        var start = new Date(dd.getFullYear()+"-01-01");
        var end = new Date(dd.getFullYear()+"-12-31");

        DB.purchases.find({purchase_date:{$gte: start, $lt: end}},{purchase_date:1,purchase_number:1}).sort({purchase_number:1}).toArray(function(e, resultPurchase) {
          if (req.query.offer) {
            DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
              result = helpers.formatMoney(result);
              result.purchase_date = new Date();
              result.purchase_number = resultPurchase.length+1;
              result.offer = {offer_number:result.offer_number,offer_date:result.offer_date};
              delete result._id;
              res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else if (req.query.dup) {
            DB.purchases.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
              result = helpers.formatMoney(result);
              result.purchase_date = new Date();
              result.purchase_number = resultPurchase.length+1;
              delete result._id;
              res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else {
            var resultEmpty = {purchase_date:new Date(),purchase_number:resultPurchase.length+1,vat_perc:_config.vat_perc,from_customer:{address:{}},offer:{},items:[{}]};
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
      errors = errors.concat(Validators.checkCustomerID(req.body.from_customer._id));
      errors = errors.concat(Validators.checkPurchaseNumber(req.body.purchase_number));
      errors = errors.concat(Validators.checkPurchaseDate(req.body.purchase_date));
      errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
      var d = req.body.purchase_date.split("/");
      if (errors.length === 0){
        DB.customers.findOne({_id:new ObjectID(req.body.from_customer._id)},function(e, result) {
          var d;
          if (result) {
            d = req.body.purchase_date.split("/");
            var date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            var q = {purchase_date:{$gt: date},purchase_number:(req.body.purchase_number-1).toString() };
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
                errors.push({name:"purchase_date",m:__("Data must be greater than")+": "+result.purchase_date});
                var d = req.body.offer_date.split("/");
                req.body.purchase_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                if (req.body.delivery_date) {
                  d = req.body.delivery_date.split("/");
                  req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                }
                if (req.body.offer.offer_date) {
                  d = req.body.offer.offer_date.split("/");
                  req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
                }
                req.body.from_customer.address={};
                res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
              }
            });
          } else {
            if (req.body.id) req.body._id = req.body.id;
            errors.push({name:"from_customer[name]",m:__("You have to insert a valid customer")});
            d = req.body.offer_date.split("/");
            req.body.purchase_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            if (req.body.delivery_date) {
              d = req.body.delivery_date.split("/");
              req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            }
            if (req.body.offer.offer_date) {
              d = req.body.offer.offer_date.split("/");
              req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
            }
            req.body.from_customer.address={};
            res.render('purchase', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
          }
        });
      } else {
        if (req.body.id) req.body._id = req.body.id;
        req.body.purchase_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        if (req.body.delivery_date) {
          d = req.body.delivery_date.split("/");
          req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        }
        if (req.body.offer.offer_date) {
          d = req.body.offer.offer_date.split("/");
          req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
        }
        req.body.from_customer.address={};
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
              var folder = '/accounts/'+global.settings.dbName+'/purchases/'+result.purchase_date.getFullYear()+'/';
              var filename = result.purchase_date.getFullYear()+'-'+(result.purchase_date.getMonth()+1)+'-'+result.purchase_date.getDate()+'_'+result.purchase_number+'_'+global.settings.companyName+'_'+result.from_customer.name+'.pdf';
              //fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
              DB.customers.findOne({_id:new ObjectID(result.from_customer._id)},function(e, from_customer) {
                if (!from_customer.contacts) from_customer.contacts = [];
                res.render('accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
                  res.render('purchase_preview', {  title: __("Purchase"), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:"/js/sendemail.js", from_customer:from_customer}, function (error1, html1) {
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


var DB = require('./../helpers/db-manager');
var Validators = require('../common/validators').Validators;
var helpers = require('./../helpers/helpers');
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
const config = require('getconfig');
var CT = require('../helpers/country-list');


var types = ["GEN", "LPM", "LCF", "FNT", "WEB", "PRD", "OTR"];
var years = [new Date(new Date().getTime()-(365*24*60*60*1000)).getUTCFullYear(), new Date().getUTCFullYear(), new Date(new Date().getTime()+(365*24*60*60*1000)).getUTCFullYear()];

exports.getList = (req, res, msg={}) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.params.sez && config[req.params.sez] && config[req.params.sez].coll && DB[config[req.params.sez].coll]) {
        var year;
        var query = req.query.customer ? (req.params.sez=="purchases" ? {"doc_from._id":req.query.customer} : {"doc_to._id":req.query.customer}) : {};
        if (!req.query.year) req.query.year = new Date().getUTCFullYear();
        if (req.query.year && req.query.year!="ALL Years") {
          year = parseInt(req.query.year);
          var start = new Date(Date.UTC(year, 0, 1));
          var end = new Date(Date.UTC(year+1, 0, 1));
          query.doc_date = {$gte: start, $lt: end}
        } else {
          year = req.query.year;
        }
  
        DB[config[req.params.sez].coll].find({},{doc_date: 1}).toArray(function(e, result) {
          var years = [new Date().getUTCFullYear()];
          for (var a=0;a<result.length;a++) {
            var y = new Date(result[a].doc_date).getUTCFullYear();
            if (years.indexOf(y) == -1) years.push(y);
          }
          years.sort();
          console.log(query)
          if (req.query.customer){
            DB.customers.findOne({_id:new ObjectID(req.query.customer)}, function(e, customer) {
              DB[config[req.params.sez].coll].find(query).sort({doc_date:-1,doc_number:-1}).toArray(function(e, result) {
                res.render(config[req.params.sez].puglist, { title: __(config[req.params.sez].title_list), sez: req.params.sez, basepath: config[req.params.sez].folder, accounting: require('accounting'), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years, types:types,year:year,customer:{id:req.query.customer,name:customer.name }});
              });
            });
          } else {
            DB[config[req.params.sez].coll].find(query).sort({doc_date:-1,doc_number:-1}).toArray(function(e, result) {
                //res.send(result);
              res.render(config[req.params.sez].puglist, { title: __(config[req.params.sez].title_list), sez: req.params.sez, basepath: config[req.params.sez].folder, accounting: require('accounting'), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years, types:types,year:year });
            });
          }
        });
      } else {
        res.status(404).render('404', { title: "Page Not Found", udata : req.session.user});
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.delete = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.params.sez && config[req.params.sez] && config[req.params.sez].coll && DB[config[req.params.sez].coll]) {
        var msg = {};
        var year;
        if (req.params.id) {
          DB.delete_doc(config[req.params.sez].coll, req.params.id, function(err, obj){
            if (obj){
              msg.c = [];
              msg.c.push({name:"",m:__(config[req.params.sez].title_single)+" "+__("deleted successfully")});
            } else {
              msg.e = [];
              msg.e.push({name:"",m:__(config[req.params.sez].title_single)+" "+__("not found")});
            }
            exports.getList(req, res, msg)
          });
        }
      } else {
        res.status(404).render('404', { title: "Page Not Found", udata : req.session.user});
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.getDett = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.params.id) {
        DB[config[req.params.sez].coll].findOne({_id:new ObjectID(req.params.id)},function(e, result) {
          if (result) {
            if (req.query.api==1) {
              res.send(result);
            } else {
              result = helpers.formatMoney(result);
              res.render(config[req.params.sez].pugdett, { title: __(config[req.params.sez].title_single), accounting: require('accounting'), country:global._config.company.country, result : result, msg:{}, udata : req.session.user,years:years, types:types});
            }
          } else {
            res.render('404', { title: "Page Not Found", udata : req.session.user});
          }
        });
      } else {
        var dd = new Date();
        var start = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1));
        var end = new Date(Date.UTC(dd.getUTCFullYear(), 12, 31));
        var query = {doc_date:{$gte: start, $lt: end}};
        console.log(global._config.company);
        DB[config[req.params.sez].coll].find({doc_date:{$gte: start, $lt: end}},{doc_date:1,doc_number:1}).sort({doc_number:1}).toArray(function(e, resultDoc) {
          if (req.query.offer) {
            DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
              result = helpers.formatMoney(result);
              result.offer = {doc_number:result.doc_number, doc_date:result.doc_date, offer_id:result._id};
              result.doc_date = new Date();
              result.doc_number = resultDoc.length+1;
              delete result._id;
              console.log("result.offer")
              console.log(result.offer)
              res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else if (req.query.dup) {
            DB[config[req.params.sez].coll].findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
              result = helpers.formatMoney(result);
              result.doc_date = new Date();
              result.doc_number = resultDoc.length+1;
              delete result._id;
              res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : result, udata : req.session.user });
            });
          } else {
            var resultEmpty = {doc_date:new Date(),doc_number:resultDoc.length+1,vat_perc:_config.vat_perc,doc_to:{address:{}},doc_from:{address:{}},offer:{},invoice:{},items:[{}]};
            res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : resultEmpty, udata : req.session.user });
          }
        });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.getPrint = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.params.id) {
        DB[config[req.params.sez].coll].findOne({_id:new ObjectID(req.params.id)},function(e, result) {
          result = helpers.formatMoney(result);
          var folder = '/accounts/'+global.settings.dbName+'/'+config[req.params.sez].folder+'/'+result.doc_date.getUTCFullYear()+'/';
          var filename = result.doc_date.getUTCFullYear()+'-'+(result.doc_date.getUTCMonth()+1)+'-'+result.doc_date.getUTCDate()+'_'+result.doc_number+'_'+global.settings.companyName+'_'+result.doc_to.name+'.pdf';
          //fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
          var id = req.params.sez == "purchases" ? result.doc_from._id : result.doc_to._id
          DB.customers.findOne({_id:new ObjectID(id)},function(e, customer) {
            if (!customer.contacts) customer.contacts = [];
            res.render('accounts/'+global.settings.dbName+"_style_print", {layout: false}, function (error_style, style) {
              res.render(config[req.params.sez].doc_preview, {  title: __(config[req.params.sez].title_single), country:global._config.company.country, result : result, udata : req.session.user , file:folder+filename, style:style, js:"/js/sendemail.js", customer:customer/* */}, function (error1, html1) {
                console.log("error_style");
                console.log(config[req.params.sez].doc_preview);
                  console.log(error1);
                // PDF START
                var pdf = require('html-pdf');
                var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
                res.render(config[req.params.sez].doc_pdf, { layout: 'layout_pdf.pug' ,  title: __(config[req.params.sez].title_single), country:global._config.company.country, result : result, udata : req.session.user, style:style }, function (error, html) {
                  console.log("error");
                  console.log('./warehouse'+folder+filename);
                  console.log(html);
                  if (!error) {
                    pdf.create(html, options).toFile('./warehouse'+folder+filename, function(pdferr, pdfres) {
                      console.log(pdferr);
                      console.log(pdfres);
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
        res.redirect('/'+global.settings.dbName+'/accounting/'+config[req.params.sez].folder);
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.getXML = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      DB[config[req.params.sez].coll].findOne({_id:new ObjectID(req.params.id)},function(e, result) {
        //result = helpers.formatMoney(result);
        res.set('Content-Type', 'text/xml');
        res.render(config[req.params.sez].doc_xml, { title: __(config[req.params.sez].title_single), country:global._config.company.country, result : result, udata : req.session.user });
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.post = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var errors = [];
      if (req.body.paid=="on") req.body.paid = "true";
      if (req.body.bank==0) delete req.body.bank;
      if (req.body.bank) req.body.bank = JSON.parse(req.body.bank);
      errors = errors.concat(Validators.checkCustomerID(req.body.doc_to._id));
      errors = errors.concat(Validators.checkDocNumber(req.body.doc_number));
      if (req.body.bank || req.body.payment_days) errors = errors.concat(Validators.checkPaymentDays(req.body.payment_days));
      errors = errors.concat(Validators.checkDocDate(req.body.doc_date));
      errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
      var d = req.body.doc_date.split("/");
      if (errors.length === 0){
        DB.customers.findOne({_id:new ObjectID(req.body.doc_to._id)},function(e, result) {
          var d;
          if (result) {
            d = req.body.doc_date.split("/");
            var date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            var q = {doc_date:{$gt: date},doc_number:(req.body.doc_number-1).toString() };
            DB[config[req.params.sez].coll].find(q).toArray(function(e, result) {
              if(errors.length === 0){
                if (req.body.id) {
                  DB.update_doc(config[req.params.sez].coll, req.body, req.session.user, function(e, o){
                    console.log("req.body.id");
                    console.log(o);
                    errors.push({name:"",m:__(config[req.params.sez].title_single)+" "+__("saved with success")});
                    res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user });
                  });
                } else {
                  DB.insert_doc(config[req.params.sez].coll, req.body, req.session.user, function(e, o){
                    var msg = {};
                    if (e){
                      msg.e = [];
                      msg.e.push({name:"",m:__("Error updating")+" "+__(config[req.params.sez].title_single)});
                    } else {
                      msg.c = [];
                      msg.c.push({name:"",m:__(config[req.params.sez].title_single)+" "+__("saved with success")});
                    }
                    res.redirect('/'+global.settings.dbName+'/accounting/'+config[req.params.sez].folder+'/'+o._id.toString()+'/');
//                  res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), country:global._config.company.country, result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user });
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
                req.body.doc_to.address={};
                res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
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
            if (req.body.offer.doc_date) {
              d = req.body.offer.doc_date.split("/");
              req.body.offer.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
            }
            req.body.doc_to.address={};
            res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
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
        req.body.doc_to.address={};
        res.render(config[req.params.sez].pugdett, {  title: __(config[req.params.sez].title_single), years: years, types: types, country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.setType = (req, res) => {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
			DB[req.body.req.col].updateOne({_id:ObjectID(req.body.req.id)}, {$set: req.body.set}, function(e, o){
				if (e) {
					res.status("400").send(e);
				} else {
					res.send(o);
				}
			});
    } else {
			res.status("400").send("Please login");
    }
  });
};

exports.my_import = function my_import(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      res.render('purchases_import', { title: __("Purchases import"), udata : req.session.user });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.my_import_act = function my_import_act(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
			var imports = JSON.parse(req.body.imports);
			var parseString = require('xml2js').parseString;
			var promises = [];
			for (var a = 0; a<imports.length; a++) {
				promises.push(new Promise((resolve, reject) => {
					parseString(imports[a].result, {explicitArray: false}, function (err, result) {
						var FatturaElettronica = result[Object.keys(result)[0]];
						// ? result["ns2:FatturaElettronica"] : result["p:FatturaElettronica"] ? result["p:FatturaElettronica"] : result["FatturaElettronica"];
						//console.log("FatturaElettronica");
						//console.log(JSON.stringify(result, null, 4));
						if (err) {
							setTimeout(reject, 500, err);
						} else {
							DB.customers.findOne({vat_number:FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.IdFiscaleIVA.IdCodice},function(e, from) {
								if (from && from._id) {
									setTimeout(resolve, 500, {from: from, FatturaElettronica:FatturaElettronica});
								} else {
									var customer = {
										"name" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione,
										"address" : {
											"street" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.Indirizzo,
											"zipcode" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.CAP,
											"city" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.Comune,
											"province" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.Provincia,
											"countrycode" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.Nazione,
											"country" : CT.filter((item) => {return item.short==FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.Sede.Nazione})[0].name
										},
										"vat_number" : FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.IdFiscaleIVA.IdCodice
									}
									//if (FatturaElettronica.FatturaElettronicaHeader.DatiTrasmissione.CodiceDestinatario) customer.unique_code = FatturaElettronica.FatturaElettronicaHeader.DatiTrasmissione.CodiceDestinatario;
									//if (FatturaElettronica.FatturaElettronicaHeader.DatiTrasmissione.PECDestinatario) customer.pec = FatturaElettronica.FatturaElettronicaHeader.DatiTrasmissione.PECDestinatario;
									if (FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.CodiceFiscale) customer.fiscal_code = FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.CodiceFiscale;
									DB.customers.insert(customer, {safe: true}, function(err, from) {
										setTimeout(resolve, 500, {from: from.ops[0], FatturaElettronica:FatturaElettronica});
									});
								}
							});
						}
					});
				}));
			}
			var new_purchases = []
			var wrong_purchases = []
			Promise.all(promises)
			.then(values => {
				var msg = {
					e: [],
					c: [],
				}
				//console.log("_config.company");
				//console.log(_config.company.vat_number);
				var promisesCustomers = [];
				for (var a = 0; a<values.length; a++) {
					//console.log(values[a].FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento);
					var CessionarioCommittente = values[a].FatturaElettronica.FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici;
					if ((CessionarioCommittente.IdFiscaleIVA && CessionarioCommittente.IdFiscaleIVA.IdCodice && _config.company.vat_number == CessionarioCommittente.IdFiscaleIVA.IdCodice)||(CessionarioCommittente.CodiceFiscale && _config.company.fiscal_code == CessionarioCommittente.CodiceFiscale)) {
						var new_purchase = {
							"doc_number" : values[a].FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero,
							"doc_date" : new Date(values[a].FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data),
							"doc_from" : values[a].from,
							"doc_to" : global._config.company,
							"type" : "GEN",
							"type_year" : new Date(values[a].FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data).getUTCFullYear(),
							/* "payment" : undefined,
							"destination" : undefined,
							"offer" : {
								"doc_number" : undefined,
								"doc_date" : undefined
							},
							"delivery_date" : undefined,
							"items" : [],
							"subtotal" : undefined,
							"vat_perc" : undefined,
							"vat_amount" : undefined,
							"shipping_costs" : undefined, */
							"total" : parseFloat(values[a].FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento),
							/* "bank" : undefined, */
							"import": imports[a]
						}
						//console.log(values[a].FatturaElettronica.FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo);
						if (values[a].FatturaElettronica.FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo){
							var DatiRiepilogo = values[a].FatturaElettronica.FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo;
							//console.log("DatiRiepilogo.length");
							//console.log(DatiRiepilogo.length);
							if (DatiRiepilogo.length>0){
								var vatA = [];
								for (var c = 0; c<DatiRiepilogo.length; c++) {
									//console.log("DatiRiepilogo "+c);
									//console.log(DatiRiepilogo[c]);
									if(DatiRiepilogo[c].AliquotaIVA) {
										if(vatA.indexOf(DatiRiepilogo[c].AliquotaIVA)===-1) vatA.push(DatiRiepilogo[c].AliquotaIVA);
										new_purchase.vat_perc+= DatiRiepilogo[c].AliquotaIVA+"/";
									}
									if(DatiRiepilogo[c].ImponibileImporto) {
										if(!new_purchase.subtotal) new_purchase.subtotal = 0;
										new_purchase.subtotal+= parseFloat(DatiRiepilogo[c].ImponibileImporto);
									}
									if(DatiRiepilogo[c].Imposta) {
										if(!new_purchase.vat_amount) new_purchase.vat_amount = 0;
										new_purchase.vat_amount+= parseFloat(DatiRiepilogo[c].Imposta);
									}
								}
	
								if (vatA.length>1) new_purchase.vat_perc = vatA.join("/");
								if (vatA.length==1) new_purchase.vat_perc = parseFloat(vatA[0]);
							} else {
								if(DatiRiepilogo.AliquotaIVA)
									new_purchase.vat_perc = parseFloat(DatiRiepilogo.AliquotaIVA);
								if (DatiRiepilogo.ImponibileImporto)
									new_purchase.subtotal = parseFloat(DatiRiepilogo.ImponibileImporto);
								if (DatiRiepilogo.Imposta)
									new_purchase.vat_amount = parseFloat(DatiRiepilogo.Imposta);
							}
						}

						var DettaglioLinee = values[a].FatturaElettronica.FatturaElettronicaBody.DatiBeniServizi.DettaglioLinee;
						new_purchase.items = [];
						if (DettaglioLinee.length) {
							for (var b = 0; b<DettaglioLinee.length; b++) {
								var purchase = {
									"quantity" : DettaglioLinee[b].Quantita ? parseFloat(DettaglioLinee[b].Quantita) : 1,
									"description" : DettaglioLinee[b].Descrizione,
									"price" : parseFloat(DettaglioLinee[b].PrezzoUnitario),
									"vat_perc" : parseFloat(DettaglioLinee[b].AliquotaIVA),
									"amount" : parseFloat(DettaglioLinee[b].PrezzoTotale)
								}
								if (DettaglioLinee[b].DataInizioPeriodo) purchase.DataInizioPeriodo = new Date(DettaglioLinee[b].DataInizioPeriodo);
								if (DettaglioLinee[b].DataFinePeriodo) purchase.DataFinePeriodo = new Date(DettaglioLinee[b].DataFinePeriodo);
								new_purchase.items.push(purchase);
							}
						} else {
							var purchase = {
								"quantity" : DettaglioLinee.Quantita ? parseFloat(DettaglioLinee.Quantita) : 1,
								"description" : DettaglioLinee.Descrizione,
								"price" : parseFloat(DettaglioLinee.PrezzoUnitario),
								"vat_perc" : parseFloat(DettaglioLinee.AliquotaIVA),
								"amount" : parseFloat(DettaglioLinee.PrezzoTotale)
							};
							if (DettaglioLinee.DataInizioPeriodo) purchase.DataInizioPeriodo = new Date(DettaglioLinee.DataInizioPeriodo);
							if (DettaglioLinee.DataFinePeriodo) purchase.DataFinePeriodo = new Date(DettaglioLinee.DataFinePeriodo);
							new_purchase.items.push(purchase);
						}
						if (values[a].FatturaElettronica.FatturaElettronicaBody.DatiPagamento) {
							new_purchase.DatiPagamento = values[a].FatturaElettronica.FatturaElettronicaBody.DatiPagamento
							if (new_purchase.DatiPagamento.DettaglioPagamento && new_purchase.DatiPagamento.DettaglioPagamento.ImportoPagamento) new_purchase.DatiPagamento.DettaglioPagamento.ImportoPagamento = parseFloat(new_purchase.DatiPagamento.DettaglioPagamento.ImportoPagamento);
							if (new_purchase.DatiPagamento.DettaglioPagamento && new_purchase.DatiPagamento.DettaglioPagamento.DataRiferimentoTerminiPagamento) new_purchase.DatiPagamento.DettaglioPagamento.DataRiferimentoTerminiPagamento = new Date (new_purchase.DatiPagamento.DettaglioPagamento.DataRiferimentoTerminiPagamento);
							if (new_purchase.DatiPagamento.DettaglioPagamento && new_purchase.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento) new_purchase.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento = new Date (new_purchase.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento);
						}
						new_purchase.revisions = [];
						new_purchase.revisions.push({userID : req.session.user._id,username: req.session.user.name,time : new Date()});
						new_purchases.push(new_purchase);
						msg.c.push({m: imports[a].filename + " "+ __("imported with success")});
					} else {
						msg.e.push({m: imports[a].filename + " "+ __("imported failed")});
						wrong_purchases.push(imports[a]);
					}
				}
				//console.log("imports");
				//console.log(imports);
				//console.log("new_purchases");
				//console.log(new_purchases);
				//console.log("wrong_purchases");
				//console.log(wrong_purchases); */
				//res.send(values)
				DB.purchases.insert(new_purchases, {safe: true}, function(err, records){
					res.render('purchases_import_result', { title: __("Purchases"), result : helpers.formatMoneyList(records.ops), msg:msg, udata : req.session.user });
				});
							
			})
			/* .catch(() => {
				//console.log("catchcatchcatchcatchcatchcatchcatchcatchcatchcatch");
			}) */;
      //res.render('purchases_import_results', { title: __("Purchases import"), udata : req.session.user });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

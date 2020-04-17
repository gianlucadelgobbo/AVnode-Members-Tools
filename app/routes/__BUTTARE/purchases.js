var ObjectID = require('mongodb').ObjectID;
var DB = require('../../helpers/db-manager');
var helpers = require('../../helpers/helpers');
var CT = require('../../helpers/country-list');

var types = ["GEN", "LPM", "LCF", "FNT", "WEB", "PRD", "OTR"];

exports.get = function get(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			var msg = {};
			var year;
			if (req.query.id && req.query.del) {
				DB.delete_purchase(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Purchase deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Purchase not found")});
					}
				});
			}
			var query = req.query.customer ? {"doc_to._id":req.query.customer} : {};
			if (!req.query.year) req.query.year = new Date().getUTCFullYear();
			if (req.query.year && req.query.year!="ALL Years") {
				year = parseInt(req.query.year);
				var start = new Date(Date.UTC(year, 0, 1));
				var end = new Date(Date.UTC(year+1, 0, 1));
				query.doc_date = {$gte: start, $lt: end}
			} else {
				year = req.query.year;
			}

			DB.purchases.find({},{doc_date: 1}).toArray(function(e, result) {
				var years = [new Date().getUTCFullYear()];
				for (var a=0;a<result.length;a++) {
					var y = new Date(result[a].doc_date).getUTCFullYear();
					if (years.indexOf(y) == -1) years.push(y);
				}
				years.sort();
				if (req.query.customer){
					DB.customers.findOne({_id:new ObjectID(req.query.customer)}, function(e, customer) {
						DB.purchases.find(query).sort({doc_date:-1,doc_number:-1}).toArray(function(e, result) {
							res.render('purchases', { title: __("Purchases"), accounting: require('accounting'), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years, types:types,year:year,customer:{id:req.query.customer,name:customer.name }});
						});
					});
				} else {
					DB.purchases.find(query).sort({doc_date:-1,doc_number:-1}).toArray(function(e, result) {
						res.render('purchases', { title: __("Purchases"), accounting: require('accounting'), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years, types:types,year:year });
					});
				}
			});
		} else {
			res.redirect('/?from='+req.url);
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
exports.post = function post(req, res) {
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


var ObjectID = require('mongodb').ObjectID;
var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			var msg = {};
			var year;
			if (req.query.id && req.query.del) {
				DB.delete_creditnote(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Credit Note deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Credit Note not found")});
					}
				});
			}
			var query = req.query.customer ? {"to_client._id":req.query.customer} : {};
			if (!req.query.year) req.query.year = new Date().getUTCFullYear();
			if (req.query.year && req.query.year!="ALL Years") {
				year = parseInt(req.query.year);
				var start = new Date(Date.UTC(year, 0, 1));
				var end = new Date(Date.UTC(year+1, 0, 1));
				query.creditnote_date = {$gte: start, $lt: end}
			} else {
				year = req.query.year;
			}

			DB.creditnotes.find().toArray(function(e, result) {
				var years = [new Date().getUTCFullYear()];
				for (var a=0;a<result.length;a++) {
					var y = new Date(result[a].creditnote_date).getUTCFullYear();
					if (years.indexOf(y) == -1) years.push(y);
				}
				years.sort();
				if (req.query.customer){
					DB.customers.findOne({_id:new ObjectID(req.query.customer)}, function(e, customer) {
						DB.creditnotes.find(query).sort({creditnote_date:-1,creditnote_number:-1}).toArray(function(e, result) {
							res.render('creditnotes', { title: __("Credit Notes"), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years,year:year,customer:{id:req.query.customer,name:customer.name }});
						});
					});
				} else {
					DB.creditnotes.find(query).sort({creditnote_date:-1,creditnote_number:-1}).toArray(function(e, result) {
						res.render('creditnotes', { title: __("Credit Notes"), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years,year:year });
					});
				}
			});
		} else {
			res.redirect('/?from='+req.url);
		}
	});
};
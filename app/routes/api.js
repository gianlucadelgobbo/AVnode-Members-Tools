var DB = require('../helpers/db-manager');
var helpers = require('../helpers/helpers');

exports.getCustomers = function getCustomers(req, res) {
  //console.log(req.session.user);
    if (req.session.user == null) {
      res.redirect('/?from='+req.url);
    } else {
      var query = {name:{$regex: req.query.term, $options: 'i' }};
      console.dir(query);
      DB.customers.find(query).toArray(function(e, result) {
        console.dir(result);
        res.status(200).send(result);
      });
    }

};

exports.getPayments = function getPayments(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {payment:{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.invoices.distinct("payment", query, function(e, result) {
      console.dir(result);
      res.status(200).send(result);
    });
  }
};

exports.getInvoices = function getInvoices(req, res) {
  var d = req.query.doc_date.split("/");
  req.query.doc_date = new Date(Date.UTC(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0])));
  var query = req.query.doc_date ? {doc_date: {$gt: req.query.doc_date}} : {};
  DB.invoices.find(query,{doc_number:1,doc_date:1,doc_to:1,description:1}).sort({doc_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getCreditnotes = function getCreditnotes(req, res) {
  DB.creditnotes.find({},{doc_number:1,doc_date:1,doc_to:1,description:1}).sort({doc_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getPurchases = function getPurchases(req, res) {
  DB.purchases.find({},{doc_number:1,doc_date:1,doc_to:1,description:1}).sort({doc_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getOffers = function getInvoices(req, res) {
  DB.offers.find({},{doc_number:1,doc_date:1,doc_to:1,description:1}).sort({doc_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getProducts = function getProducts(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {'items.description':{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.invoices.distinct('items.description', query, function(e, result) {
      console.dir(result);
      res.status(200).send(result);
    });
  }
};

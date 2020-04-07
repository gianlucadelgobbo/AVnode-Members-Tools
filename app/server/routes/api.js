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
  DB.invoices.find({},{invoice_number:1,invoice_date:1,to_client:1,description:1}).sort({invoice_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getCreditnotes = function getCreditnotes(req, res) {
  DB.creditnotes.find({},{creditnote_number:1,creditnote_date:1,to_client:1,description:1}).sort({creditnote_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getPurchases = function getPurchases(req, res) {
  DB.purchases.find({},{purchase_number:1,purchase_date:1,to_client:1,description:1}).sort({purchase_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.status(200).send({result:result});
  });
};

exports.getOffers = function getInvoices(req, res) {
  DB.offers.find({},{offer_number:1,offer_date:1,to_client:1,description:1}).sort({offer_number:-1}).toArray(function(e, result) {
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

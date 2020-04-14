db.purchases.find({doc_number:"264/B/2019"}).forEach(function(e) {
    printjson(e.doc_date);
  if (e.doc_date.getUTCHours()>0){
    e.doc_date = new Date(e.doc_date.getTime()+((24-e.doc_date.getUTCHours())*60*60*1000));
    //db.purchases.save(e);
  }
});
db.purchases.find({type:{$exists: false}, doc_date:{$gte: ISODate("2019-01-01T00:00:00.000Z"),$lt: ISODate("2021-01-01T00:00:00.000Z")}}).forEach(function(e) {
  e.type_year = e.doc_date.getUTCFullYear();
  e.type = "GEN";
  e.paid = "true";
  printjson(e.paid);
  db.purchases.save(e);
});

db.offers.find({}).forEach(function(e) {
  if (e.doc_date.getUTCHours()>0){
    e.doc_date = new Date(e.doc_date.getTime()+((24-e.doc_date.getUTCHours())*60*60*1000));
    printjson(e.doc_date);
    db.offers.save(e);
  }
});

db.invoices.find({}).forEach(function(e) {
  if (e.doc_date.getUTCHours()>0){
    e.doc_date = new Date(e.doc_date.getTime()+((24-e.doc_date.getUTCHours())*60*60*1000));
    printjson(e.doc_date);
    db.invoices.save(e);
  }
});
db.invoices.find({type:{$exists: false}, doc_date:{$gte: ISODate("2019-01-01T00:00:00.000Z"),$lt: ISODate("2021-01-01T00:00:00.000Z")}}).forEach(function(e) {
  e.type_year = e.doc_date.getUTCFullYear();
  e.type = "GEN";
  e.paid = "true";
  printjson(e.paid);
  db.invoices.save(e);
});



db.invoices.find({}).forEach(function(e) {
  if (e.invoice_date) {
    e.doc_date = e.invoice_date;
    delete e.invoice_date;
    e.doc_number = e.invoice_number;
    delete e.invoice_number;
  }
  if (e.to_client) {
    e.doc_to = e.to_client;
    delete e.to_client;
    e.doc_from = {
      "name" : "Flyer srl impresa sociale",
      "address" : {
        "street" : "Via Cardinal de Luca 10",
        "zipcode" : "00196",
        "city" : "Roma",
        "country" : "Italy"
      },
      "vat_number" : "06589171005",
      "fiscal_code" : "06589171005"
    };
    printjson(e.invoice_date);
    printjson(e.invoice_number);
    printjson(e.doc_date);
    printjson(e.doc_number);
    db.invoices.save(e);
  }
});

db.offers.find({}).forEach(function(e) {
  if (e.offer_date) {
    e.doc_date = e.offer_date;
    delete e.offer_date;
    e.doc_number = e.offer_number;
    delete e.offer_number;
  }
  if (e.to_client) {
    e.doc_to = e.to_client;
    delete e.to_client;
    e.doc_from = {
      "name" : "Flyer srl impresa sociale",
      "address" : {
        "street" : "Via Cardinal de Luca 10",
        "zipcode" : "00196",
        "city" : "Roma",
        "country" : "Italy"
      },
      "vat_number" : "06589171005",
      "fiscal_code" : "06589171005"
    };
    printjson(e.offer_date);
    printjson(e.offer_number);
    printjson(e.doc_date);
    printjson(e.doc_number);
    db.offers.save(e);  
  }
});

db.purchases.find({}).forEach(function(e) {
  if (e.purchase_date) {
    e.doc_date = e.purchase_date;
    delete e.purchase_date;
    e.doc_number = e.purchase_number;
    delete e.purchase_number;
  }
  if (e.from_customer) {
    e.doc_from = e.from_customer;
    delete e.from_customer;
    e.doc_to = {
      "name" : "Flyer srl impresa sociale",
      "address" : {
        "street" : "Via Cardinal de Luca 10",
        "zipcode" : "00196",
        "city" : "Roma",
        "country" : "Italy"
      },
      "vat_number" : "06589171005",
      "fiscal_code" : "06589171005"
    };
    printjson(e.purchase_date);
    printjson(e.purchase_number);
    printjson(e.doc_date);
    printjson(e.doc_number);
    db.purchases.save(e);
  }
});
db.creditnotes.find({}).forEach(function(e) {
  if (e.creditnote_date) {
    e.doc_date = e.creditnote_date;
    delete e.creditnote_date;
    e.doc_number = e.creditnote_number;
    delete e.creditnote_number;
  }
  if (e.to_client) {
    e.doc_to = e.to_client;
    delete e.to_client;
    e.doc_from = {
      "name" : "Flyer srl impresa sociale",
      "address" : {
        "street" : "Via Cardinal de Luca 10",
        "zipcode" : "00196",
        "city" : "Roma",
        "country" : "Italy"
      },
      "vat_number" : "06589171005",
      "fiscal_code" : "06589171005"
    };
    printjson(e.creditnote_date);
    printjson(e.creditnote_number);
    printjson(e.doc_date);
    printjson(e.doc_number);
    db.creditnotes.save(e);
  }
});
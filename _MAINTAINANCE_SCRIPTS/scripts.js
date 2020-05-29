import { ObjectId } from "mongodb";

db.purchases.find({}).forEach(function(e) {
  printjson("");
  printjson("");
  printjson("");
  printjson(e.doc_from._id.str);
  if (!e.doc_from._id.str){
    printjson(e.doc_from._id);
    e.doc_from._id = ObjectId(e.doc_from._id)
    printjson(e.doc_from._id);
    db.purchases.save(e);
  }
});
db.clients.find({"address.country":"Italy"}).forEach(function(e) {
  printjson(e);
  e.address.countrycode = "IT";
  db.clients.save(e);
});

db.clients.find({"address.city":"Roma"}).forEach(function(e) {
  printjson(e);
  e.address.province = "RM";
  e.address.city = "Roma";
  db.clients.save(e);
});

db.invoices.count({})
db.invoices.remove({"ajax" : "true"}).forEach(function(e) {
   printjson(e);
});

db.invoices.find({}).forEach(function(e) {
  printjson("");
  printjson("");
  printjson("");
  printjson(e.doc_to._id.str);
  if (!e.doc_to._id.str){
    printjson(e.doc_to._id);
    e.doc_to._id = ObjectId(e.doc_to._id)
    printjson(e.doc_to._id);
    db.invoices.save(e);
  }
});

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
    //db.invoices.save(e);
  }
});
db.invoices.find({type:{$exists: false}, doc_date:{$gte: ISODate("2019-01-01T00:00:00.000Z"),$lt: ISODate("2021-01-01T00:00:00.000Z")}}).forEach(function(e) {
  e.type_year = e.doc_date.getUTCFullYear();
  e.type = "GEN";
  e.paid = "true";
  printjson(e.paid);
  db.invoices.save(e);
});

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
      "name" : "Associazione Culturale Linux Club Italia",
      "address" : {
        "street" : "Via del Verano 39",
        "zipcode" : "00185",
        "city" : "Roma",
        "country" : "RM",
        "countrycode" : "IT"
      },
      "vat_number" : "08459281005",
      "fiscal_code" : "97318630585"
    };
    printjson(e.invoice_date);
    printjson(e.invoice_number);
    printjson(e.doc_date);
    printjson(e.doc_number);
    db.invoices.save(e);
  }
});
    e.doc_from = {
      "name" : "1063GB",
      "address" : {
        "street" : "Arondeusstraat 7",
        "zipcode" : "1063GB",
        "city" : "Amsterdam",
        "country" : "Netherlands",
        "countrycode" : "NL"
      },
      "vat_number" : "NL856555253B01"
    };

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

'doc_from._id': '5e8bbaabf4cfcb71e1bef6a9'

db.purchases.find({ }).forEach(function(e) {
  if (e.doc_from._id.str) e.doc_from._id= e.doc_from._id.str;
  db.purchases.save(e);  
});

db.purchases.find({ }).forEach(function(e) {
  if (e.purchase_date) {
    e.doc_date = e.purchase_date;
    delete e.purchase_date;
    e.doc_number = e.purchase_number;
    delete e.purchase_number;
  }
  if (e.from_customer) {
    e.doc_from = e.from_customer;
    delete e.from_customer;
  }
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
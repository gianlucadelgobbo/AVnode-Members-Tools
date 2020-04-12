db.purchases.find({}).forEach(function(e) {
  if (e.purchase_date.getUTCHours()>0){
    e.purchase_date = new Date(e.purchase_date.getTime()+((24-e.purchase_date.getUTCHours())*60*60*1000));
    printjson(e.purchase_date);
    db.purchases.save(e);
  }
});
db.purchases.find({type:{$exists: false}, purchase_date:{$gte: ISODate("2019-01-01T00:00:00.000Z"),$lt: ISODate("2021-01-01T00:00:00.000Z")}}).forEach(function(e) {
  e.type_year = e.purchase_date.getUTCFullYear();
  e.type = "GEN";
  e.paid = "true";
  printjson(e.paid);
  db.purchases.save(e);
});

db.offers.find({}).forEach(function(e) {
  if (e.offer_date.getUTCHours()>0){
    e.offer_date = new Date(e.offer_date.getTime()+((24-e.offer_date.getUTCHours())*60*60*1000));
    printjson(e.offer_date);
    db.offers.save(e);
  }
});

db.invoices.find({}).forEach(function(e) {
  if (e.invoice_date.getUTCHours()>0){
    e.invoice_date = new Date(e.invoice_date.getTime()+((24-e.invoice_date.getUTCHours())*60*60*1000));
    printjson(e.invoice_date);
    db.invoices.save(e);
  }
});
db.invoices.find({type:{$exists: false}, invoice_date:{$gte: ISODate("2019-01-01T00:00:00.000Z"),$lt: ISODate("2021-01-01T00:00:00.000Z")}}).forEach(function(e) {
  e.type_year = e.invoice_date.getUTCFullYear();
  e.type = "GEN";
  e.paid = "true";
  printjson(e.paid);
  db.invoices.save(e);
});


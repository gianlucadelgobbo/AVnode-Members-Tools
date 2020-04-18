
var Validators = {};

Validators.checkCustomer = function(customer){
  var errors = [];
  if(!customer.name || !customer.name.length) 
    errors.push({name:"doc_to[name]",m:__("You have to insert a valid customer")});
  if(!customer.address.street || !customer.address.street.length) 
    errors.push({name:"doc_to[address][street]",m:__("You have to insert a valid street")});
  if(!customer.address.zipcode || !customer.address.zipcode.length)
    errors.push({name:"doc_to[address][zipcode]",m:__("You have to insert a valid zipcode")});
  if(!customer.address.city || !customer.address.city.length)
    errors.push({name:"doc_to[address][city]",m:__("You have to insert a valid city")});
  if(!customer.address.province || customer.address.province.length!=2 || customer.address.province != customer.address.province.toUpperCase())
    errors.push({name:"doc_to[address][province]",m:__("You have to insert a valid province")});
  if(!customer.address.countrycode || customer.address.countrycode.length!=2 || customer.address.countrycode != customer.address.countrycode.toUpperCase())
    errors.push({name:"doc_to[address][countrycode]",m:__("You have to insert a valid country code")});
  if(customer.address.countrycode == "IT" && (!customer.unique_code || !customer.unique_code.length) && (!customer.pec || !customer.pec.length))
    errors.push({name:"doc_to[unique_code]",m:__("You have to insert a valid pec or unique code")});
  if(customer.countrycode == "IT" && (!customer.fiscal_code || !customer.fiscal_code.length))
    errors.push({name:"doc_to[fiscal_code]",m:__("You have to insert a valid fiscal code")});
  return errors;
};

Validators.checkCF = function (cf) {
  var errors = [];
  var validi, i, s, set1, set2, setpari, setdisp;
  if( cf == '' ) {
    errors.push({name:"fiscal_code",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 16 caratteri.")});
  } else{
    cf = cf.toUpperCase();
    if( cf.length != 16 )
      errors.push({name:"fiscal_code",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 16 caratteri.")});
    validi = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for( i = 0; i < 16; i++ ){
      if( validi.indexOf( cf.charAt(i) ) == -1 )
        errors.push({name:"fiscal_code",m:__("Il codice fiscale contiene un carattere non valido. I caratteri validi sono le lettere e le cifre.")});
    }
    set1 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    set2 = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ";
    setpari = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    setdisp = "BAKPLCQDREVOSFTGUHMINJWZYX";
    s = 0;
    for( i = 1; i <= 13; i += 2 )
      s += setpari.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
    for( i = 0; i <= 14; i += 2 )
      s += setdisp.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
    if( s%26 != cf.charCodeAt(15)-'A'.charCodeAt(0) )
      errors.push({name:"fiscal_code",m:__("Il codice fiscale non è corretto: il codice di controllo non corrisponde.")});
  }
  return errors;
};
Validators.checkCFwithVAT = function (cf) {
  var errors = [];
  if( cf == '' ) {
    errors.push({name:"vat_number",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 11 caratteri.")});
  } else {
    if( cf.length != 11 )
      errors.push({name:"vat_number",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 11 caratteri.")});
    var validi = "0123456789";
    for( var i = 0; i < 11; i++ ){
      if( validi.indexOf( cf.charAt(i) ) == -1 )
        errors.push({name:"vat_number",m:__("Il codice fiscale contiene un carattere non valido. I caratteri validi sono le cifre.")});
    }
    var s = 0;
    for( var i = 0; i <= 9; i += 2 )
      s += cf.charCodeAt(i) - '0'.charCodeAt(0);
    for( i = 1; i <= 9; i += 2 ){
      c = 2*( cf.charCodeAt(i) - '0'.charCodeAt(0) );
      if( c > 9 )  c = c - 9;
      s += c;
    }
    if( ( 10 - s%10 )%10 != cf.charCodeAt(10) - '0'.charCodeAt(0) )
      errors.push({name:"vat_number",m:__("Il codice fiscale non è valido: il codice di controllo non corrisponde.")});
  }
  return errors;
};

Validators.checkVAT = function (pi, country, callback) {
  var errors = [];
  switch(country) {
    case "Italy" :
      if( pi == '' ) {
        errors.push({name:"vat_number",m:__("La lunghezza della partita IVA non è corretta: la partita IVA dovrebbe essere lunga esattamente 11 caratteri.")});
      } else {
        if( pi.length != 11 )
          errors.push({name:"vat_number",m:__("La lunghezza della partita IVA non è corretta: la partita IVA dovrebbe essere lunga esattamente 11 caratteri.")});
        var validi = "0123456789";
        for( var i = 0; i < 11; i++ ){
          if( validi.indexOf( pi.charAt(i) ) == -1 )
            errors.push({name:"vat_number",m:__("La partita IVA contiene un carattere non valido. I caratteri validi sono le cifre.")});
        }
        var s = 0;
        for( var i = 0; i <= 9; i += 2 )
          s += pi.charCodeAt(i) - '0'.charCodeAt(0);
        for( i = 1; i <= 9; i += 2 ){
          var c = 2*( pi.charCodeAt(i) - '0'.charCodeAt(0) );
          if( c > 9 )  c = c - 9;
          s += c;
        }
        if( ( 10 - s%10 )%10 != pi.charCodeAt(10) - '0'.charCodeAt(0) )
          errors.push({name:"vat_number",m:__("La partita IVA non è valida: il codice di controllo non corrisponde.")});
      }
    break;
  }
  return errors;
};

Validators.checkDocNumber = function(invoiceNumber){
  var errors = [];
  if (!invoiceNumber) errors.push({name:"doc_number",m:__("No invoice number")});
  return errors;
};

Validators.checkDocDate = function(invoiceDate){
  var errors = [];
  if (!invoiceDate) {
    errors.push({name:"doc_date",m:__("No document date")});
  } else {
    var d = invoiceDate.split("/");
    if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"doc_date",m:__("Document date is not date")});
  }
  return errors;
};

Validators.checkPaymentDays = function(payment_days){
  var errors = [];
  if (!payment_days) errors.push({name:"payment_days",m:__("No payment days")});
  if (payment_days && (isNaN(parseFloat(payment_days)) || !isFinite(payment_days))) errors.push({name:"payment_days",m:__("Payment days have to be a number")});
  return errors;
};

Validators.checkDeliveryDate = function(deliveryDate){
  var errors = [];
  if(deliveryDate){
    var d = deliveryDate.split("/");
    if (!this.is_date(d[2],d[1],d[0])){
      errors.push({name:"delivery_date",m:__("Delivery date is not date")});
    }
  }
  return errors;
};

Validators.checkOfferDate = function(offerDate){
  var errors = [];
  /* if (!offerDate) {
    errors.push({name:"doc_date",m:__("No offer date")});
  } else { */
  if (offerDate) {
      var d = offerDate.split("/");
    //if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"doc_date",m:__("Invoice date is not date")});
    if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"doc_date",m:__("Document date is not date")});
  }
  return errors;
};

/*
Validators.checkCreditNoteNumber = function(creditnoteNumber){
  var errors = [];
  if (!creditnoteNumber) errors.push({name:"doc_number",m:__("No credit note number")});
  return errors;
};

Validators.checkCreditNoteDate = function(creditnoteDate){
  var errors = [];
  if (!creditnoteDate) {
    errors.push({name:"doc_date",m:__("No credit note date")});
  } else {
    var d = creditnoteDate.split("/");
    if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"doc_date",m:__("Credit Note date is not date")});
  }
  return errors;
};

Validators.checkPurchaseNumber = function(purchaseNumber){
  var errors = [];
  if (!purchaseNumber) errors.push({name:"doc_number",m:__("No purchase number")});
  return errors;
};

Validators.checkPurchaseDate = function(purchaseDate){
  var errors = [];
  if (!purchaseDate) {
    errors.push({name:"doc_date",m:__("No purchase date")});
  } else {
    var d = purchaseDate.split("/");
    if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"doc_date",m:__("Purchase date is not date")});
  }
  return errors;
};

Validators.checkOfferNumber = function(offerNumber){
  var errors = [];
  if (!offerNumber) errors.push({name:"doc_number",m:__("No offer number")});
  return errors;
};

 */

// General Functions //
Validators.validateStringLength = function(s, min, max) {
  if (!s) return false;
  return s.length <= max && s.length >= min;
};

Validators.validateEmail = function(e) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(e);
};
Validators.is_date = function (aaaa,mm,gg){
  var res = true;
  var mmNew = parseFloat(mm)-1;
  mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
  var dteDate=new Date(Date.UTC(aaaa,mm,gg));
  if (!((gg==dteDate.getUTCDate()) && (mm==dteDate.getUTCMonth()) && (aaaa==dteDate.getUTCFullYear())))
    res = false;
  return res;
};

Validators.isJson = (str) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

if (typeof exports !== 'undefined') exports.Validators = Validators;

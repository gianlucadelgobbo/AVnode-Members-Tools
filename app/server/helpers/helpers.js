var bcrypt = require('bcrypt-nodejs');
var ObjectID = require('mongodb').ObjectID;
var accounting = require('accounting');
var DBusers = require('./db-users-manager');
var DB = require('./db-manager');
var Validators = require('../../common/validators').Validators;

exports.canIseeThis = function canIseeThis(req,callback) {
  console.log("sto qui");
  if(req.session.user == null) {
    console.log("sto qui 1");
    callback(false);
  } else if(req.params.dbname && req.session.user.dbs.indexOf(req.params.dbname)==-1) {
    console.log("sto qui 2");
    callback(false);
  } else if(req.params.dbname && global.settings.dbName != req.params.dbname) {
    console.log("sto qui 3");
    var index = req.session.user.dbs.indexOf(req.params.dbname);
    global.settings.dbName = req.session.user.companies[index].dbname;
    global.settings.companyName = req.session.user.companies[index].companyname;
    DB.init(function () {
      callback(true);
    });
  } else if(req.params.dbname && global.settings.dbName == req.params.dbname) {
    console.log("sto qui 4");
    callback(true);
  //} else if(global.settings.dbName) {
  //  callback(true);
  } else {
    console.log("sto qui 5");
    callback(false);
  }
};

exports.generateDBs = function generateDBs(o) {
  var res = [];
  for (var a=0;a<o.companies.length;a++) {
    if (o.companies[a].dbname) res.push(o.companies[a].dbname);
  }
  return res;
}
// Forms validators //
exports.validateFormLogin = function validateFormLogin(o,callback) {
  var e = [];
  DBusers.users.findOne({user:o.user}, function(err, result) {
    if (result == null){
      e.push({name:"user",m:__("User not found")});
      callback(e, o);
    } else {
      bcrypt.compare(o.pass, result.pass, function(err, res) {
        if (!res) e.push({name:"pass",m:__("Invalid password")});
        callback(e, result);
      });
    }
  });
};

exports.validateFormAccount = function validateFormAccount(o,callback) {
  var e = [];
  var companies = [];
  if (o.companies) {
    for (var a=0;a<o.companies.length;a++) {
      //if (o.companies[a].dbname){
        if (!Validators.validateStringLength(o.companies[a].companyname, 3, 100)){
          e.push({name:"name",m:__("Please enter a valid Company Name")});
        }
        if (typeof o.companies[a].dbname=="undefined"){
          e.push({name:"name",m:__("Please enter a valid DB Name")});
        } else  if (!Validators.validateStringLength(o.companies[a].dbname, 3, 100)){
          e.push({name:"name",m:__("Please enter a valid DB Name")});
        }
      //} else {
      //  o.companies.splice(a, 1);;
      //}
    }
  } else {
    e.push({name:"name",m:__("Please enter a valid Company Name")});
  }
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Name")});
  }
  if (typeof o.country === "undefined" || !Validators.validateStringLength(o.country, 3, 50)){
    e.push({name:"country",m:__("Please enter a Country")});
  }
  if (!settings.roles[o.role]){
    e.push({name:"role",m:__("Please enter a valid Role")});
  }
  if (((o.id && o.pass !== "") || !o.id) && !Validators.validateStringLength(o.pass, 3, 50)){
    e.push({name:"pass",m:__("Please enter a valid Password")});
  }
  if (((o.id && o.user!=="") || !o.id) && !Validators.validateStringLength(o.user, 3, 50)){
    e.push({name:"user",m:__("Please enter a valid Username")});
  }
  if(!Validators.validateEmail(o.email)){
    e.push({name:"email",m:"Email is not email"});
    callback(e, o);
  } else {
    var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},email:o.email} : {email:o.email});
    DBusers.users.findOne(q ,function(err, result) {
      if (result) {
        e.push({name:"email",m:__("Email already used from another account")});
        callback(e, o);
      } else {
        var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},user:o.user} : {user:o.user});
        DBusers.users.findOne(q, function(err, result) {
          if (result){
            e.push({name:"email",m:__("Username already in use")});
          }
          callback(e, o);
        });
      }
    });
  }
};

exports.formatMoney = function formatMoney(result) {
  accounting.settings = global._config.accountingSettings;
  result.subtotal=accounting.formatMoney(result.subtotal);
  result.vat_amount=accounting.formatMoney(result.vat_amount);
  result.shipping_costs=accounting.formatMoney(result.shipping_costs);
  result.total=accounting.formatMoney(result.total);
  for (var item in result.items) {
    if (result.items[item]) {
      result.items[item].price=accounting.formatMoney(result.items[item].price);
      result.items[item].amount=accounting.formatMoney(result.items[item].amount);
    }
  }
  return result;
};

exports.formatMoneyList = function formatMoneyList(result) {
  var res = [];
  for (var item in result) {
    res.push(this.formatMoney(result[item]));
  }
  return res;
};


exports.validateFormCustomer = function validateFormCustomer(o,callback) {
  var e = [];
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Customer")});
  }
  if (o.force != 1) {
    if (!Validators.validateStringLength(o.address.street, 3, 100)){
      e.push({name:"address[street]",m:__("Please enter a valid Street")});
    }
    if (!Validators.validateStringLength(o.address.zipcode, 3, 20)){
      e.push({name:"address[zipcode]",m:__("Please enter a valid ZIP code")});
    }
    if (!Validators.validateStringLength(o.address.city, 3, 50)){
      e.push({name:"address[city]",m:__("Please enter a valid City")});
    }
    if (!Validators.validateStringLength(o.address.country, 3, 50)){
      e.push({name:"address[country]", m:__("Please enter a valid Country")});
    }
    if (global._config.company.country == "Italy" && o.address.country == "Italy") {
      if (o.vat_number) e = e.concat(Validators.checkVAT(o.vat_number,o.address.country));
      if (o.fiscal_code != o.vat_number || o.fiscal_code=="") {
        e = e.concat(Validators.checkCF(o.fiscal_code));
      }
    }
  }
  if (e){
    callback(e, o);
  } else {
    var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},vat_number:o.vat_number} : {vat_number:o.vat_number});
    DB.accounts.findOne(q ,function(err, result) {
      if (result) {
        e.push({name:"vat_number",m:__("VAT number already in use")});
        callback(e, o);
      } else {
        if (global._config.company.country == "Italy" && o.address.country == "Italy"){
          //var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},fiscal_code:o.fiscal_code} : {fiscal_code:o.fiscal_code});
          DB.accounts.findOne({user:o.user}, function(err, result) {
            if (result){
              e.push({name:"fiscal_code",m:__("Fiscal code already in use")});
            }
            callback(e, o);
          });
        } else {
          callback(e, o);
        }
      }
    });
  }
};

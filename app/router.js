var indexRoutes = require('./routes/index');
var changedbRoutes = require('./routes/changedb');
var startupRoutes = require('./routes/startup');
var sendemailRoutes = require('./routes/send-email');
var logoutRoutes = require('./routes/logout');
var homeRoutes = require('./routes/home');
var accountsRoutes = require('./routes/users');
var accountRoutes = require('./routes/user');
var settingsRoutes = require('./routes/settings');
var lostPasswordRoutes = require('./routes/lost-password');
var resetPasswordRoutes = require('./routes/reset-password');
var customersRoutes = require('./routes/customers');
var docsRoutes = require('./routes/docs');
var apiRoutes = require('./routes/api');
var errorsRoutes = require('./routes/errors');

module.exports = function(app) {
  // Log In //
  app.get('/', indexRoutes.get);
  app.post('/', indexRoutes.post);

  // Log Out //
  app.get('/logout', logoutRoutes.get);

  // Api //
  app.get('/api/accounting/customers', apiRoutes.getCustomers);
  app.get('/api/accounting/payments', apiRoutes.getPayments);
  app.get('/api/accounting/invoices', apiRoutes.getInvoices);
  app.get('/api/accounting/purchases', apiRoutes.getPurchases);
  app.get('/api/accounting/creditnotes', apiRoutes.getCreditnotes);
  app.get('/api/accounting/products', apiRoutes.getProducts);
  app.get('/api/accounting/offers', apiRoutes.getOffers);

  // Logged-in redirect / homepage //
  app.get('/:dbname/home', homeRoutes.get);

  // ChangeDB //
  app.get('/startup', startupRoutes.get);
  app.post('/startup', startupRoutes.post);

  // SendMail //
  app.get('/sendemail', sendemailRoutes.get);
  app.post('/sendemail', sendemailRoutes.post);

  // password reset //
  app.post('/lost-password', lostPasswordRoutes.post);
  app.get('/reset-password', resetPasswordRoutes.get);
  app.post('/reset-password', resetPasswordRoutes.post);

  // Settings //
  app.get('/:dbname/settings', settingsRoutes.get);
  app.post('/:dbname/settings', settingsRoutes.post);

  // Accounts //
  app.get('/:dbname/accounts', accountsRoutes.get);
  app.get('/:dbname/account', accountRoutes.get);
  app.post('/:dbname/account', accountRoutes.post);

  // Customers //
  app.get('/:dbname/accounting/customers', customersRoutes.getAll);
  app.get('/:dbname/accounting/customers/new', customersRoutes.get);
  app.post('/:dbname/accounting/customers/new', customersRoutes.post);
  app.get('/:dbname/accounting/customers/:customer', customersRoutes.get);
  app.post('/:dbname/accounting/customers/:customer', customersRoutes.post);

  // Invoices //
  app.get('/:dbname/accounting/:sez', docsRoutes.getList);
  app.get('/:dbname/accounting/:sez/new', docsRoutes.getDett);
  app.get('/:dbname/accounting/purchases/import', docsRoutes.my_import);
  app.post('/:dbname/accounting/purchases/import', docsRoutes.my_import_act);
  app.get('/:dbname/accounting/:sez/:id', docsRoutes.getDett);
  app.get('/:dbname/accounting/:sez/:id/del', docsRoutes.delete);
  app.post('/:dbname/accounting/:sez/:id', docsRoutes.post);
  app.get('/:dbname/accounting/:sez/:id/print', docsRoutes.getPrint);
  app.get('/:dbname/accounting/:sez/:id/xml', docsRoutes.getXML);
  app.post('/:dbname/accounting/:sez/:id/set-type', docsRoutes.setType);

  // ChangeDB //
  app.get('/:dbname', changedbRoutes.get);

  // all other routes 404
  app.get('/:dbname/*', errorsRoutes.get404);
  app.get('*', errorsRoutes.get);
};

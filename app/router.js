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
var invoicesRoutes = require('./routes/invoices');
var invoiceRoutes = require('./routes/invoice');
var purchasesRoutes = require('./routes/purchases');
var purchaseRoutes = require('./routes/purchase');
var offerRoutes = require('./routes/offer');
var offersRoutes = require('./routes/offers');
var creditnotesRoutes = require('./routes/creditnotes');
var creditnoteRoutes = require('./routes/creditnote');
var apiRoutes = require('./routes/api');
var errorsRoutes = require('./routes/errors');

module.exports = function(app) {
  // Log In //
  app.get('/', indexRoutes.get);
  app.post('/', indexRoutes.post);

  // Log Out //
  app.get('/logout', logoutRoutes.get);

  // Api //
  //app.get('/api/partners', apiRoutes.getPartners);
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
  app.get('/:dbname/accounting/:sez', invoiceRoutes.getList);
  app.get('/:dbname/accounting/:sez/new', invoiceRoutes.getDett);
  app.get('/:dbname/accounting/purchases/import', invoiceRoutes.my_import);
  app.post('/:dbname/accounting/purchases/import', invoiceRoutes.my_import_act);
  app.get('/:dbname/accounting/:sez/:id', invoiceRoutes.getDett);
  app.get('/:dbname/accounting/:sez/:id/del', invoiceRoutes.delete);
  app.post('/:dbname/accounting/:sez/:id', invoiceRoutes.post);
  app.get('/:dbname/accounting/:sez/:id/print', invoiceRoutes.getPrint);
  app.get('/:dbname/accounting/:sez/:id/xml', invoiceRoutes.getXML);
  app.post('/:dbname/accounting/:sez/:id/set-type', invoiceRoutes.setType);
  /*app.get('/:dbname/accounting/invoices', invoicesRoutes.get); */
  //app.get('/:dbname/accounting/invoice', invoiceRoutes.get);
  //
  //app.get('/:dbname/accounting/print/invoice', invoiceRoutes.print);
  //app.get('/:dbname/accounting/xml/invoice', invoiceRoutes.xml);

  // Purchases //
  //app.get('/:dbname/accounting/purchases', purchasesRoutes.get);
  /* app.post('/:dbname/accounting/set-type/purchases', purchasesRoutes.post);
  app.get('/:dbname/accounting/purchase', purchaseRoutes.get);
  app.post('/:dbname/accounting/purchase', purchaseRoutes.post);
  app.get('/:dbname/accounting/print/purchase', purchaseRoutes.print);
  app.get('/:dbname/accounting/xml/purchase', purchaseRoutes.xml);

  // Credit Note //
  //app.get('/:dbname/accounting/creditnotes', creditnotesRoutes.get);
  app.get('/:dbname/accounting/creditnote', creditnoteRoutes.get);
  app.post('/:dbname/accounting/creditnote', creditnoteRoutes.post);
  app.get('/:dbname/accounting/print/creditnote', creditnoteRoutes.print);
  app.get('/:dbname/accounting/xml/creditnote', creditnoteRoutes.xml);

  // Offers //
  //app.get('/:dbname/accounting/offers', offersRoutes.get);
  app.get('/:dbname/accounting/offer', offerRoutes.get);
  app.post('/:dbname/accounting/offer', offerRoutes.post);
  app.get('/:dbname/accounting/print/offer', offerRoutes.print); */

  // ChangeDB //
  app.get('/:dbname', changedbRoutes.get);

  // all other routes 404
  app.get('/:dbname/*', errorsRoutes.get404);
  app.get('*', errorsRoutes.get);
};
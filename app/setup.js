//var DB = require('./modules/db-manager');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');

module.exports = function(app, exp) {
  //var env = process.env.NODE_ENV || 'development';
  //if ('development' == env) {
    app.set('views', [global.settings.root_path + '/app/views', global.settings.root_path + '/warehouse']);
    app.set('view engine', 'pug');
    //app.set('view options', { doctype : 'html', pretty : true });
    app.use(bodyParser.raw({ limit: '50mb'}));
    app.use(bodyParser.json({ limit: '50mb'}));
    app.use(bodyParser.text({ limit: '50mb'}));
    app.use(bodyParser.urlencoded({ extended: true,limit: '50mb',parameterLimit: 1000000 }));
    //app.use(bodyParser());
    app.use(cookieParser());
    app.use(session({ secret: 'mongo-invoices', resave: false, saveUninitialized: true, cookie: { maxAge: 3600000 } }));
    app.use(methodOverride());
    //app.use(require('stylus').middleware({ src: global.settings.root_path + '/public' }));
    app.use(exp.static(global.settings.root_path + '/app/common'));
    app.use(exp.static(global.settings.root_path + '/public'));
    app.use(exp.static(global.settings.root_path + '/warehouse'));
    //app.use(DB.i18n.init);
  //}
};
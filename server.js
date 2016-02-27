// express setup
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

require('dotenv').config();

// database setup
var mysql = require('mysql')
var Sequelize = require('sequelize');

if(process.env.NODE_ENV === 'production') {
  // HEROKU DB
  console.log(process.env.JAWSDB_URL);
  var connection = new Sequelize(process.env.JAWSDB_URL);
} 
else {
  // LOCAL DB
  var connection = new Sequelize('rutgers_flyer_db', 'root');
}

//requiring passport last
var passport = require('passport');
var passportLocal = require('passport-local');
//middleware init
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/images", express.static("public/images"));
app.use(require('express-session')({
    secret: 'crackalackin',
    resave: true,
    saveUninitialized: true,
    cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
}));
app.use(passport.initialize());
app.use(passport.session());

//passport use methed as callback when being authenticated
passport.use(new passportLocal.Strategy(function(username, password, done) {
  //check password in db
  console.log(username);
  console.log(password);
  User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    //check password against hash
    if(user) {
      bcrypt.compare(password, user.dataValues.password, function(err, user) {
        if (user) {
          //if password is correct authenticate the user with cookie
          done(null, { id: username, username: username });
        }
        else {
          done(null, null);
        }
      });
    }
    else {
      done(null, null);
    }
  });
}));

//change the object used to authenticate to a smaller token, and protects the server from attacks
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    done(null, { id: id, username: id })
});

var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));

var User = connection.define('user', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [5,20],
        msg: "Your password must be between 5-20 characters"
      },
    }
  },
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

//handlebars setup
var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//check login with db
app.post('/check', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/?msg=Login Credentials do not work'
}));
// app.post('/check', function(req, res) {
//   res.send("YOU ARE HERE");
// });

app.get("/", function(req, res){
  res.render('home', {msg: req.query.msg});
});

app.get("/signup", function(req, res){
  res.render('signup');
});

app.get("/login", function(req, res){
  res.render('login');
});

app.get('/home', function(req, res){
  console.log(res);
  res.render('home', {
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

app.post("/save", function(req, res){
  User.create(req.body).then(function(result){
    res.redirect('/?msg=Account created. You may log in.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
    console.log("Listening on:" + PORT)
  });
});

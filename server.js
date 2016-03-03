// express setup
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

require('dotenv').config();

// database setup
var mysql = require('mysql')
var Sequelize = require('sequelize');

// This connection is for heroku app and must be commented back in before deploying to heroku
//with heroku use this:
//console.log(process.env.JAWSDB_URL);
//var connection = new Sequelize(process.env.JAWSDB_URL);

//local test:
//This connection is to test locally and must be commented out before deploying to heroku
var connection = new Sequelize('rutgers_flyer_db', 'root');

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
  User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    console.log("WHAT IS", user);
    //check password against hash
    if(user) {
      bcrypt.compare(password, user.dataValues.password, function(err, bcryptUser) {
        if (bcryptUser) {
          //if password is correct authenticate the user with cookie
          done(null, user);
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
  console.log('in serializeUser', user);
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  console.log('in deserializeUser', user);
  done(null, user);

  // User.findById(id, function(err, user) {
  //   console.log('deserializeUser', user);
  //   done(err, user);
  // });
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


/* TABLE OF REVIEWS
var Review = sequelize.define('Review', {
  comments: {
    type: Sequelize.STRING
  },
  rating: {
    type: Sequelize.INTEGER
  }
});
*/

/*  TABLE OF RESTAURANTS
var Restaurant = sequelize.define('Restaurants', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING
  },
  street: {
    type: Sequelize.STRING
  },
  city: {
    type: Sequelize.STRING
  }
});
*/

var Review = connection.define('review', {
  locationName: {
    type: Sequelize.STRING
  },
  diningType: {
    type: Sequelize.STRING,
    alllowNull: true
  },
  street: {
    type: Sequelize.STRING,
    alllowNull: true
  },
  city: {
    type: Sequelize.STRING,
    alllowNull: false
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  review: {
    type: Sequelize.STRING,
    validate: {
      len: {
        args: [5,200],
        msg: "Your review must be between 5-200 characters"
      }
    }
  }
});

User.hasMany(Review);

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

//DISPLAY ALL RESTAURANTS WITH REVIEWS :WORKS!
/*
app.get("/", function(req, res){
  Review.findAll().then(function(reviews) {
    console.log(reviews);
    res.render('home', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});
*/

//DISPLAY REVIEWS BY ID: IF LOGGED IN, JUST YOUR ID. IF NOT ALL REVIEWS
app.get("/", function(req, res){
  var where = {};
  if(req.user) {
    where = {
      UserId: req.user.id
    }
  }
  Review.findAll(where).then(function(reviews) {
    console.log(reviews);
    res.render('test', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});

app.get("/test", function(req, res) {
  Review.findAll().then(function(reviews) {
    console.log(reviews);
    res.render('reviews', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});

/*
//TEST : DISPLAYS DATA FROM DATABASE
app.get('/test', function(req, res) {
  Review.findAll().then(function(reviews) {
    console.log(reviews);
    res.render('test', {
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});
*/



/*IN PROGRESS -- DISPLAY ALL REVIEWS FOR PARTICULAR RESTAURANT*/
app.get('/info/:name', function(req, res){
  Restaurant.findOne({
    where: {
      name: req.params.name
    }
  }).then(function(Restaurant){
    console.log(Restaurant);
    res.render('?', {restaurant: restaurant});
  }).catch(function(err){
    console.log(err);
    res.redirect('/?msg=Error');
  });
});

app.get("/home", function(req, res) {
  console.log('req.user', req.user);
  res.render('home', {
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

//LOGOUT USER
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post("/save", function(req, res) {
  User.create(req.body).then(function(result) {
    res.redirect('/?msg=Account created. You may log in.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

app.post("/saveRating", function(req, res) {
  var newReview = req.body;
  console.log(newReview);
  newReview.userId = req.user.id;
  Review.create(newReview).then(function(result) {
    res.redirect('/?msg=Review saved.');
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

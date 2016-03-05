// express setup
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

require('dotenv').config();

// database setup
var mysql = require('mysql')
var Sequelize = require('sequelize');

//This connection is for heroku app and must be commented back in before deploying to heroku
//with heroku use this:
//console.log(process.env.JAWSDB_URL);
//var connection = new Sequelize(process.env.JAWSDB_URL);

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

//passport use method as callback when being authenticated
passport.use(new passportLocal.Strategy(function(username, password, done) {
  //check password in db
  User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    //console.log("WHAT IS", user);
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
  //console.log('in serializeUser', user);
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  //console.log('in deserializeUser', user);
  done(null, user);
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

/*CREATE BULK RESTAURANTS WITH REVIEWS FOR TESTING
Review.bulkCreate([
  {locationName: 'Scarlet Pub', diningtype: 'bar', street: '131 Easton Ave', city: 'New Brunswick', rating: 3, review: 'This place is pretty cool. Cheap beer.'},
  {locationName: 'Harvest Moon Brewery', diningtype: 'bar', street: '392 George St', city: 'New Brunswick', rating: 4, review: 'Whole lotta beer'},
  {locationName: 'Evelyn\'s Restaurant', diningtype: 'restaurant', street: '45 Easton Ave', city: 'New Brunswick', rating: 1, review: 'The go to spot for Middle Eastern plates'},
  {locationName: 'Pizza Hut', diningtype: 'restaurant', street:'1135 Easton Ave' , city: 'Somerset', rating: 1, review: 'Why would anyone ever go here?'},
], { validate: true }); */


User.hasMany(Review);
Review.belongsTo(User);

//handlebars setup
var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//POST DATA FROM MODAL IN MAIN TO CREATE USER
app.post("/save", function(req, res) {
  User.create(req.body).then(function(result) {
    res.redirect('/?msg=Account created. You may log in.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

//POST DATA FROM MODAL IN MAIN AND CHECK FOR LOGIN
app.post('/check', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/?msg=Login Credentials do not work'
}));

//GET ALL REVIEWS
app.get("/", function(req, res){
  Review.findAll({order: "createdAt DESC",
  include: [User]
  }).then(function(reviews) {
    //console.log(reviews);
    res.render('home', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews, //left side = handlebars right side = data variable
    });
  });
});

//GET ALL REVIEWS CONNECTED TO USER IF AUTHENTICATED ALLOW EDITING (SHOWS BUTTONS)
app.get("/yourReviews", function(req, res){
  console.log('user is', req.user);
  var where = {};
  if(req.user) {
    where = {
      where: {
        userId: req.user.id
      }
    }
  }
  console.log("Where is", where);
  Review.findAll(where).then(function(reviews) {
    console.log(reviews);
    res.render('yourReviews', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});


//GET REVIEWS USING FILTRATION. NEED TO CHANGE THIS TO DININGTYPE AFTER DB CORRECTION
app.get('/filter/:city', function(req, res){
  var city = req.params.city;
  Review.findAll({
    where: {
      city : city
    }
  }).then(function(reviews){
    console.log(reviews);
    res.render("home", {
      reviews: reviews
    });
  });
});

//USER POSTS FROM MODAL IN MAIN TO CREATE REVIEW
app.post("/saveRating", function(req, res) {
  var newReview = req.body;
  //console.log(newReview);
  newReview.userId = req.user.id;
  Review.create(newReview).then(function(result) {
    res.redirect('/?msg=Review saved.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

//GETS REVIEWS FROM REVIEW TABLE BY ID SENDS TO EDITREVIEW FOR EDITING
app.get("/edit/:id", function(req, res) {
  //console.log("params id " + req.params.id);
  var reviewId = req.params.id;
  Review.findAll({
    where: {
      id: reviewId
    }
  }).then(function(reviews) {
    //console.log(reviews);
    res.render('editReview', {
      msg: req.query.msg,
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
      reviews: reviews //left side = handlebars right side = data variable
    });
  });
});

//POSTS UPDATED REVIEW TO TABLE AND REDIRECTS TO INDEX
app.post("/updateReview/:id", function(req, res) {
  var newReview = req.body.review;
  var newRating = req.body.rating;
  var reviewId = req.params.id;
  // console.log(req.body);
  // console.log(newReview);
  // console.log(newRating);
  // console.log(reviewId);
  Review.update({
    review: newReview,
    rating: newRating,
  },
  {
    where: {id: reviewId}
  }).then(function(result) {
  res.redirect('/?msg=Review updated.');
  }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.message);
  });
});

//GETS REVIEW BY REVIEWID AND DELETES IT
app.get("/deleteReview/:id", function(req, res) {
  var reviewId = req.params.id;
  console.log(reviewId);
  Review.destroy(
    {
      where: {id: reviewId}
    }).then(function(result) {
    res.redirect('/yourReviews?msg=Review deleted.');
    }).catch(function(err) {
      console.log(err);
      res.redirect('/yourReviews?msg=' + err.message);
    });
});

//GET REVIEWS FROM REVIEW TABLE BY TEXT SEARCH
app.post("/search", function(req,res) {
  var searchQuery = req.body.searchQuery; //searchQuest is from form.
  console.log(searchQuery); //returning correctly.

  Review.findAll({
    where: {
      locationName: searchQuery
    }
  }).then(function(reviews){
    res.render("home", {
      reviews: reviews
    });
  });
});


//LOGOUT USER
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//DATABASE CONNECTION VIA SEQUELIZE
connection.sync().then(function() {
  app.listen(PORT, function() {
    console.log("Listening on:" + PORT)
  });
});
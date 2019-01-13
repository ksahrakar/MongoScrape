var cheerio = require("cheerio");
var axios = require("axios");
var handlebars = require("express-handlebars");
var express = require("express");
var app = express();

//Environment/Heroku
const CONNECTION_URI=process.env.MONGODB_URI || "mongodb://localhost/scraper";
const PORT = process.env.PORT || 3000;

//Add User model and connect
var mongoose=require("mongoose");
// var User=require("./models/userModel");
// mongoose.connect("mongodb://localhost/users",{useNewUrlParser:true});


//Add all models/collections and connect to database
var db = require("./models");
mongoose.connect(CONNECTION_URI,{useNewUrlParser:true});

//Session authentication
const session = require("express-session");
app.use(session({resave:false,saveUnititialized:false,secret:"Kamran",cookie:{maxAge:60*60*1000,sameSite:true}}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

const redirectLogin = (req,res,next)=>{
  if(!req.session.userID){
    res.redirect("/")
  } else {next()}
}

const redirectHome = (req,res,next)=>{
  if(req.session.userID){
    res.redirect("/")
  } else {next()}
}


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars",handlebars({defaultLayout:"main"}));
app.set("view engine", "handlebars");

app.listen(PORT);

// Making a scrape request via axios
app.get("/rescrape",function(req,res){
  console.log("Scraping from GlobalResearch Top Stories...");
  axios.get("https://www.globalresearch.ca/latest-news-and-top-stories").then(function(response) {
    // Load the HTML into cheerio and save it to a variable
    var $ = cheerio.load(response.data);
    //var data=[];
    // With cheerio, find necessary data of each article
    $(".article").each(function(i, element) {

      var title=$(element).children(".title").text();
      var link=$(element).children(".title").children().attr("href");
      var url=$(element).children(".alignleft").children().children().attr("src");
      var date=$(element).children(".date").text();
      var artID=link.substr(link.length-7);
      var newArt = {"artID":artID,"artTitle":title,"artUrl": link,"picUrl":url,"artDate":date};
      //console.log(newArt);
      // Save the first 25 results in an object if they are new only
      if (i<25){
        db.Article.create({"artID":artID,"artTitle":title,"artUrl": link,"picUrl":url,"artDate":date});
      };
    });
  }); res.redirect("/");
});

// Log the results once you've looped through each of the elements
app.get("/",function(req,res){
  db.Article
    .find({})
    .populate("comments")
    .then (function(found){
        res.render("index",{articles:found})})
    .catch(function(err){
      res.json(err);
    });
});

app.post("/comment/add/:artID",function(req,res){
  var artcl=req.params.artID;
  db.Comment
    .create({"artID":artcl,"body":req.body.body})
    .then(function(dbComment)
      {return db.Article
        .findOneAndUpdate({artID:artcl},{$push:{comments:dbComment._id},new:true});
  });
  res.redirect("/");
})

app.post("/register", redirectHome, function(req,res){
  db.User
    .create(req.body)
    .then(function(dbUser){
      res.json(dbUser);
    })
    .catch(function(err){
      res.json(err)
    })
})

app.post("/login", redirectHome, function(req,res){
  db.User
    .findOne(req.body)
    .then(function(dbUser){
      res.json(dbUser);
    })
    .catch(function(err){
      res.json(err)
    })
})

app.get("/saved", redirectLogin, function(req,res){

})

app.get("/save/:artID", function(req,res){
  db.Article
    .findOne({"artID":req.params.artID},function(err,resp){
    if(err){console.log(err)}
    else{db.User.articles.insert(resp)}
  });
  console.log("article saved");
  res.redirect("/");
});

app.post("/logout",redirectLogin, function(req,res){
  req.session
    .destroy(err=>{if (err){return res.redirect("/")};
    res.clearCookie();
    res.redirect("/");
  })
});

app.post("/comment/:artID", function(req,res){
  artclID=req.params.artID;
  res.render("comment",{"artID":artclID});
});

app.post("/remove/:cmntID", function(req,res){
  cmntID=req.params.cmntID;
  db.Article.findOneAndUpdate({},{$pull:{comments:cmntID}},{new:true});
  db.Comment.deleteOne({_id:cmntID},function(err){if (err) return err});
  res.redirect("/");
});
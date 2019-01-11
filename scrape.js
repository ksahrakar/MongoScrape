var cheerio = require("cheerio");
var axios = require("axios");
var handlebars = require("express-handlebars");
var express = require("express");
var app = express();
var moment = require("moment");

//Add User model and connect
var mongoose=require("mongoose");
// var User=require("./models/userModel");
// mongoose.connect("mongodb://localhost/users",{useNewUrlParser:true});


//Add all models/collections and connect to database
var db = require("./models");
mongoose.connect("mongodb://localhost/scraper",{useNewUrlParser:true});

//Dummy data for users
// var dummy={
//   username:"ks",
//   password:"1234",
//   email:"k@gmail.com"
// };
// db.User.create(dummy);

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

//Add Mongo
// var mongojs=require("mongojs");
// var databaseUrl = "scraper";
// var collections = ["users","articles","articles2","comments"];
// var db=mongojs(databaseUrl,collections);

// db.on("error",function(error){
//   console.log("Mongo Error: ",error);
// })


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars",handlebars({defaultLayout:"main"}));
app.set("view engine", "handlebars");

app.listen(3000);

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
  db.Article.find({},function(err,found){
    if(err){console.log(err)}
    else{res.render("index",{articles:found})}
  });
});

app.post("/comment/add/:artID",function(req,res){
  var artcl=req.params.artID;
  console.log(artcl," ",req.body.body);
  console.log("loading comment for article ");
  db.Article.update([{"artID":artcl},{$push:{"comments.content":req.body.body}} //,{"aArt":req.params.artID}
    ], function(err,resp){
    if(err) console.log(err)
    else{console.log("success", resp)}
  })
  res.render("index");
})

app.post("/register", redirectHome, function(req,res){
  db.User.create(req.body)
    .then(function(dbUser){
      res.json(dbUser);
    })
    .catch(function(err){
      res.json(err)
    })
})

app.post("/login", redirectHome, function(req,res){
  db.User.findOne(req.body)
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
  db.Article.findOne({"artID":req.params.artID},function(err,resp){
    if(err){console.log(err)}
    else{db.User.articles.insert(resp)}
  });
  console.log("article saved");
  res.redirect("/");
});

app.post("/logout",redirectLogin, function(req,res){
  req.session.destroy(err=>{
    if (err){return res.redirect("/")}
    res.clearCookie();
    res.redirect("/");
  })
});
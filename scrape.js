var cheerio = require("cheerio");
var axios = require("axios");
var handlebars = require("express-handlebars");
var express = require("express");
var app = express();
var moment = require("moment");

app.engine("handlebars",handlebars({defaultLayout:"main"}));
app.set("view engine", "handlebars");
app.listen(3000);


// Tell the console what scrape.js is doing
console.log("Scraping from GlobalResearch Top Stories...");

// Making a request via axios
axios.get("https://www.globalresearch.ca/latest-news-and-top-stories").then(function(response) {
  // Load the HTML into cheerio and save it to a variable
  var $ = cheerio.load(response.data);
  var results = [];

  // With cheerio, find each "a" tag with the "article" and "title" class
  $(".article").each(function(i, element) {

    var title=$(element).children(".title").text();
    var link=$(element).children(".title").children().attr("href");
    var url=$(element).children(".alignleft").children().children().attr("src");
    var date=$(element).children(".date").text();
    var artID=link.substr(link.length-7);
    // Save these results in an object
    if (i<25){
      results.push({
        artID:artID,
        title: title,
        link: link,
        picURL: url,
        artDate: date
      });
    }
  });
  // Log the results once you've looped through each of the elements
  app.get("/",function(req,res){
     res.render("index",{articles:results}) 
  });
  
});

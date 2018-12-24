var cheerio = require("cheerio");
var axios = require("axios");
var handlebars = require("express-handlebars");
var express = require("express");
var app = express();

app.engine("handlebars",handlebars({defaultLayout:"main"}));
app.set("view engine", "handlebars");
app.listen(3000);


// First, tell the console what scrape.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from GlobalResearch Top Stories:" +
            "\n***********************************\n");

// Making a request via axios
axios.get("https://www.globalresearch.ca/latest-news-and-top-stories").then(function(response) {
  // Load the HTML into cheerio and save it to a variable
  var $ = cheerio.load(response.data);
  var results = [];

  // With cheerio, find each "a" tag with the "article" and "title" class
  $(".article").each(function(i, element) {

    var title=$(element).children().text();
    var link=$(element).children(".title").children().attr("href");
    var url=$(element).children(".alignleft").children().children().attr("src");
    // Save these results in an object
    results.push({
      title: title,
      link: link,
      picURL: url
    });
  });
  // Log the results once you've looped through each of the elements
  app.get("/",function(req,res){
     res.render("index",{articles:results}) 
  });
  
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");


// Database libraries
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Database Setup
if (process.env.PORT === undefined) {
  // Local Database connection
  mongoose.connect('mongodb://localhost:27017/blogWebsiteDB');
} else {
  // Cloud Database connection
  let username = "";
  let password = "";
  let clusername = "";
  mongoose.connect('mongodb+srv://' + username + ':' + password + '@' + clusername + '.mongodb.net/blogWebsiteDB');
}

// Database Schema's
const postSchema = new mongoose.Schema({
  postTitle: {
    type: String,
    required: [true, "Title for post is required!"]
  },
  postBody: {
    type: String,
    required: [true, "Post must have content!"]
  }
});
const Post = mongoose.model("Post", postSchema);

// Default posts
const post1 = new Post({
  postTitle: 'Getting Started',
  postBody: 'Welcome to your todolist! Add more posts by heading to /compose! --> http://localhost:3000/compose'
});

const defaultPosts = [post1];


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.redirect("/home");
});

app.post("/", function (req, res) {

  const post = new Post({
    postTitle: req.body.newPostTitle,
    postBody: req.body.newPostBody
  });
  post.save();

  res.redirect("/");
});

app.get("/home", function (req, res) {
  Post.find({}, function (err, posts) {
    if (err) {
      console.log(err);
    } else {
      if (posts.length === 0) {
        Post.insertMany(defaultPosts, function (error, items) {
          if (error) {
            console.log(error);
          } else {
            console.log("Successfully saved default posts to database!");
            res.redirect("/");
          }
        });
      } else {
        res.render("home", {
          content: homeStartingContent,
          posts: posts
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    content: aboutContent
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    content: contactContent
  });
});

app.get("/compose", function (req, res) {
  res.render("compose", {});
});

// Dynamic URL
app.get("/posts/:post", function (req, res) {
  //console.log(req.params.post);

  // Search by post title or post ID
  Post.findOne({
    $or: [{
      '_id': req.params.post
    }, {
      postTitle: req.params.post
    }]
  }, function (err, post) {
    if (err) {
      console.log("Post Not Found!");
      console.log(err);
      res.redirect("/");
    } else {
      console.log("Post Found!");
      res.render("post", {
        post: post
      });
    }

  });
});

app.get('*', function (req, res) {
  res.status(404).send("You're not supposed to be here!");
});

app.listen(process.env.PORT || 3000, function () {
  console.log(process.env.PORT);
  if (process.env.PORT === undefined) {
    console.log("Server is running on port 3000.");
  } else {
    console.log("Server is running on port " + process.env.PORT + ".");
  }
});
var methodOverride  = require("method-override"),
    expressSanitizer= require("express-sanitizer"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    express         = require("express"),
    app             = express();
    
// APP config
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTful ROUTES

// INDEX route
app.get("/", function(req, res){
    res.redirect("/blogs");
})
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, foundBlogs){
        if(err){
            console.log("Error!");
        } else {
            res.render("index", {blogs: foundBlogs});
        }
    });
});

// NEW route
app.get("/blogs/new", function(req, res){
    res.render("new");
})

// CREATE route.  First create blog and then redirect
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err);
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// SHOW route. Pull one blog entry at a time
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   })
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});        
       }
   });
});


// UPDATE route - modify the values
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DESTROY route - delete
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
})

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Blog App server has started!") 
});

    
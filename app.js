//jshint esversion:6


const port                  = 3000
const express               = require('express')
const bodyParser            = require("body-parser");
const ejs                   = require("ejs");
const mongoose              = require("mongoose")
const bcrypt                = require("bcrypt")
const session               = require("express-session")
const saltRounds            = 10

const app = express()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: 'My secret',
    resave: false,
    saveUninitialized: true,
    
  }))



mongoose.connect("mongodb://localhost:27017/first_demo", {
    useNewUrlParser: true,
  useUnifiedTopology: true 
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    email: {type: String},
    first_name : {type: String, min: 2, max: 60,required: [true, 'First name is required!'] },
    last_name : {type: String, min: 2, max: 60,required: [true, 'Last name name is required!'] },
    password : {type: String},
});
const contentSchema = new mongoose.Schema ({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
    content : String,
    title: {type: String, max: 100}
});
  

const User = new mongoose.model("User", userSchema);
const Content = new mongoose.model("Content", contentSchema);




//GET ROUTES
app.get("/", (req,res)=>{
    res.redirect("/home")
})

app.get('/home', (req, res) => {
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    res.render("home", {user:user})
}
);
app.get('/contents', (req, res) => {
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    Content.find((err,result)=>{
        if (err){
            console.log(err)
        }
        else if (result){
            
            res.render("contents", {user: user, contents : result});
        }
        else{
            console.log("Content not found");
            res.redirect("/")
        }
    });
    
}
);

app.get('/login', (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    res.render('login', {user:user})
});

app.get('/register', (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    res.render("register", {user:user})
});

app.get('/create', (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    if(req.session.isAuthenticated){
        res.render("create", {user:user})   
    }
    else{
        res.redirect("/login")
    }
    
});

app.get("/content/:content_id", (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    Content.findOne({_id :mongoose.Types.ObjectId(req.params.content_id) }, (err,result)=>{
        if(err){
            console.log(err);
        }else if (result){
            console.log(result)
            res.render("content", {user:user, result: result});
        }
        else{
            res.redirect("/contents")
        }
    });
    // res.render("content", {user:user});
    
});
app.get("/update/:content_id", (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    Content.findOne({_id :mongoose.Types.ObjectId(req.params.content_id) }, (err,result)=>{
        if(err){
            console.log(err);
        }else if (result){
            console.log(result)
            res.render("update_content", {user:user, result: result});
        }
        else{
            res.redirect("/contents")
        }
    });
    // res.render("content", {user:user});
    
});

app.get("/delete/:content_id", (req,res)=>{
    if(req.session.isAuthenticated){
        Content.findByIdAndRemove(req.params.content_id, (err,result)=>{
            if(err){
                console.log(err);
            }
            else if(result){
                res.redirect("/contents")
            }
            else{
                console.log("Failed");
            }
        });
        
    }
    else{
        res.redirect("/login")
    }
})

app.get("/logout",(req,res)=>{
    
    req.session.isAuthenticated = false;
    res.redirect("/home")

})


app.get("/profile", (req,res)=>{
    user = {
        isAuthenticated : req.session.isAuthenticated,
        email: req.session.email,
        id : req.session.user_id,
        first_name : req.session.first_name,
        last_name : req.session.last_name
    }
    res.render("profile", {user:user})
})






//POST ROUTES
app.post("/register", (req, res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email : req.body.email,
            first_name : req.body.firstname,
            last_name : req.body.lastname,
            password : hash
        });
        newUser.save((err,user)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log(user)
                req.session.isAuthenticated = true;
                if(req.session.isAuthenticated){
                    req.session.user_id = user._id;
                    req.session.email = user.email;
                    req.session.first_name = user.first_name,
                    req.session.last_name = user.last_name
                }
                user = {
                    isAuthenticated : req.session.isAuthenticated,
                    email: req.session.email,
                    id : req.session.user_id,
                    first_name : req.session.first_name,
                    last_name : req.session.last_name
                }
                res.render("home",{user:user});
            }
        });
    });
    
});

app.post("/login", (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email}, (err,user)=>{
        if(err){
            console.log(err);
        }
        else if(user){
            bcrypt.compare(password, user.password, function(err, result) {
                if(result == true){
                    req.session.isAuthenticated = true;
                    if(req.session.isAuthenticated){
                        req.session.user_id = user._id;
                        req.session.email = user.email;
                        req.session.first_name = user.first_name,
                        req.session.last_name = user.last_name
                    }
                    console.log(req.session.isAuthenticated);
                    res.redirect("home")
                } 
                else{
                    res.redirect("/login")
                }
            });
        }
        else{
            res.redirect("/login")
        }
    })
});

app.post("/compose", (req,res)=>{
    if(req.session.isAuthenticated){
        const new_content = Content({
            user_id : req.session.user_id,
            title :req.body.title,
            content : req.body.compose
        });
        new_content.save((err,contents)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/contents");
            }
        })
        
    }
    else{
        res.redirect("/login")
    }
})


app.post("/update/:content_id", (req,res)=>{
    if(req.session.isAuthenticated){
        Content.findByIdAndUpdate(req.params.content_id, { $set: { title: req.body.title,content: req.body.content }}, (err,result)=>{
            if(err){
                console.log(err);
            }
            else if(result){
                res.redirect("/content/"+result.id);
            }
            else{
                console.log("Failed");
            }
        });
        
    }
    else{
        res.redirect("/login")
    }
})









app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
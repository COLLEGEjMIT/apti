const express = require('express');
const app = express();
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const Question = require('./models/Question');
const User = require('./models/User');

app.use(express.static(__dirname + '/public'));
// DB Config
const db = require('./config/keys').mongoURI;

// Passport Config
require('./config/passport')(passport);

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  
// EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

//express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

  
// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.get('/dashboard',function(req,res) {
  res.render('dashboard')
});
app.get('/StudentExam',function(req,res) {
  res.render('StudentExam')
});
app.get('/Quiz/',function(req,res) {
  var perPage = 1;
      var page = req.params.page || 1;
  
    Question.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,data){
                  if(err) throw err;
            Question.countDocuments({}).exec((err,count)=>{          
    res.render('Quiz', {  
    records: data,
    current: page,
    count:count,
    pages: Math.ceil(count / perPage) });
    
  });
  
    });

  });


app.get('/Quiz/:page',function(req,res) {
  var perPage = 1;
      var page = req.params.page || 1;
  
    Question.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,data){
                  if(err) throw err;
            Question.countDocuments({}).exec((err,count)=>{          
    res.render('Quiz', {  
    records: data,
    current: page,
    pages: Math.ceil(count / perPage) });
    
  });
    });
});
app.post("/Quiz/:id/:correctanswer",async(req,res)=>{
 try{
 const quesid = req.params.id;
  const corrans=req.params.correctanswer;
  console.log(corrans);
  const choice=req.body.choice;
console.log(choice);
   console.log(quesid);
console.log(req.user);
User.findById(req.user.id,function(err,foundUser){
  if(err){
    console.log(err)
  }
  else{
    if(foundUser){
      if(corrans===choice){
        console.log("matched");
        if(foundUser.Questionsid.includes(quesid)){
          console.log("already exists");
           res.redirect("/Quiz");
        }
        else{
           foundUser.correctAnswers.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.save(function(){
            res.redirect("/Quiz");
           });
        }
      }
       else if(corrans!=choice){
          if(foundUser.Questionsid.includes(quesid)){
          console.log("already exists");
           res.redirect("/Quiz");
        }
        else{
            foundUser.wrongAnswer.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.save(function(){
            res.redirect("/Quiz")
           });
        }

         
      }
    
     
     
    }
  }
});
}
 catch (error) {
        res.status(404).send(error);
     }
});


app.post("/Quiz/:page/:id/:correctanswer",function(req,res){
  try{
 const quesid = req.params.id;
 const corrans=req.params.correctanswer;
  console.log(corrans);
  const choice=req.body.choice;
console.log(choice);
   console.log(quesid);
console.log(req.user);
User.findById(req.user.id,function(err,foundUser){
  if(err){
    console.log(err)
  }
  else{
     if(foundUser){
      if(corrans===choice){
        console.log("matched");
        if(foundUser.Questionsid.includes(quesid)){
          console.log("already exists");
           res.redirect("/Quiz");
        }
        else{
           foundUser.correctAnswers.push(choice);
           foundUser.Questionsid.push(quesid);
           foundUser.save(function(){
            res.redirect("/Quiz");
           });
        }
      }
       else if(corrans!=choice){
        if(foundUser.Questionsid.includes(quesid)){
          console.log("already exists");
           res.redirect("/Quiz");
        }
        else{
            foundUser.wrongAnswer.push(choice);
           foundUser.Questionsid.push(quesid);
          foundUser.save(function(){
            res.redirect("/Quiz");
           });
        }
      }
    
     
     
    }
  }
});

 
 }
 catch (error) {
        res.status(404).send(error);
     }
  });


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));

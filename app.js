const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./Models/campground');
const ejsMate = require('ejs-mate');
const { redirect } = require("express/lib/response");

mongoose.connect('mongodb://localhost:27017/yelpcamp', { 
    useNewUrlParser: true,
    useUnifiedTopology: true });

//db is defined to check for connection

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database Connected");
});

app.engine('ejs',ejsMate);

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

//express to send the body from the form submitted

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/campgrounds', catchAsync( async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}))

//New Route

app.get('/campgrounds/new', (req,res)=>{
    res.render('campgrounds/new')
})

//Post request when submitting or adding a new campground

app.post('/campgrounds', catchAsync( async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//Show Route

app.get('/campgrounds/:id', catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
    

}))

//edit route

app.get('/campgrounds/:id/edit', catchAsync( async(req,res)=>{

    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})

}))

//Update route

app.put('/campgrounds/:id', catchAsync( async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

//Delete Route

app.delete("/campgrounds/:id", catchAsync( async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError("Page Not Found", 404))
})

//Whenever we hit an error this middleware will always run last
app.use((err,req,res,next)=>{
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);

})



app.listen(3000, ()=>{
    console.log("Serving on port 3000");
})
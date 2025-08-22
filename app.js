const express = require('express');
const path = require('path');
const app = express();




app.set("view engine", 'ejs')
app.use(express.urlencoded())
app.use(express.static(path.join(__dirname, "public")))


app.get('/', function(req,res){
    res.render('startpage.ejs')
})

app.get('/login', function(req,res){
    res.render('login.ejs')
})


app.listen(10000, function(){
    console.log("Server Starting on Port 3000")
})





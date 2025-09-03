
const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./views/models/login');
const cookieParser = require('cookie-parser');




app.set("view engine", 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());



function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, "SECRET_KEY");
        req.user = decoded; 
        next();
    } catch (err) {
        return res.redirect('/login');
    }
}


app.get('/', (req, res) => res.render('startpage.ejs'));
app.get('/login', (req, res) => res.render('login.ejs'));


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(400).send("❌ User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("❌ Invalid credentials");
        }

        
        if (user.role === "admin") {
            const token = jwt.sign(
                { id: user._id, role: user.role, username: user.username }, 
                "SECRET_KEY",
                { expiresIn: "1h" }
            );
            res.cookie("token", token, { httpOnly: true });
            return res.redirect("/admin-dashboard");
        } else if(user.role === "user"){
            const token = jwt.sign({ id: user._id, role: user.role, username: user.username}, "SECRET_ADMINUSER", {  expiresIn: "4h" })

            res.cookie("admintoken", token, { httpOnly: true })
            return res.redirect('/UserChat')
        } else{
            res.status(500).send("Whom you are Your Credentials doesn't match")
        }
    } catch (err) { 
        console.error(err);
        res.status(500).send("⚠️ Server error");
    }
});

app.get(['/admin-dashboard','/admin-dashboard/:page'], authMiddleware, async (req, res) => {
    try {
        const totalusers = await User.countDocuments();
        const page = req.params.page || "dashboard";

        let users = [];
        if (page === 'users') {
            users = await User.find();
        }

        // fetch current user from DB
        const currentUser = await User.findById(req.user.id);

        res.render("AdminDashboard", {
            user: currentUser.username,
            // userProfilePic: currentUser.profilePic, // send profilePic to EJS
            totalusers,
            page,
            users
        });
    } catch (err) {
        console.log("Error Occured", err);
        res.status(500).send("An Error Occured");
    }
});




app.get(['/admin-dashboard','/admin-dashboard/:page'], authMiddleware, async (req, res) => {
    try{
        const totalusers = await User.countDocuments();
        const page = req.params.page || "dashboard";

        let users = []
        if(page === 'users'){
            users = await User.find();
        }

        res.render('AdminDashboard', {
             user: req.user.username,
              totalusers,
              page,
              users
            
            })



    } catch(err){
        console.log("Error Occured");
        res.status(500).send("An Error Occured")
        
    }
});



 
app.get('/UserChat', async  function(req,res){
    res.render("UserChat.ejs")
})




async function createAdmin() {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({ username: "admin", password: hashedPassword, role: "admin" });
        console.log("✅ Admin created with username: admin / password: admin123");
    }
}
createAdmin();





app.listen(process.env.PORT || 3000, () => {
    console.log("✅ Server running on Port", process.env.PORT || 3000);
});

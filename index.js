require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passport-config");

initializePassport(
  passport,
  (email) => users.find((user) => user.email == email),
  (id) => users.find((user) => user.id == id)
);

const app = express();

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const users = [];

app.get("/", isAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    // if successful redirect  to login
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    successMessage: "success",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function isNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/");
  next();
}
app.listen(3000);

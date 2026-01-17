const express = require("express");
const router = express.Router({});
const User = require("../models/user");
const asyncWrap = require("../utils/asyncWrap.js");
const passport = require("passport");

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post(
  "/signup",
  asyncWrap(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.flash("success", "Welcome to DriftInn");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  asyncWrap(async (req, res) => {
    req.flash("success","Loged in!\nWelcome to DriftInn!");
    res.redirect("/listings");
  })
);

module.exports = router;

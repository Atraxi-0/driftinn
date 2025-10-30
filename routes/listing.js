const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const asyncWrap = require("../utils/asyncWrap.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../ExpressError");
const mongoose = require("mongoose");


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};


//main
router.get(
  "/",
  asyncWrap(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

//Create new
router.get("/new", (req, res) => {
  res.render("listings/new");
});

//Post Create new
router.post(
  "/",
  validateListing,
  asyncWrap(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    // console.log(listing);
  })
);

//Show
router.get(
  "/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid listing id");
    }
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show", { listing });
  })
); 


//Update
router.get(
  "/:id/edit",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  })
);

router.put(
  "/:id",
  validateListing,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
  })
);

//Delete
router.delete(
  "/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
  })
);

module.exports = router;
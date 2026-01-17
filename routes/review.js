const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/asyncWrap.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../ExpressError");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

//Create Reviews
router.post(
  "/",
  validateReview,
  asyncWrap(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review Added");
    res.redirect(`/listings/${id}`);
  })
);

//Delete Reviews
router.delete(
  "/:reviewId",
  asyncWrap(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;

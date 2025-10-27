const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./ExpressError");
const asyncWrap = require("./utils/asyncWrap.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("MongoDB connected");
}

app.get("/", (req, res) => {
  res.send("Hi, I am root!");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200000,
//         location: "Calangute, Goa",
//         country: "India",

//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

//main
app.get(
  "/listings",
  asyncWrap(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

//Create new
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

//Show
app.get(
  "/listings/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid listing id");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show", { listing });
  })
);

//Update
app.get(
  "/listings/:id/edit",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  })
);

app.put(
  "/listings/:id",
  validateListing,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
app.delete(
  "/listings/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
  })
);

//Reviews
app.post("listings/:id/reviews", validateReview, asyncWrap (async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push[newReview];
  await newReview.save();
  await listing.save();

  console.log("new review saved");
  res.send("new review saved");
}));

app.post(
  "/listings",
  validateListing,
  asyncWrap(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    // console.log(listing);
  })
);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  console.dir(err);
  res.status(status).render("listings/error", { message });
  //   res.status(status).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

main()
    .then(() => {
         console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main( ) {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB connected");
}

app.get("/", (req, res) => {
    res.send("Hi, I am root!");
});

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
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
});

//Create new
app.get("/listings/new",  (req, res) => {
     res.render("listings/new");
});


//Visit
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
});

//Update
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
});

app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,req.body.listing);
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
});

app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    // console.log(listing);
})

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

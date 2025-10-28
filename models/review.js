const mongoose = require('mongoose');
const { create } = require('./listing');
const { required } = require('joi');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    });

    module.exports = mongoose.model('Review', reviewSchema);
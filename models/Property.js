const mongoose = require('mongoose');

const propertySchema = mongoose.Schema(
    {
        // _id => auto created
        userId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        
        pictures: {
            type: Array,
            required: true
        },
        facility: {
            bedrooms: {
                type: Number,
                required: true,
            },
            carParks: {
                type: Number,
                required: true,
            },
            bathrooms: {
                type: Number,
                required: true,
            },
        },
    },
    {
        
    },
    {minimize: false},
    {timestamp: true } // show time created/updated
);

// crete a data table in Mongobd
const property = mongoose.model("Property", propertySchema);

module.exports = property;
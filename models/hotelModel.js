const mongoose = require('mongoose');

const addressObjSchema = new mongoose.Schema({
    street1: String,
    city: String,
    state: String,
    country: String,
    postalcode: String,
    address_string: String
});

const rankingDataSchema = new mongoose.Schema({
    geo_location_id: String,
    ranking_string: String,
    geo_location_name: String,
    ranking_out_of: String,
    ranki: String,
});

const reviewRatingCountSchema = new mongoose.Schema({
    1: String,
    2: String,
    3: String,
    4: String,
    5: String
});

const subratingsObjectSchema = new mongoose.Schema({
    name: String,
    localized_name: String,
    rating_image_url: String,
    value: String
});

const subratingsSchema = new mongoose.Schema({
    0: subratingsObjectSchema,
    1: subratingsObjectSchema,
    2: subratingsObjectSchema,
    3: subratingsObjectSchema,
    4: subratingsObjectSchema,
    5: subratingsObjectSchema
});

const categorySchema = new mongoose.Schema({
    name: String,
    localized_name: String
});

const hotelSchema = new mongoose.Schema({
    // _id: Object,
    location_id: String,
    name: String,
    description: String,
    web_url: String,
    address_obj: addressObjSchema,
    ancestors: Array,
    latitude: String,
    longitude: String,
    timezone: String,
    phone: String,
    write_review: String,
    ranking_data: rankingDataSchema,
    rating: String,
    rating_image_url: String,
    num_reviews: String,
    review_rating_count: reviewRatingCountSchema,
    subratings: subratingsSchema,
    photo_count: String,
    see_all_photos: String,
    price_level: String,
    amenities: Array,
    parent_brand: String,
    category: categorySchema,
    subcategory: Array,
    styles: Array,
    neighborhood_info: Array,
    trip_types: Array,
    awards: Array,
    reviews: Array
}, {
    versionKey: false, // Disable the version key
});

const Hotel = mongoose.model('Hotel', hotelSchema, 'tripadvisor_hotels');

module.exports = Hotel;

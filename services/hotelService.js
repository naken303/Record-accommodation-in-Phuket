const Hotel = require('../models/hotelModel');

exports.getHotelById = async (locationId) => {
    try {
        const hotel = await Hotel.findById(locationId);

        if (!hotel) {
            throw new Error('Hotel not found');
        }

        return hotel;
    } catch (error) {
        throw new Error('Error fetching hotel');
    }
};

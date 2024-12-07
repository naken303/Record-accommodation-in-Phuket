const Hotel = require("../models/hotelModel");

exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().select({_id: 0});
        res.json(hotels)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        const {location_id} = req.body;
        const deletes = await Hotel.deleteOne({location_id: location_id})
        if (deletes) {
            res.status(200).json({ message: 'Delete Success' })
        } else {
            res.status(401).json({message: "Delete not success"})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.searchHotel = async (req, res) => {
    try {
        const hotels = await Hotel.find({name: {'$regex': req.params.name, '$options': 'i'}});
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({location_id: req.params.id});

        if (hotel) {
            res.status(200).json(hotel);
        } else {
            res.status(401).json({message: "Not found hotel."})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.updateOne({location_id: req.params.id}, { $set: req.body});

        if (hotel) {
            res.status(200).json({message: "Update successful."});
        } else {
            res.status(401).json({message: "Update fail please try again."})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.newHotel = async (req, res) => {
    try {
        const newHotel = new Hotel(req.body);
        await newHotel.save();

        if (newHotel) {
            res.status(200).json({message: "Add new hotel successful."});
        } else {
            res.status(401).json({message: "Add new hotel fail please try again."})
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

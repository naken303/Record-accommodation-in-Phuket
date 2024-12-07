const express = require('express');
const hotelController = require('../controllers/hotelController');

const router = express.Router();

// Versioning the API
const API_VERSION = 'v1';

router.get(`/${API_VERSION}/allHotels`, hotelController.getAllHotels);
router.get(`/${API_VERSION}/getHotel/:id`, hotelController.getOneHotel);
router.put(`/${API_VERSION}/updateHotel/:id`, hotelController.updateHotel);
router.post(`/${API_VERSION}/newHotel/`, hotelController.newHotel);
router.delete(`/${API_VERSION}/deleteHotel`, hotelController.deleteHotel);
router.get(`/${API_VERSION}/search/:name`, hotelController.searchHotel)



module.exports = router;

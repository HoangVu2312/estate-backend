const router = require('express').Router();
const Property = require('../models/Property');
const User = require('../models/User');
const {verifyToken} = require('../authorization/authorization')


// get properties based on current page (pagination)
router.get('/properties', async (req, res) => {
    try {
      const { page } = req.query;
      const itemsPerPage = 12; // Adjust this based on your requirements
  
      // Calculate the skip value based on the page number
      const skip = (page - 1) * itemsPerPage;
  
      // Fetch properties from the database with pagination
      const properties = await Property.find({})
        .skip(skip)
        .limit(itemsPerPage);
  
      // Calculate total number of pages
      const totalProperties = await Property.countDocuments();
      const totalPages = Math.ceil(totalProperties / itemsPerPage);
  
      // Send the response
      res.json({ properties, totalPages });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // get home-page properties (Axios)
router.get('/home', async(req, res) => {
    try {
        const sort = {'_id': -1}  // re-order properties
        const properties = await Property.find().sort(sort);
        res.status(200).json(properties);
    } catch(e) {
        res.status(400).send(e.message);
    }
})



// Create property (RTK-querry)
router.post('/', verifyToken, async(req, res) => {
    try {
        // destruc data
        const {title, description, price, address, city, country, likes, images: pictures, facility} = req.body.property;
        const {userId} = req.body;
        const user = await User.findById(userId)
        if(!user.isOwner) return res.status(401).json("You don't have permission");

        await Property.create({userId, title, description, price, address, city, likes, country, likes, pictures, facility});
          const properties = await Property.find();
          res.status(201).json(properties)
    } catch(e) {
        res.status(400).send(e.message);
    }
})


// Delete a prop (RTK-querry)
router.delete('/:id',verifyToken, async (req, res)=> {
    // destruct data
    const {propertyId} = req.params;  // id of prop
    const {userId} =  req.body; // id of user deleting

    try {
        // check if user is an owner and own that prop
        const user = await User.findById(userId)
        const deleteProp = await Property.findById(propertyId)
        if(!user.isOwner && user._id !== deleteProp.userId) return res.status(401).json("You don't have permission");
        // delete
        await Property.findByIdAndDelete(propertyId);
        const properties = await Property.find();
        res.status(201).json(properties)
    } catch(e) {
        res.status(400).send(e.message);
    }
});

// Get one property and some poperties in the same city (propertyPage) (Axios)
router.get('/:id', async(req, res) => {
    const {id} = req.params;
     try {
        const property = await Property.findById(id);
        const user_id = property.userId;
        const user = await User.findById(user_id)

        res.status(201).json({user, property})
     } catch (e) {
        res.status(400).send(e.message);
     }
});



// Get properties in the same city (Axios)
router.get('/city/:city', async (req, res) => {
    const {city} = req.params;
    try {
        let properties;
        const sort = {'_id': -1};

        properties =  await Property.find({ city: { $regex: new RegExp(city, 'i') } }).sort(sort); // use $regex to make first letter uppercase
        res.status(200).json(properties);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

// ---- Favorite-----//

// Add or remove favorite
router.post('/add-remove-favorite', async(req, res) => {
    try {
        // destruct props id and userId
        const {userId, propertyId} = req.body;

        // find the  prop and user to check if user already liked it
        const user = await User.findById(userId)
        const userFav = user.favorite;

        
        if (userFav[propertyId]) {
            delete userFav[propertyId] // remove from user fav
            userFav.total -= 1;
        } else {
            userFav[propertyId] = 1;
            userFav.total += 1;
        }
        user.markModified('favorite');

        await user.save();

        res.status(200).json(user);


    } catch (err) {
        res.status(400).send(err.message);
    }
})

module.exports = router;

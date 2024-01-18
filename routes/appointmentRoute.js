const router = require('express').Router();

const Property = require('../models/Property');
const User = require('../models/User');
const Appointment = require('../models/Appointment');


// create an appointment
router.post('/', async (req, res) => {
  //  const io = req.app.get('socketio');
    

    try {
    const {clientId, ownerId, propertyId, date} = req.body;
    const client = await User.findById(clientId)
    const owner = await User.findById(ownerId)
    const property = await Property.findById(propertyId)
 
    // create a new appointment
    const appointment = new Appointment({ clientId, ownerId, propertyId, date});
    await appointment.save();

    // create notification => send to owner
    const notification = {status: 'unread', message: `${client.name} had booked a appointment at ${property.title} at ${date}`, time: new Date()};
    // io.sockets.emit('new-appointment', notification, ownerId); 
    owner.notifications.unshift(notification);
    owner.markModified('notifications'); 
    await owner.save()

    // return 
    res.status(200).json(appointment)

    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get all appointments for an owner (Axios)
router.get('/:userId', async(req, res)=> {

  const {userId} = req.params;
  // console.log(userId)

  try {
    // Use .exec() to get a promise from Appointment.find()
    const appointments = await Appointment.find({ ownerId: userId });

    // Use map to find bookedClients for each appointment
    const bookedClients = await Promise.all(appointments.map(async (appointment) => {
      const client = await User.findById(appointment.clientId).exec();
      return client;
    }));

    res.status(200).json({ appointments, bookedClients });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
})


module.exports = router;

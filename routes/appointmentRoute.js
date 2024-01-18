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

// get all appointment for a client
router.get('/client/:userId', async(req, res)=> {

  const {userId} = req.params;
  // console.log(userId)

  try {
    // Use .exec() to get a promise from Appointment.find()
    const appointments = await Appointment.find({ clientId: userId });

    // Use map to find properties for each appointment
    const bookedProperties = await Promise.all(appointments.map(async (appointment) => {
      const property = await Property.findById(appointment.propertyId).exec();
      return property;
    }));

    res.status(200).json({ appointments, bookedProperties });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
})

// client delete an appointment
router.delete('/:appointmentId', async (req, res)=> {
  // destruct data
  const {appointmentId} = req.params;  // id of appointment
  const {userId} =  req.body; // id of user deleting

  try {
      // check if user has that appointment
      const user = await User.findById(userId)
      const deleteAppointment = await Appointment.findById(appointmentId)

      // if(user._id !== deleteAppointment.clientId) return res.status(401).json("You don't have permission");
      // delete
      await Appointment.findByIdAndDelete(appointmentId);
      const appointments = await Appointment.find();
      res.status(201).json(deleteAppointment.clientId)
  } catch(e) {
      res.status(400).send(e.message);
  }
});


module.exports = router;

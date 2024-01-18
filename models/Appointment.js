
const mongoose = require('mongoose');
const AppointmentSchema = mongoose.Schema({

  clientId: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  },

  date: {
    type: String,
    require: true,
  },

}, {minimize: false});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
const router = require('express').Router();
const User = require('../models/User');
const jwt = require("jsonwebtoken");



// signup 
router.post('/signup', async(req, res)=> {
  // destruct data from request body
  const {name, email, password, isOwner} = req.body;

  try {
    // directly create new User from data received and send back that new User 
    const user = await User.create({name, email, password, isOwner}); // create is bult-in function
    
    //create token for user
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
    res.json({user, token})
    
  } catch (e) {
    // check if User alrady exist
    if(e.code === 11000) return res.status(400).send('Email already exists');

    // send server error
    res.status(400).send(e.message)
  }
})


// login
router.post('/login', async(req, res) => {
  const {email, password} = req.body;
  try {
    // get that user from db based on received email + password
    const user = await User.findByCredentials(email, password); // manually define function in User model

    //create token for user
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
    res.json({user, token})
  } catch (e) {
    res.status(400).send(e.message)
  }
});

// get users;
router.get('/', async(req, res)=> {
    try {
      const users = await User.find({ isOwner: false });
      res.json(users);
    } catch (e) {
      res.status(400).send(e.message);
    }
})

// Add the message to specify Owner
router.post('/message', async(req, res) => {
  try {

    const {firstName, lastName, email, phone, message} = req.body.clientMessage; 
    const {ownerId} = req.body;
    const user = await User.findById(ownerId)
   
    const messageObj = {status: 'unread', client: `${firstName}  ${lastName}`,mail:`${email}`,phoneNumber:`${phone}`,msg: `${message}` ,time: new Date()};
    user.messages.unshift(messageObj);
    user.markModified('notifications'); 
    await user.save()

    res.json({user})
  } catch (e) {
    res.status(400).send(e.message)
  }
});




// change notification status
router.post('/:id/updateNotifications', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read"
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message)
  }
})

module.exports = router;
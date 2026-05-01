require('dotenv').config();
const mongoose = require('mongoose');
const DeliveryAgent = require('../models/DeliveryAgent');

const deliveryUsers = [
  {
    name: 'Rohit Courier',
    username: 'delivery.rohit',
    phone: '+919876543210',
    password: 'delivery123',
    vehicleType: 'bike',
    zone: 'South Nagpur',
    isActive: true,
  },
  {
    name: 'Saurabh Rider',
    username: 'delivery.saurabh',
    phone: '+919701112233',
    password: 'delivery123',
    vehicleType: 'scooter',
    zone: 'West Nagpur',
    isActive: true,
  },
];

async function createDeliveryUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const user of deliveryUsers) {
      const existing = await DeliveryAgent.findOne({ username: user.username });

      if (existing) {
        existing.name = user.name;
        existing.phone = user.phone;
        existing.vehicleType = user.vehicleType;
        existing.zone = user.zone;
        existing.isActive = user.isActive;
        existing.password = user.password;
        await existing.save();
        console.log(`Updated ${user.username}`);
      } else {
        await DeliveryAgent.create(user);
        console.log(`Created ${user.username}`);
      }
    }

    console.log('Delivery users ready');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create delivery users:', err.message);
    process.exit(1);
  }
}

createDeliveryUsers();

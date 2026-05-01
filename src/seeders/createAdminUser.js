require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'dietly.ngp@gmail.com';
const ADMIN_PASSWORD = 'DietlyAdmin@2026';

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: 'Dietly Admin',
      email: ADMIN_EMAIL,
      password: hash,
      role: 'admin',
      phone: '9011154118',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin user upserted: ${admin.email} (role: ${admin.role})`);
  await mongoose.disconnect();
}

createAdmin().catch(err => { console.error(err); process.exit(1); });

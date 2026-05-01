require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const updatedPlans = [
  {
    slug: 'basic',
    name: 'Basic',
    price: 1299,
    period: '',
    icon: 'Zap',
    description: 'One meal daily support for your fitness goals.',
    popular: false,
    sortOrder: 1,
    isActive: true,
    features: [
      'One Meal Daily Delivery',
      'Fixed Time Slot (Morning/Evening)',
      'Common Diet Plan for Weight Loss/Gain',
      'Exclusive Gym Community Invite',
    ],
  },
  {
    slug: 'standard',
    name: 'Standard',
    price: 1499,
    period: '',
    icon: 'Star',
    description: 'Balanced plan with personalization and flexibility.',
    popular: true,
    sortOrder: 2,
    isActive: true,
    features: [
      'One Meal Daily',
      'Customizable Time Slot',
      'Personal Diet Plan',
      '1 Time Meal Shuffle Allowed',
      'Monthly 2 Free Deliveries for Individual Orders (outside subscription)',
      'Exclusive Gym Community Invite',
    ],
  },
  {
    slug: 'premium',
    name: 'Premium',
    price: 2999,
    period: 'onwards',
    icon: 'Crown',
    description: 'Advanced nutrition coverage for full-day fitness support.',
    popular: false,
    sortOrder: 3,
    isActive: true,
    features: [
      'Daily Meals Delivery as per Diet Plan',
      'Fully Customized Diet Plan Based on Goals',
      'Customizable Time Slot',
      '2 Free Deliveries for Individual Random Orders',
      'Fitness Assistance & Guidance',
      'Full-Day Meal Coverage (Breakfast to Dinner)',
      'Exclusive Gym Community Invite',
    ],
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const plan of updatedPlans) {
      await Plan.findOneAndUpdate(
        { slug: plan.slug },
        plan,
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
      console.log(`Upserted plan: ${plan.name}`);
    }

    await Plan.updateMany(
      { slug: { $nin: updatedPlans.map((p) => p.slug) } },
      { $set: { isActive: false } }
    );

    console.log('Plans update completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating plans:', err.message);
    process.exit(1);
  }
};

run();

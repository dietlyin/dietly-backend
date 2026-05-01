require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');

const newTestimonials = [
  {
    name: 'Prasheek Thulkar',
    role: 'Gym Trainer & Athlete',
    text: 'The Premium plan is excellent—full-day meals that perfectly match my macros. Even my coach was surprised by the progress. Simple, effective, and worth it.',
    rating: 5,
    avatar: '🏋️',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Sankalp Meshram',
    role: 'CrossFit Athlete',
    text: 'The variety is what keeps me hooked. Different meals every day, all hitting 40g+ protein. Like having a personal chef.',
    rating: 5,
    avatar: '🤸',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Aatish Sontakke (Shanky)',
    role: 'Owner, Growth Fitness',
    text: "As a gym owner, I've tried many diet plans, but Dietly stands out. I lost 8 kg in 3 months while building lean muscle—and the food is genuinely delicious. Easy to follow and highly effective.",
    rating: 5,
    avatar: '💪',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Poonam Jain',
    role: 'Yoga Instructor',
    text: 'As a yoga instructor, nutrition is everything. Dietly meals are clean, balanced, and show up on time every single day.',
    rating: 5,
    avatar: '🧘‍♀️',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Sneha Shambharkar',
    role: 'Marathon Runner',
    text: 'I used to spend hours meal prepping. Now I just open the box and eat. My performance has improved significantly.',
    rating: 5,
    avatar: '🏃‍♀️',
    isActive: true,
    sortOrder: 5,
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Testimonial.deleteMany({});
    console.log('🗑️  Cleared existing testimonials');

    await Testimonial.insertMany(newTestimonials);
    console.log('🌱 Inserted 5 new testimonials:');
    newTestimonials.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} — ${t.role}`));

    console.log('\n✅ Testimonials updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();

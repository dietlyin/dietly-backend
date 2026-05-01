require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Meal = require('../models/Meal');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');
const Stat = require('../models/Stat');
const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');

const plans = [
  {
    name: 'Basic',
    slug: 'basic',
    price: 1299,
    period: '',
    icon: 'Zap',
    description: 'One meal daily support for your fitness goals.',
    popular: false,
    sortOrder: 1,
    features: [
      'One Meal Daily Delivery',
      'Fixed Time Slot (Morning/Evening)',
      'Common Diet Plan for Weight Loss/Gain',
      'Exclusive Gym Community Invite',
    ],
  },
  {
    name: 'Standard',
    slug: 'standard',
    price: 1499,
    period: '',
    icon: 'Star',
    description: 'Balanced plan with personalization and flexibility.',
    popular: true,
    sortOrder: 2,
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
    name: 'Premium',
    slug: 'premium',
    price: 2999,
    period: 'onwards',
    icon: 'Crown',
    description: 'Advanced nutrition coverage for full-day fitness support.',
    popular: false,
    sortOrder: 3,
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

const meals = [
  {
    name: 'Grilled Chicken Bowl',
    category: 'muscle-gain',
    calories: 520,
    protein: '45g',
    carbs: '38g',
    fat: '12g',
    emoji: '🍗',
    tag: 'High Protein',
    tagColor: 'green',
    isVegetarian: false,
    sortOrder: 1,
  },
  {
    name: 'Quinoa Power Salad',
    category: 'weight-loss',
    calories: 320,
    protein: '18g',
    carbs: '42g',
    fat: '8g',
    emoji: '🥗',
    tag: 'Low Cal',
    tagColor: 'blue',
    isVegetarian: true,
    sortOrder: 2,
  },
  {
    name: 'Salmon & Brown Rice',
    category: 'balanced',
    calories: 480,
    protein: '38g',
    carbs: '45g',
    fat: '14g',
    emoji: '🐟',
    tag: 'Omega Rich',
    tagColor: 'cyan',
    isVegetarian: false,
    sortOrder: 3,
  },
  {
    name: 'Keto Avocado Plate',
    category: 'keto',
    calories: 410,
    protein: '22g',
    carbs: '8g',
    fat: '35g',
    emoji: '🥑',
    tag: 'Keto',
    tagColor: 'purple',
    isVegetarian: true,
    sortOrder: 4,
  },
  {
    name: 'Egg White Omelette',
    category: 'weight-loss',
    calories: 280,
    protein: '32g',
    carbs: '6g',
    fat: '10g',
    emoji: '🍳',
    tag: 'Low Cal',
    tagColor: 'yellow',
    isVegetarian: true,
    sortOrder: 5,
  },
  {
    name: 'Paneer Tikka Bowl',
    category: 'muscle-gain',
    calories: 490,
    protein: '35g',
    carbs: '40g',
    fat: '18g',
    emoji: '🧀',
    tag: 'High Protein',
    tagColor: 'orange',
    isVegetarian: true,
    sortOrder: 6,
  },
  {
    name: 'Butter Chicken Lite',
    category: 'balanced',
    calories: 440,
    protein: '40g',
    carbs: '32g',
    fat: '15g',
    emoji: '🍛',
    tag: 'Classic',
    tagColor: 'red',
    isVegetarian: false,
    sortOrder: 7,
  },
  {
    name: 'Keto Chicken Wrap',
    category: 'keto',
    calories: 380,
    protein: '34g',
    carbs: '6g',
    fat: '24g',
    emoji: '🌯',
    tag: 'Keto',
    tagColor: 'green',
    isVegetarian: false,
    sortOrder: 8,
  },
];

const testimonials = [
  {
    name: 'Prasheek Thulkar',
    role: 'Gym Trainer & Athlete',
    text: 'The Premium plan is excellent—full-day meals that perfectly match my macros. Even my coach was surprised by the progress. Simple, effective, and worth it.',
    rating: 5,
    avatar: '🏋️',
    sortOrder: 1,
  },
  {
    name: 'Sankalp Meshram',
    role: 'CrossFit Athlete',
    text: 'The variety is what keeps me hooked. Different meals every day, all hitting 40g+ protein. Like having a personal chef.',
    rating: 5,
    avatar: '🤸',
    sortOrder: 2,
  },
  {
    name: 'Aatish Sontakke (Shanky)',
    role: 'Owner, Growth Fitness',
    text: "As a gym owner, I've tried many diet plans, but Dietly stands out. I lost 8 kg in 3 months while building lean muscle—and the food is genuinely delicious. Easy to follow and highly effective.",
    rating: 5,
    avatar: '💪',
    sortOrder: 3,
  },
  {
    name: 'Poonam Jain',
    role: 'Yoga Instructor',
    text: 'As a yoga instructor, nutrition is everything. Dietly meals are clean, balanced, and show up on time every single day.',
    rating: 5,
    avatar: '🧘‍♀️',
    sortOrder: 4,
  },
  {
    name: 'Sneha Shambharkar',
    role: 'Marathon Runner',
    text: 'I used to spend hours meal prepping. Now I just open the box and eat. My performance has improved significantly.',
    rating: 5,
    avatar: '🏃‍♀️',
    sortOrder: 5,
  },
];

const faqs = [
  {
    question: 'How does the subscription work?',
    answer: 'Choose a plan, tell us your dietary preferences, and we deliver fresh meals to your door daily. You can pause, skip, or cancel anytime from your dashboard.',
    sortOrder: 1,
  },
  {
    question: 'Can I customize my meals?',
    answer: 'Absolutely! Standard and Premium plans include full meal customization based on your goals, dietary restrictions, and taste preferences.',
    sortOrder: 2,
  },
  {
    question: 'What areas do you deliver to?',
    answer: 'We currently deliver across 15+ cities in India. Enter your pincode at checkout to confirm availability in your area.',
    sortOrder: 3,
  },
  {
    question: 'Are the meals suitable for vegetarians?',
    answer: 'Yes! We offer both vegetarian and non-vegetarian options across all plans. You can set your preference during onboarding.',
    sortOrder: 4,
  },
  {
    question: 'How is the food packaged?',
    answer: 'All meals are packed in eco-friendly, microwave-safe containers. Premium plan members get insulated packaging to keep food at the perfect temperature.',
    sortOrder: 5,
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade, downgrade, or switch plans at any time. Changes take effect from your next billing cycle.',
    sortOrder: 6,
  },
  {
    question: "What if I don't like a meal?",
    answer: "If you're unsatisfied with any meal, let us know within 24 hours and we'll either replace it or credit your account. Satisfaction guaranteed.",
    sortOrder: 7,
  },
];

const stats = [
  { icon: 'Users', value: 5000, suffix: '+', label: 'Active Subscribers', color: 'brand-green', decimals: 0, sortOrder: 1 },
  { icon: 'UtensilsCrossed', value: 10000, suffix: '+', label: 'Meals Delivered', color: 'brand-orange', decimals: 0, sortOrder: 2 },
  { icon: 'MapPin', value: 15, suffix: '+', label: 'Cities Covered', color: 'purple', decimals: 0, sortOrder: 3 },
  { icon: 'Star', value: 4.9, suffix: '', label: 'Average Rating', color: 'yellow', decimals: 1, sortOrder: 4 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Plan.deleteMany(),
      Meal.deleteMany(),
      Testimonial.deleteMany(),
      FAQ.deleteMany(),
      Stat.deleteMany(),
      DeliveryAgent.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // Insert seed data
    await Promise.all([
      Plan.insertMany(plans),
      Meal.insertMany(meals),
      Testimonial.insertMany(testimonials),
      FAQ.insertMany(faqs),
      Stat.insertMany(stats),
    ]);
    console.log('🌱 Seeded: Plans, Meals, Testimonials, FAQs, Stats');

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@dietly.in' });
    if (!adminExists) {
      await User.create({
        name: 'Dietly Admin',
        email: 'admin@dietly.in',
        password: 'admin123456',
        role: 'admin',
        phone: '+91 98765 43210',
      });
      console.log('👤 Created admin user (admin@dietly.in / admin123456)');
    }

    const deliveryAgentData = [
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
    for (const agentData of deliveryAgentData) {
      await DeliveryAgent.create(agentData);
    }
    console.log('🛵 Created delivery users (delivery.rohit / delivery123) and (delivery.saurabh / delivery123)');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedDB();

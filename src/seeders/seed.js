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
    period: '/month',
    icon: 'Zap',
    description: 'Perfect for getting started with healthy eating',
    popular: false,
    sortOrder: 1,
    features: [
      '1 meal per day',
      'Fixed delivery time',
      'Standard meal plan',
      'Weekly menu rotation',
      'Email support',
    ],
  },
  {
    name: 'Standard',
    slug: 'standard',
    price: 1500,
    period: '/month',
    icon: 'Star',
    description: 'Most popular — balanced nutrition for active people',
    popular: true,
    sortOrder: 2,
    features: [
      '2 meals per day',
      'Custom delivery time',
      'Personalized meal plan',
      'Daily menu variation',
      'Priority support',
      'Nutritionist check-in',
    ],
  },
  {
    name: 'Premium',
    slug: 'premium',
    price: 2999,
    period: '/month',
    icon: 'Crown',
    description: 'Full-day nutrition for serious fitness goals',
    popular: false,
    sortOrder: 3,
    features: [
      'Full day meals (3+snacks)',
      'Fully customized plan',
      'Premium protein support',
      'On-demand ordering',
      'Dedicated nutritionist',
      'Body composition tracking',
      'Insulated packaging',
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
    name: 'Arjun Mehta',
    role: 'Fitness Enthusiast',
    text: "Dietly transformed my nutrition game! Lost 8kg in 3 months while building lean muscle. The meals are restaurant-quality and perfectly macro-balanced.",
    rating: 5,
    avatar: '💪',
    sortOrder: 1,
  },
  {
    name: 'Priya Sharma',
    role: 'Yoga Instructor',
    text: "As a yoga instructor, I need clean, balanced meals. Dietly delivers exactly that — fresh, consistent, and always on time. My clients love it too!",
    rating: 5,
    avatar: '🧘‍♀️',
    sortOrder: 2,
  },
  {
    name: 'Rohit Kapoor',
    role: 'Bodybuilder',
    text: "The Premium plan is a game-changer. Full-day meals that hit my macros perfectly. The dedicated nutritionist helped me break through my plateau.",
    rating: 5,
    avatar: '🏋️',
    sortOrder: 3,
  },
  {
    name: 'Sneha Iyer',
    role: 'Marathon Runner',
    text: "I used to spend hours on meal prep. Dietly gave me those hours back while keeping me fueled for my training. The packaging keeps food fresh too!",
    rating: 5,
    avatar: '🏃‍♀️',
    sortOrder: 4,
  },
  {
    name: 'Vikram Singh',
    role: 'CrossFit Athlete',
    text: "40g+ protein per meal is exactly what I need. The variety is incredible — never bored. Dietly understands fitness nutrition like no other service.",
    rating: 5,
    avatar: '🤸',
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

    await DeliveryAgent.insertMany([
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
    ]);
    console.log('🛵 Created delivery users (delivery.rohit / delivery123) and (delivery.saurabh / delivery123)');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedDB();

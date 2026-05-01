const https = require('https');

const WHATSAPP_API_URL = 'https://api.callmebot.com/whatsapp.php';

const asText = (value, fallback = 'N/A') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const normalizePhoneForApi = (value) => String(value ?? '').replace(/\D/g, '');

const httpGet = (url, timeoutMs = 10000) => new Promise((resolve, reject) => {
  const req = https.get(url, { timeout: timeoutMs }, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      resolve({ statusCode: res.statusCode, body });
    });
  });

  req.on('timeout', () => {
    req.destroy(new Error('WhatsApp API request timed out'));
  });

  req.on('error', reject);
});

const buildEnrollmentMessage = ({ order, user, plan }) => {
  const location = order.deliveryLocation || {};
  const address = order.deliveryAddress || {};
  const quantity = order.orderDetails?.quantity || 1;
  const planName = asText(plan?.name || order.orderDetails?.mealPlanName || order.plan?.name);
  const amount = Number(order.amount || order.pricing?.totalAmount || 0).toLocaleString('en-IN');
  const mapsLink = (Number.isFinite(location.lat) && Number.isFinite(location.lng))
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'N/A';

  return [
    'New Plan Enrollment - Dietly',
    '',
    `Order ID: ${asText(order._id)}`,
    `Plan: ${planName}`,
    `Quantity: ${quantity}`,
    `Amount: INR ${amount}`,
    `Delivery Slot: ${asText(order.deliverySlot)}`,
    '',
    `Customer Name: ${asText(order.customerName || user?.name)}`,
    `Customer Phone: ${asText(order.customerPhone || user?.phone)}`,
    `Customer Email: ${asText(user?.email)}`,
    '',
    `Location Name: ${asText(order.deliveryLocationName)}`,
    `Address: ${asText(order.addressText || address.street)}`,
    `City/State: ${asText(address.city)}/${asText(address.state)}`,
    `Pincode: ${asText(address.pincode)}`,
    `Coordinates: ${asText(location.lat)}, ${asText(location.lng)}`,
    `Map: ${mapsLink}`,
    '',
    `Notes: ${asText(order.notes || order.orderDetails?.specialInstructions, 'None')}`,
    `Created At: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`,
  ].join('\n');
};

const sendPlanEnrollmentWhatsAppNotification = async ({ order, user, plan }) => {
  const isEnabled = String(process.env.WHATSAPP_NOTIFY_ENABLED || '').toLowerCase() === 'true';
  if (!isEnabled) {
    return { sent: false, reason: 'disabled' };
  }

  const targetPhone = normalizePhoneForApi(process.env.WHATSAPP_NOTIFY_PHONE);
  const apiKey = asText(process.env.WHATSAPP_NOTIFY_API_KEY, '');

  if (!targetPhone || !apiKey) {
    return { sent: false, reason: 'missing_credentials' };
  }

  const message = buildEnrollmentMessage({ order, user, plan });
  const url = new URL(WHATSAPP_API_URL);
  url.searchParams.set('phone', targetPhone);
  url.searchParams.set('text', message);
  url.searchParams.set('apikey', apiKey);

  const response = await httpGet(url.toString());
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`WhatsApp API failed with status ${response.statusCode}`);
  }

  return { sent: true };
};

module.exports = {
  sendPlanEnrollmentWhatsAppNotification,
};

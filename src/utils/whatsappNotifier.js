const https = require('https');

const TELEGRAM_API_BASE = 'https://api.telegram.org';

const asText = (value, fallback = 'N/A') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const httpPost = (url, body, timeoutMs = 10000) => new Promise((resolve, reject) => {
  const payload = JSON.stringify(body);
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'POST',
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
  });

  req.on('timeout', () => req.destroy(new Error('Telegram API request timed out')));
  req.on('error', reject);
  req.write(payload);
  req.end();
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
    '🍱 *New Plan Enrollment — Dietly*',
    '',
    `📋 *Order ID:* ${asText(order._id)}`,
    `📦 *Plan:* ${planName}`,
    `🔢 *Quantity:* ${quantity}`,
    `💰 *Amount:* ₹${amount}`,
    `🕐 *Delivery Slot:* ${asText(order.deliverySlot)}`,
    '',
    `👤 *Customer Name:* ${asText(order.customerName || user?.name)}`,
    `📞 *Phone:* ${asText(order.customerPhone || user?.phone)}`,
    `📧 *Email:* ${asText(user?.email)}`,
    '',
    `📍 *Location:* ${asText(order.deliveryLocationName)}`,
    `🏠 *Address:* ${asText(order.addressText || address.street)}`,
    `🏙️ *City/State:* ${asText(address.city)} / ${asText(address.state)}`,
    `📮 *Pincode:* ${asText(address.pincode)}`,
    `🗺️ *Map:* ${mapsLink}`,
    '',
    `📝 *Notes:* ${asText(order.notes || order.orderDetails?.specialInstructions, 'None')}`,
    `🕓 *Time:* ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`,
  ].join('\n');
};

const sendPlanEnrollmentWhatsAppNotification = async ({ order, user, plan }) => {
  const isEnabled = String(process.env.WHATSAPP_NOTIFY_ENABLED || '').toLowerCase() === 'true';
  if (!isEnabled) {
    return { sent: false, reason: 'disabled' };
  }

  const botToken = asText(process.env.TELEGRAM_BOT_TOKEN, '');
  const chatId = asText(process.env.TELEGRAM_CHAT_ID, '');

  if (!botToken || !chatId) {
    return { sent: false, reason: 'missing_credentials' };
  }

  const message = buildEnrollmentMessage({ order, user, plan });
  const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

  const response = await httpPost(url, {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Telegram API failed with status ${response.statusCode}: ${response.body}`);
  }

  return { sent: true };
};

module.exports = {
  sendPlanEnrollmentWhatsAppNotification,
};

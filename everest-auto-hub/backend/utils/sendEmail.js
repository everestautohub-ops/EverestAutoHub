const nodemailer = require('nodemailer');

let transporter = null;

// Use port 587 with STARTTLS — works on Render (port 465 is blocked, 587 is open)
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
};

const otpBox = (otp, label, expiry = '10 minutes') => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:2px solid #f97316;border-radius:10px;margin:24px 0;">
    <tr>
      <td style="padding:28px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#888;">${label}</p>
        <p style="margin:0;font-size:46px;font-weight:900;letter-spacing:14px;color:#f97316;font-family:'Courier New',monospace;">${otp}</p>
        <p style="margin:10px 0 0;font-size:12px;color:#555;">Expires in ${expiry}</p>
      </td>
    </tr>
  </table>`;

const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#111;padding:28px 40px;border-bottom:3px solid #f97316;">
            <span style="font-size:22px;font-weight:900;font-style:italic;letter-spacing:2px;color:#f8f9fa;">
              EVEREST AUTO <span style="background:#f97316;color:#fff;padding:2px 8px;border-radius:5px;">HUB</span>
            </span>
          </td>
        </tr>
        <tr><td style="padding:36px 40px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#0d0d0d;padding:20px 40px;border-top:1px solid #1e1e1e;">
            <p style="margin:0;font-size:11px;color:#444;text-align:center;">
              Everest Auto Hub &bull; Australia &bull; If you didn't request this, ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Verification email ───────────────────────────────────────────────────────
const sendVerificationEmail = async (toEmail, name, otp) => {
  const body = `
    <h2 style="margin:0 0 8px;color:#f97316;font-size:22px;">Verify Your Email</h2>
    <p style="margin:0 0 20px;color:#aaa;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#f8f9fa;">${name}</strong>, thanks for joining Everest Auto Hub!<br/>
      Use the code below to verify your email address.
    </p>
    ${otpBox(otp, 'Your verification code')}
    <p style="margin:0;font-size:13px;color:#555;">Valid for <strong style="color:#f8f9fa;">10 minutes</strong>. One use only.</p>`;

  await getTransporter().sendMail({
    from: `"Everest Auto Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your Everest Auto Hub verification code`,
    text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nExpires in 10 minutes.`,
    html: baseTemplate('Verify Your Email', body),
  });
};

// ── Password reset email ─────────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, name, otp) => {
  const body = `
    <h2 style="margin:0 0 8px;color:#f97316;font-size:22px;">Reset Your Password</h2>
    <p style="margin:0 0 20px;color:#aaa;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#f8f9fa;">${name}</strong>, use the code below to reset your password.
    </p>
    ${otpBox(otp, 'Your password reset code')}
    <p style="margin:0;font-size:13px;color:#555;">Valid for <strong style="color:#f8f9fa;">10 minutes</strong>.</p>`;

  await getTransporter().sendMail({
    from: `"Everest Auto Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your Everest Auto Hub password reset code`,
    text: `Hi ${name},\n\nYour password reset code is: ${otp}\n\nExpires in 10 minutes.`,
    html: baseTemplate('Reset Your Password', body),
  });
};

// ── Order status email ───────────────────────────────────────────────────────
const sendOrderStatusEmail = async (toEmail, name, order) => {
  const statusMessages = {
    processing: { emoji: '⚙️', title: 'Order Being Processed', color: '#4cc9f0', msg: 'Your order is being prepared and will be shipped soon.' },
    shipped:    { emoji: '🚚', title: 'Order Shipped!',         color: '#4361ee', msg: 'Your order is on its way! Expected delivery in 3-5 business days.' },
    delivered:  { emoji: '✅', title: 'Order Delivered!',       color: '#2d6a4f', msg: 'Your order has been delivered. Enjoy your purchase!' },
    cancelled:  { emoji: '❌', title: 'Order Cancelled',        color: '#e63946', msg: 'Your order has been cancelled. Contact us if you have questions.' },
  };

  const s = statusMessages[order.status];
  if (!s) return;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px 0;color:#aaa;font-size:13px;">${item.name}${item.size ? ` (${item.size})` : ''} x${item.quantity}</td>
      <td style="padding:8px 0;color:#fff;font-weight:600;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const body = `
    <h2 style="margin:0 0 8px;color:${s.color};font-size:22px;">${s.emoji} ${s.title}</h2>
    <p style="margin:0 0 20px;color:#aaa;font-size:14px;line-height:1.6;">Hi <strong style="color:#f8f9fa;">${name}</strong>, ${s.msg}</p>
    <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Order #${String(order._id).slice(-8)}</p>
      <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}
        <tr><td colspan="2" style="border-top:1px solid #333;padding-top:10px;"></td></tr>
        <tr>
          <td style="color:#aaa;font-size:14px;padding:4px 0;">Total</td>
          <td style="color:#f97316;font-weight:700;font-size:16px;text-align:right;">$${order.totalPrice?.toFixed(2)}</td>
        </tr>
      </table>
    </div>`;

  await getTransporter().sendMail({
    from: `"Everest Auto Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${s.emoji} Order #${String(order._id).slice(-8)} — ${s.title}`,
    text: `Hi ${name},\n\n${s.msg}\n\nOrder #${String(order._id).slice(-8)}\nTotal: $${order.totalPrice?.toFixed(2)}`,
    html: baseTemplate(s.title, body),
  });
};

// ── Appointment confirmation email ───────────────────────────────────────────
const sendAppointmentEmail = async (toEmail, appointment, serviceName, type = 'booked') => {
  const configs = {
    booked: {
      emoji: '🎉', color: '#f97316',
      title: 'Appointment Booked!',
      msg: `Your appointment has been received. We'll confirm it shortly.`,
      statusColor: '#e9c46a', statusText: 'Pending Confirmation',
    },
    confirmed: {
      emoji: '✅', color: '#2d6a4f',
      title: 'Appointment Confirmed!',
      msg: `Your appointment has been confirmed. See you then!`,
      statusColor: '#2d6a4f', statusText: 'Confirmed',
    },
    cancelled: {
      emoji: '❌', color: '#e63946',
      title: 'Appointment Cancelled',
      msg: `Your appointment has been cancelled. Please contact us to rebook.`,
      statusColor: '#e63946', statusText: 'Cancelled',
    },
    completed: {
      emoji: '🏁', color: '#4cc9f0',
      title: 'Service Completed!',
      msg: `Thank you for choosing Everest Auto Hub. We hope to see you again!`,
      statusColor: '#4cc9f0', statusText: 'Completed',
    },
  };

  const c = configs[type] || configs.booked;

  const body = `
    <h2 style="margin:0 0 8px;color:${c.color};font-size:22px;">${c.emoji} ${c.title}</h2>
    <p style="margin:0 0 20px;color:#aaa;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#f8f9fa;">${appointment.name}</strong>, ${c.msg}
    </p>
    <div style="background:#1a1a1a;border:1px solid rgba(249,115,22,0.3);border-radius:10px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#888;padding:7px 0;font-size:13px;">Service</td><td style="color:#fff;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="color:#888;padding:7px 0;font-size:13px;">Vehicle</td><td style="color:#fff;font-weight:600;text-align:right;">${appointment.vehicle}</td></tr>
        <tr><td style="color:#888;padding:7px 0;font-size:13px;">Date</td><td style="color:#fff;font-weight:600;text-align:right;">${appointment.date}</td></tr>
        <tr><td style="color:#888;padding:7px 0;font-size:13px;">Time</td><td style="color:#f97316;font-weight:700;text-align:right;">${appointment.timeSlot}</td></tr>
        <tr><td style="color:#888;padding:7px 0;font-size:13px;">Status</td><td style="color:${c.statusColor};font-weight:600;text-align:right;">${c.statusText}</td></tr>
      </table>
    </div>
    <p style="margin:0;font-size:12px;color:#555;text-align:center;">
      Questions? Call us at <strong style="color:#f97316;">${process.env.CONTACT_PHONE || '+61 2 9000 0000'}</strong>
    </p>`;

  await getTransporter().sendMail({
    from: `"Everest Auto Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${c.emoji} ${c.title} — Everest Auto Hub`,
    text: `Hi ${appointment.name},\n\n${c.msg}\n\nService: ${serviceName}\nDate: ${appointment.date}\nTime: ${appointment.timeSlot}`,
    html: baseTemplate(c.title, body),
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOrderStatusEmail, sendAppointmentEmail };

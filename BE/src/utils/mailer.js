const nodemailer = require('nodemailer');

// ── Buat transporter SMTP ────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 465,
    secure: (parseInt(process.env.SMTP_PORT) || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ── Template email HTML ──────────────────────────────────────────────────────
const baseTemplate = ({ title, badgeColor, badgeText, bodyHtml }) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:24px 32px;border-bottom:2px solid #e61b1b;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-family:sans-serif;font-size:20px;font-weight:900;color:#fff;letter-spacing:2px;">
                    MULTISTACK <span style="color:#e61b1b;">INDONESIA</span>
                  </span><br/>
                  <span style="font-size:11px;color:#999;letter-spacing:3px;text-transform:uppercase;">
                    Solusi Terpadu MEP
                  </span>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:${badgeColor};color:#fff;font-size:11px;
                    font-weight:700;padding:5px 14px;border-radius:4px;text-transform:uppercase;letter-spacing:1px;">
                    ${badgeText}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#ffffff;">${title}</h2>
            <p style="margin:0 0 24px;font-size:12px;color:#666;">
              Notifikasi otomatis dari website PT. Multistack Indonesia
            </p>
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111;padding:16px 32px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;text-align:center;">
              Email ini dikirim otomatis oleh sistem CMS PT. Multistack Indonesia.<br/>
              Harap ditindaklanjuti dalam 1×24 jam kerja.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Helper baris tabel ───────────────────────────────────────────────────────
const tableRow = (label, value, highlight = false) => `
  <tr>
    <td style="padding:9px 12px;font-size:13px;color:#888;width:38%;
      background:${highlight ? '#1f1f1f' : '#181818'};">${label}</td>
    <td style="padding:9px 12px;font-size:13px;
      color:${highlight ? '#fff' : '#ccc'};
      font-weight:${highlight ? '700' : '400'};
      background:${highlight ? '#1f1f1f' : '#1a1a1a'};">${value || '-'}</td>
  </tr>`;

// ── Kirim email notifikasi RFQ ───────────────────────────────────────────────
const sendRFQEmail = async ({
  adminEmail,
  company_name,
  contact_name,
  email,
  phone,
  product_interest,
  quantity,
  message,
}) => {
  const transporter = createTransporter();

  const waPhone = phone?.replace(/\D/g, '');
  const waLink  = waPhone
    ? `<a href="https://wa.me/${waPhone.startsWith('0') ? '62' + waPhone.slice(1) : waPhone}"
         style="color:#25D366;">Chat WhatsApp →</a>`
    : '-';

  const bodyHtml = `
    <div style="background:#1f1010;border-left:3px solid #e61b1b;
      padding:12px 16px;margin-bottom:20px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:13px;color:#e61b1b;font-weight:600;">
        🔴 RFQ baru masuk — harap segera ditindaklanjuti.
      </p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;margin-bottom:20px;">
      ${tableRow('Perusahaan',    `<strong>${company_name}</strong>`, true)}
      ${tableRow('Nama Kontak',   contact_name)}
      ${tableRow('Email',         `<a href="mailto:${email}" style="color:#e61b1b;">${email}</a>`)}
      ${tableRow('Telepon/WA',    phone ? `${phone} | ${waLink}` : '-')}
      ${tableRow('Produk/Layanan', product_interest, true)}
      ${tableRow('Estimasi Qty',  quantity)}
      ${tableRow('Keterangan',    message)}
    </table>`;

  await transporter.sendMail({
    from:    `"Multistack CMS" <${process.env.SMTP_USER}>`,
    to:      adminEmail,
    subject: `[RFQ BARU] ${company_name} — ${product_interest}`,
    html:    baseTemplate({
      title:      'Request for Quotation Baru',
      badgeColor: '#e61b1b',
      badgeText:  'RFQ',
      bodyHtml,
    }),
  });
};

// ── Kirim email notifikasi Kontak ────────────────────────────────────────────
const sendContactEmail = async ({
  adminEmail,
  name,
  email,
  phone,
  subject,
  message,
}) => {
  const transporter = createTransporter();

  const bodyHtml = `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;margin-bottom:20px;">
      ${tableRow('Nama',    `<strong>${name}</strong>`, true)}
      ${tableRow('Email',   `<a href="mailto:${email}" style="color:#e61b1b;">${email}</a>`)}
      ${tableRow('Telepon', phone)}
      ${tableRow('Subjek',  subject)}
    </table>
    <div style="background:#181818;border:1px solid #2a2a2a;border-radius:6px;
      padding:14px;font-size:13px;color:#ccc;line-height:1.7;white-space:pre-wrap;">
      ${message}
    </div>`;

  await transporter.sendMail({
    from:    `"Multistack CMS" <${process.env.SMTP_USER}>`,
    to:      adminEmail,
    subject: `[PESAN BARU] ${name} — ${subject || '(tanpa subjek)'}`,
    html:    baseTemplate({
      title:      'Pesan Kontak Baru',
      badgeColor: '#555',
      badgeText:  'KONTAK',
      bodyHtml,
    }),
  });
};

module.exports = { sendRFQEmail, sendContactEmail };

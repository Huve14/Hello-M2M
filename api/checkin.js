import { Resend } from 'resend';

const HOSTS = {
  selvan: { name: 'Selvan Naidoo', role: 'CEO', email: 'selvan@marketing2themax.co.za' },
  valerie: { name: 'Valerie Naidoo', role: 'MD', email: 'val@marketing2themax.co.za' },
  shantal: { name: 'Shantal Reis', role: 'PA', email: 'shantal@marketing2themax.co.za' },
  jaryd: { name: 'Jaryd Chiert', role: 'GM Sales', email: 'jaryd@marketing2themax.co.za' },
  ronsleigh: { name: 'Ronsleigh Meyer', role: 'GM Operations', email: 'ronsleigh@marketing2themax.co.za' },
  reoni: { name: 'Reoni Moodley', role: 'BUD', email: 'reoni@marketing2themax.co.za' },
  robyn: { name: 'Robyn Fisher', role: 'BUD', email: 'robyn@marketing2themax.co.za' },
  lorreta: { name: 'Lorreta Naidoo', role: 'BUD', email: 'lorreta@marketing2themax.co.za' },
  andrew: { name: 'Andrew Falchi', role: 'AM', email: 'andrew@marketing2themax.co.za' },
  sameerah: { name: 'Sameerah Gafoor', role: 'FTS', email: 'sameerah@marketing2themax.co.za' },
  tracy: { name: 'Tracy Falchi', role: 'Team', email: 'tracy@marketing2themax.co.za' },
  suyashan: { name: 'Suyashan Naicker', role: 'AM', email: 'suyashan@marketing2themax.co.za' },
  huveshan: { name: 'Huveshan Naicker', role: 'IT', email: 'huve@marketing2themax.co.za' },
  redewaan: { name: 'Redewaan Majeet', role: 'Finance', email: 'redewaan@marketing2themax.co.za' },
  chanel: { name: 'Chanel Du Toit', role: 'Debtors', email: 'chanel@marketing2themax.co.za' },
  ryan: { name: 'Ryan Snyman', role: 'Umedia', email: 'ryan@umediasa.co.za' },
  jayden: { name: 'Jayden Jenkinson', role: 'Umedia', email: 'jayden@umediasa.co.za' },
};

function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 120);
}

function escapeHtml(value) {
  return cleanText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatArrivalTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
  return date.toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  });
}

function buildEmail({ company, host, visitorName, checkedInAt }) {
  const safeVisitor = escapeHtml(visitorName);
  const safeCompany = escapeHtml(company || 'Not provided');
  const safeHost = escapeHtml(host.name);
  const safeTime = escapeHtml(formatArrivalTime(checkedInAt));

  const text = [
    `Hi ${host.name},`,
    '',
    `${visitorName} has checked in at M2M reception.`,
    `Company: ${company || 'Not provided'}`,
    `Checked in: ${formatArrivalTime(checkedInAt)}`,
    '',
    'Please meet them at reception when you are ready.',
  ].join('\n');

  const html = `
    <div style="margin:0;background:#f4f6f8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0c1735;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dcddde;">
        <div style="background:#0c1735;padding:24px 28px;border-bottom:6px solid #ed1c24;">
          <p style="margin:0;color:#dcddde;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">M2M Reception</p>
          <h1 style="margin:10px 0 0;color:#ffffff;font-size:28px;line-height:1.1;">Your guest has arrived</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">Hi ${safeHost},</p>
          <p style="margin:0 0 22px;font-size:18px;line-height:1.5;"><strong>${safeVisitor}</strong> has checked in at reception.</p>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr>
              <td style="width:36%;padding:12px 0;border-top:1px solid #e5e7eb;color:#5b6472;font-weight:700;">Visitor</td>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;">${safeVisitor}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;color:#5b6472;font-weight:700;">Company</td>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;">${safeCompany}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;color:#5b6472;font-weight:700;">Checked in</td>
              <td style="padding:12px 0;border-top:1px solid #e5e7eb;">${safeTime}</td>
            </tr>
          </table>
          <p style="margin:22px 0 0;color:#5b6472;font-size:14px;line-height:1.5;">Please meet them at reception when you are ready.</p>
        </div>
      </div>
    </div>
  `;

  return { html, text };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  const body = getBody(req);
  const host = HOSTS[body.hostId];
  const visitorName = cleanText(body.visitorName);
  const company = cleanText(body.company);
  const checkedInAt = body.checkedInAt || new Date().toISOString();

  if (!host || visitorName.length < 2) {
    return res.status(400).json({ error: 'Missing visitor or host details' });
  }

  const { html, text } = buildEmail({ company, host, visitorName, checkedInAt });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM || 'M2M Reception <reception@marketing2themax.co.za>';
  const replyTo = process.env.RESEND_REPLY_TO || 'reception@marketing2themax.co.za';

  const { data, error } = await resend.emails.send({
    from,
    to: host.email,
    replyTo,
    subject: `${visitorName} has checked in at M2M reception`,
    html,
    text,
  });

  if (error) {
    console.error('Resend check-in email failed', error);
    return res.status(400).json({ error: 'Could not send host notification' });
  }

  return res.status(200).json({ id: data?.id, host: host.name });
}

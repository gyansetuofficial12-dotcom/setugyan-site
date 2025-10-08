/**
 * notify.js
 * Simple Express endpoint that forwards a notification to OneSignal.
 *
 * IMPORTANT:
 * - Fill in YOUR_ONESIGNAL_REST_API_KEY below before deploying.
 * - Deploy this file to a secure server or a serverless environment (e.g., Vercel, Render, Heroku, Cloud Run).
 * - This endpoint keeps your REST API key secret (do NOT put the key into client-side code).
 */

const express = require('express');
const fetch = require('node-fetch'); // For Node 18+, you can use global fetch instead.
const app = express();
app.use(express.json());

// TODO: Replace with your OneSignal REST API key (keep it secret!)
const ONESIGNAL_REST_KEY = "";os_v2_app_65ui74bemjbfhnrbzwgktjmmuyza5ukgqhwudw45fgkj4et5lnc7tvsm3voxmgga2wqq5q75wsihdugkyf3hu5cxwtj57ayqzv34rgq

// Your OneSignal App ID
const ONESIGNAL_APP_ID = "f7688ff0-2462-4253-b621-cd8ca9a58ca6";

app.post('/api/notify', async (req, res) => {
  try {
    const payload = req.body || {};
    const body = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: payload.title || "📘 New file uploaded on Gyan Setu" },
      contents: { en: payload.message || "A new homework or note has been added. Check it now!" },
      url: payload.url || "https://www.setugyan.live",
      data: {
        name: payload.name || '',
        category: payload.category || '',
        subject: payload.subject || ''
      }
    };

    const resp = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify(body)
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('OneSignal error', resp.status, text);
      return res.status(502).send({ error: 'OneSignal request failed', detail: text });
    }

    res.status(200).send({ ok: true, detail: text });
  } catch (err) {
    console.error('notify endpoint error', err);
    res.status(500).send({ error: 'internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Notify server listening on', port));
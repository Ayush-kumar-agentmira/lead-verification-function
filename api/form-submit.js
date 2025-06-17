// api/form-submit.js
import { parse } from 'querystring';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const formData = parse(body);
      console.log("📥 Form submitted:", formData);

      // 🔍 Validate required field
      if (!formData.leadId) {
        console.warn("⚠️ Missing leadId in submission");
        return res.status(400).send("❌ Missing leadId in form data");
      }

      // ✅ Send successful response
      res.status(200).send(`✅ Data received for lead ${formData.leadId}`);
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

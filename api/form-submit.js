// api/form-submit.js
import { parse } from 'querystring';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      const formData = parse(body);
      console.log("📥 Form submitted:", formData);

      const leadId = formData.leadId || formData.x_leadId;
      if (!leadId) {
        console.warn("⚠️ Missing leadId in submission");
        return res.status(400).send("❌ Missing leadId in form data");
      }

      // Prepare payload fields
      const customAttributes = [];

      if (formData.x_Minimum) {
        customAttributes.push({
          attributeName: 'HB-Budget Min',
          attributeType: 'currency',
          value: formData.x_Minimum,
        });
      }

      if (formData.x_Maximum) {
        customAttributes.push({
          attributeName: 'HB-Budget Max',
          attributeType: 'currency',
          value: formData.x_Maximum,
        });
      }

      if (formData.x_Preferred) {
        customAttributes.push({
          attributeName: 'HB-PrefCity',
          attributeType: 'text',
          value: formData.x_Preferred,
        });
      }

      // Optional top-level fields
      const phone = formData.x_Phone;
      const firstName = formData['First Name'] || formData.x_FirstName;
      const lastName = formData['Last Name'] || formData.x_LastName;

      const payload = {
        ...(phone && { phones: [phone] }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(customAttributes.length > 0 && { customAttributeList: customAttributes }),
      };

      try {
        const response = await fetch(`${process.env.LOFTY_BASE_URL}/${leadId}`, {
          method: "PUT",
          headers: {
            Authorization: `token ${process.env.LOFTY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.text();
          console.error("🔴 Lofty update failed:", errData);
          return res.status(500).send("❌ Failed to update Lofty");
        }

        console.log(`🟢 Lofty updated for lead ${leadId}`);
        res.status(200).send(`✅ Data received and updated for lead ${leadId}`);
      } catch (err) {
        console.error("❌ Error during Lofty update:", err.message);
        res.status(500).send("❌ Internal server error");
      }
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

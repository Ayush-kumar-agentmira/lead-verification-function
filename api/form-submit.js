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

      const leadId = formData.leadId;

      if (!leadId) {
        console.warn("⚠️ Missing leadId in submission");
        return res.status(400).send("❌ Missing leadId in form data");
      }

      // Prepare update payload
      const standardFields = {};
      const customAttributes = [];

      // Standard fields
      if (formData['First Name']) standardFields.firstName = formData['First Name'];
      if (formData['Last Name']) standardFields.lastName = formData['Last Name'];
      if (formData.Email) standardFields.emails = [formData.Email];
      if (formData['Phone Number']) standardFields.phones = [formData['Phone Number']];

      // Custom attributes
      if (formData['Minimum Price Budget']) {
        customAttributes.push({
          attributeName: 'HB-Budget Min',
          attributeType: 'currency',
          value: formData['Minimum Price Budget'],
        });
      }

      if (formData['Maximum Price Budget']) {
        customAttributes.push({
          attributeName: 'HB-Budget Max',
          attributeType: 'currency',
          value: formData['Maximum Price Budget'],
        });
      }

      if (formData['Preferred Location']) {
        customAttributes.push({
          attributeName: 'HB-PrefCity',
          attributeType: 'text',
          value: formData['Preferred Location'],
        });
      }

      try {
        const response = await fetch(`${process.env.LOFTY_BASE_URL}/${leadId}`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${process.env.LOFTY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...standardFields,
            customAttributeList: customAttributes,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Lofty update failed:", errorText);
          return res.status(500).send("❌ Failed to update lead in Lofty");
        }

        console.log(`🟢 Lofty updated successfully for lead ${leadId}`);
        res.status(200).send(`✅ Data received and updated for lead ${leadId}`);
      } catch (err) {
        console.error("🔴 Error updating Lofty:", err.message);
        res.status(500).send("❌ Error updating lead");
      }
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

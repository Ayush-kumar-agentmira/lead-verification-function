// File: api/confirm.js

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const body = Buffer.concat(buffers).toString();
  const params = new URLSearchParams(body);

  const id = params.get("id");
  const type = params.get("type");

  if (!id || !type) {
    return res.status(400).send("Missing parameters");
  }

  // --- Field Mapping Based on Type ---
  let verificationField = "";
  let verificationValue = "";
  const contactValidationValue = "Verified";

  if (type === "email") {
    verificationField = "Email Verification Status";
    verificationValue = "Email Verified";
  } else if (type === "phone") {
    verificationField = "Text Verification Status";
    verificationValue = "Text Verified";
  } else {
    return res.status(400).send("Invalid verification type");
  }

  // --- Update Lofty Custom Attributes ---
  async function updateLoftyAttributes(leadId, attributes = []) {
    try {
      const response = await fetch(`${process.env.LOFTY_BASE_URL}/${leadId}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.LOFTY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customAttributeList: attributes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Lofty Update Error:", errorData);
      } else {
        console.log(`🟢 Lofty updated for lead ${leadId}`);
      }
    } catch (err) {
      console.error("🔴 Failed to update Lofty:", err.message);
    }
  }

  // Call update
  await updateLoftyAttributes(id, [
    {
      attributeName: "Contact Method Validation",
      attributeType: "single-select",
      value: contactValidationValue,
    },
    {
      attributeName: verificationField,
      attributeType: "single-select",
      value: verificationValue,
    },
  ]);

  // Redirect to thank-you page
  res.writeHead(302, {
    Location: "https://ayush-kumar-agentmira.github.io/verification-page/",
  });
  res.end();
};

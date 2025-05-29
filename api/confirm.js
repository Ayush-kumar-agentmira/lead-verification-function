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

  const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/23035039/2jzza35/";

  try {
    await fetch(zapierWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        type,
        clickedAt: new Date().toISOString(),
      }),
    });

    // Redirect to thank-you page
    res.writeHead(302, {
      Location: "https://ayush-kumar-agentmira.github.io/verification-page/",
    });
    res.end();
  } catch (err) {
    console.error("Verification failed:", err);
    res.status(500).send("Verification failed");
  }
};

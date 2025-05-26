// File: api/verify.js

export default async (req, res) => {
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400).send("Missing parameters");
  }

  const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/23035039/2jzza35/";
  

  try {
    // Send data to Zapier webhook
    await fetch(zapierWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        type,
        clickedAt: new Date().toISOString(),
      }),
    });

    // Redirect the user to a thank-you page
    res.writeHead(302, {
      Location: "https://ayush-kumar-agentmira.github.io/verification-page/",
    });
    res.end();
  } catch (error) {
    console.error("Error sending to Zapier:", error);
    res.status(500).send("Verification failed");
  }
};

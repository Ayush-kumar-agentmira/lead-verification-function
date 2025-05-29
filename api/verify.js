// File: api/verify.js

export default async (req, res) => {
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400).send("Missing parameters");
  }

  // Show simple confirmation page
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Verify ${type}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: sans-serif; text-align: center; padding: 2rem; }
          button { padding: 10px 20px; font-size: 16px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h2>Confirm your ${type === "email" ? "Email" : "Phone"} Verification</h2>
        <form method="POST" action="/api/confirm">
          <input type="hidden" name="id" value="${id}" />
          <input type="hidden" name="type" value="${type}" />
          <button type="submit">✅ Verify Now</button>
        </form>
      </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};

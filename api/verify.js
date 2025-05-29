// File: api/verify.js

export default async (req, res) => {
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400).send("Missing parameters");
  }

  // Show a simple verification page with a confirmation button
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Verify ${type}</title>
      </head>
      <body>
        <h2>Confirm your ${type === "email" ? "Email" : "Phone"} Verification</h2>
        <form method="POST" action="/api/confirm">
          <input type="hidden" name="id" value="${id}" />
          <input type="hidden" name="type" value="${type}" />
          <button type="submit">Verify Now</button>
        </form>
      </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};

const HttpError = require("../../models/http-error");
const Screening = require("../../models/screenings");
const Job = require("../../models/jobs");

const sendoutScreening = async (req, res, next) => {
  const screeningId = req.params.sid;
  const { recipientEmail, recipientName, message, screeningLink } = req.body;

  if (!recipientEmail) {
    return next(new HttpError("Recipient email is required.", 422));
  }

  let screening;
  try {
    screening = await Screening.findById(screeningId);
  } catch (err) {
    return next(new HttpError("There was an error finding screening by id.", 500));
  }

  if (!screening) {
    return next(new HttpError("Screening not found.", 404));
  }

  let job;
  try {
    job = await Job.findById(screening.jobId).select("creator");
  } catch (err) {
    return next(new HttpError("There was an error checking screening ownership.", 500));
  }

  if (!job || job.creator.toString() !== req.userData?.userId?.toString()) {
    return next(new HttpError("Forbidden - You are not authorized for this action", 403));
  }

  if (!process.env.BREVO_API_KEY) {
    return next(new HttpError("Missing BREVO_API_KEY configuration.", 500));
  }

  const payload = {
    sender: {
      name: "Ajarn Jobs",
      email: "noreply@ajarnjobs.com",
    },
    to: [
      {
        name: recipientName || recipientEmail,
        email: recipientEmail,
      },
    ],
    subject: `Screening Invitation: ${screening.title}`,
    htmlContent: `
      <html>
        <body>
          <p>Hello ${recipientName || "there"},</p>
          <p>You have been invited to complete the screening: <b>${screening.title}</b>.</p>
          ${
            screeningLink
              ? `<p>Access your screening here: <a href="${screeningLink}">${screeningLink}</a></p>`
              : ""
          }
          ${message ? `<p>Message: ${message}</p>` : ""}
          <br/>
          <p>Best regards,</p>
          <p>The Ajarn Jobs Team</p>
          <p><i>This is an automated email. Please do not reply.</i></p>
        </body>
      </html>
    `,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error("brevo error", responseBody);
      return next(new HttpError("Failed to send screening email.", 502));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to send screening email.", 500));
  }

  return res.status(200).json({ ok: true, message: "Screening sent successfully." });
};

module.exports = sendoutScreening;

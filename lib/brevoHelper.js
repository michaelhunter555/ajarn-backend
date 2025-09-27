export const handleNewApplication = async (name, email, applicantName, jobName) => {
    const apiKey = process.env.BREVO_API_KEY;

    const payload = {
        sender: {
          name: "Ajarn Jobs",
          email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
        },
        to: [
          {
            name: name,
            email: email,
          },
        ],
        subject: `New Application from ${applicantName}`,
        htmlContent: `<html><body><p>${applicantName} has applied to your job - ${jobName}</p></body></html>`,
      };
    

    try {
    const res = await fetch(`https://api.brevo.com/v3/smtp/email`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify(payload)
        })
        if(!res.ok) {
            const err = await res.text();
            console.error("brevo error",err)
        } else {
            console.log("brevo email sent successfully");
        }
    } catch(err) {
        console.log("POST error",err);
    }

}

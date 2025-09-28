const handleNewApplication = async (name, email, applicantName, jobName) => {
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
        htmlContent: `
        <html>
         <body>
          <p>Good news! ${applicantName} has applied to your job - ${jobName}. To view the application, please login to your account, head to your dashboard and view your latest applicants.</p>
          <br/>
          <br/>
          <p>Best regards,</p>
          <p>The Ajarn Jobs Team</p>
          <br/>
          <p>
            <i>This is an automated email. Please do not reply to this email.</i>
          </p>
        </body>
        </html>`,
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

const handleNewRecruitment = async (teacherEmail, teacherName, companyName, jobTitle, salary, location, employerMessage) => {
    const apiKey = process.env.BREVO_API_KEY;

    const payload = {
        sender: {
            name: "Ajarn Jobs",
            email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
          },
          to: [
            {
              name: teacherName,
              email: teacherEmail,
            },
          ],
          subject: `${companyName} wants to recruit you!`,
          htmlContent: `
          <html>
           <body>
            <p>
              Good news ${teacherName}! ${companyName} wants to recruit you for the job of ${jobTitle} in ${location} with a salary of ${salary}. To view the job, please login to your account, head to your dashboard and view your latest recruitments.
            </p>
            <br/>
            <br/>
            <i>"${employerMessage}"</i>
            <br/>
            <p>
              Best regards,
              <br/>
              The Ajarn Jobs Team
            </p>
            <br/>
            <p>
              <i>This is an automated email. Please do not reply to this email.</i>
            </p>
           </body>
          </html>`,
    }

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

module.exports = {
    handleNewApplication,
    handleNewRecruitment
}
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

const handleSupportEmail = async (name, companyName, email, message) => {
    const apiKey = process.env.BREVO_API_KEY;
    const payload = {
      sender: {
        name: "Ajarn Jobs",
        email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
      },
      to: [
        {
          name: "Customer Support Request",
          email: "info@ajarnjobs.com",
        },
      ],
      subject: `Message from ${name}`,
      htmlContent: `
      <html>
       <body>
        <p>Message from ${name} - ${companyName} - ${email}</p>
        <p>${message}</p>
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
        });

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

const handleAdminStripeTransactionNotification = async (user, totalAmount, transaction) => {
  const apiKey = process.env.BREVO_API_KEY;

  const payload = {
    sender: {
      name: "Stripe Transaction[AjarnJobs.com]",
      email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
    },
    to: [
      {
        name: "Admin",
        email: "info@ajarnjobs.com",
      },
    ],
    subject: `A transaction for  ${transaction.currency.toUpperCase()}${totalAmount} has been completed by ${user.name}.`,
    htmlContent: `
    <html>
     <body>
      <p>Heads up! ${user.name} has completed a transaction for  ${transaction.currency.toUpperCase()}${totalAmount}.</p>
      <p>User Email: ${user.email}</p>
      <p>User Name: ${user.name}</p>
      <p>User ID: ${user._id}</p>
      <p>Transaction Amount: ${totalAmount}</p>
      <p>Transaction ID: ${transaction.id}</p>
      <p>Transaction Status: ${transaction.status}</p>
      <p>Transaction Currency: ${transaction.currency}</p>
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

const handleCustomerStripeTransactionNotification = async (user, totalAmount, transaction) => {
  const apiKey = process.env.BREVO_API_KEY;

  const payload = {
    sender: {
      name: "Transaction Confirmation[AjarnJobs.com]",
      email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
    },
    to: [
      {
        name: user.name,
        email: user.email,
      },
    ],
    subject: `Transaction for ${totalAmount} has been completed successfully.`,
    htmlContent: `
    <html>
     <body>
      <p>Heads up! This e-mail serves as confirmation of you completing your transaction for  ${transaction.currency.toUpperCase()}${totalAmount}.</p>
      <p>User Email: ${user.email}</p>
      <p>User Name: ${user.name}</p>
      <p>User ID: ${user._id}</p>
      <p>Transaction Amount: ${totalAmount}</p>
      <p>Transaction ID: ${transaction.id}</p>
      <p>Transaction Status: ${transaction.status}</p>
      <p>Transaction Currency: ${transaction.currency}</p>
      <br/>
      <p>Best regards,</p>
      <p>The Ajarn Jobs Team</p>
      <br/>
      <p>
        <i>This is an automated email. Please do not reply to this email. If you have any questions, please contact us at info@ajarnjobs.com.</i>
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

const handleJobReportNotification = async (user, job, reason) => {
  const apiKey = process.env.BREVO_API_KEY;
  const payload = {
    sender: {
      name: "Job Violation Report[AjarnJobs.com]",
      email: "noreply@ajarnjobs.com", // make sure noreply@ajarnjobs.com is verified 
    },
    to: [
      {
        name: "Admin",
        email: "info@ajarnjobs.com",
      },
    ],
    subject: `${job.title} has been reported for ${reason}.`,
    htmlContent: `
    <html>
     <body>
      <p>The job ${job.title} has been reported for ${reason}.</p>
      <p>Reporting User Email: ${user.email}</p>
      <p>Reporting User Name: ${user.name}</p>
      <p>User ID: ${user._id}</p>
      <p>Job Title: ${job.title}</p>
      <p>Job ID: ${job._id}</p>
      <p>Job Reason: ${reason}</p>
      <p>Job Description: ${job.description}</p>
      <p>Job Location: ${job.location}</p>
      <p>Job Salary: ${job.salary}</p>
      <p>Job Type: ${job.type}</p>
      <p>Job Posted By: ${job.creator.company}</p>
      <p>Job Posted By Email: ${job.creator.email}</p>
      <p>Job Posted By Name: ${job.creator.name}</p>
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
    
};

module.exports = {
    handleNewApplication,
    handleNewRecruitment,
    handleSupportEmail,
    handleAdminStripeTransactionNotification,
    handleCustomerStripeTransactionNotification,
    handleJobReportNotification,
}
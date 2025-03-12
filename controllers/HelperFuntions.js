import sgMail from "@sendgrid/mail";

/**
 * Send an email with a buffer attachment
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} fileName - The name of the file (without extension)
 * @param {string} fileExtension - The extension of the file (without dot)
 * @param {string[]} recipients - Array of email addresses to send to
 * @param {string} subject - Email subject
 * @param {string} emailContent - Email body content
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmailWithBufferAttachment = async (
  fileBuffer,
  fileName,
  fileExtension,
  recipients,
  subject,
  emailContent
) => {
  try {
    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Convert buffer to base64
    const base64File = fileBuffer.toString("base64");

    // Create attachment object
    const attachment = {
      content: base64File,
      filename: `${fileName}.${fileExtension}`,
      type: `application/${fileExtension}`,
      disposition: "attachment",
    };

    // Create email message
    const msg = {
      to: recipients,
      from: { email: "noreply.epcorn@gmail.com", name: "Epcorn Reports" },
      subject: subject,
      text: emailContent,
      html: emailContent,
      attachments: [attachment],
    };

    // Send email
    const response = await sgMail.send(msg);
    console.log("Email sent successfully");
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error("Failed to send email");
  }
};

export default sendEmailWithBufferAttachment;

import ContactMessage from "../models/ContactMessage.js";
import { sendContactFormEmail } from "../services/email.service.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Save message to database
    const newMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newMessage.save();

    // Send email notification to basebyte.in@gmail.com
    try {
      await sendContactFormEmail(name, email, phone, subject, message);
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
    }

    return res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error in submitContactForm:", error);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

import React, { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit Indian number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-3xl text-center max-w-lg mx-auto shadow-xl animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground">Message Sent!</h3>
        <p className="text-muted-foreground text-base mb-6">
          Thank you for reaching out! We'll get back to you at {formData.email || 'your email'} soon.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0C]/80 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl max-w-2xl mx-auto shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="space-y-1.5">
            <label className="text-white/90 font-medium text-sm">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full bg-[#111115] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/90 font-medium text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full bg-[#111115] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/90 font-medium text-sm">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="10-digit Number"
              required
              className="w-full bg-[#111115] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/90 font-medium text-sm">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className="w-full bg-[#111115] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-white/90 font-medium text-sm">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message here..."
            required
            rows={4}
            className="w-full bg-[#111115] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              Send Message <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

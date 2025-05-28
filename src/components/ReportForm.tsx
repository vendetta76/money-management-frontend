import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Send, BugReport, Feedback, CheckCircle } from "@mui/icons-material";

interface FormData {
  name: string;
  contact: string;
  reportType: "feedback" | "bug";
  message: string;
}

interface FormErrors {
  name?: string;
  contact?: string;
  message?: string;
}

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact: "",
    reportType: "feedback",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Contact validation (optional but if provided, should be valid)
    if (formData.contact.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const telegramRegex = /^@[a-zA-Z0-9_]{5,32}$/;
      
      if (!emailRegex.test(formData.contact) && !telegramRegex.test(formData.contact)) {
        newErrors.contact = "Please enter a valid email or Telegram handle (@username)";
      }
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name as string]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setError("");

    try {
      // Simulate API call - replace with your actual endpoint
      const response = await fetch("/api/report/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      setSubmitted(true);
      setFormData({
        name: "",
        contact: "",
        reportType: "feedback",
        message: "",
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
      
    } catch (err: any) {
      console.error("Report submission error:", err);
      setError(
        err.message.includes("fetch") 
          ? "Unable to connect to server. Please check your internet connection." 
          : err.message || "Failed to send report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeInfo = () => {
    return formData.reportType === "bug" 
      ? {
          icon: <BugReport />,
          color: "error" as const,
          title: "Bug Report",
          description: "Help us fix issues by describing what went wrong"
        }
      : {
          icon: <Feedback />,
          color: "primary" as const,
          title: "Feedback & Suggestions",
          description: "Share your ideas to help us improve MeowIQ"
        };
  };

  const reportTypeInfo = getReportTypeInfo();

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, margin: "0 auto" }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Submit Report
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your feedback helps us make MeowIQ better for everyone! 🐱
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Report Type Selection */}
          <FormControl fullWidth required>
            <InputLabel id="reportType-label">Report Type</InputLabel>
            <Select
              labelId="reportType-label"
              name="reportType"
              value={formData.reportType}
              label="Report Type"
              onChange={handleChange}
            >
              <MenuItem value="feedback">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Feedback color="primary" />
                  💬 Suggestion & Feedback
                </Box>
              </MenuItem>
              <MenuItem value="bug">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BugReport color="error" />
                  🐞 Bug Report
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Report Type Info Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              backgroundColor: `${reportTypeInfo.color}.lighter`,
              border: 1,
              borderColor: `${reportTypeInfo.color}.main`,
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {reportTypeInfo.icon}
              <Typography variant="subtitle2" fontWeight={600} color={`${reportTypeInfo.color}.main`}>
                {reportTypeInfo.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {reportTypeInfo.description}
            </Typography>
          </Paper>

          {/* Name Field */}
          <TextField
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Enter your full name"
          />

          {/* Contact Field */}
          <TextField
            label="Contact Info (Optional)"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            fullWidth
            error={!!errors.contact}
            helperText={errors.contact || "Email or Telegram handle (@username) for follow-up"}
            placeholder="your.email@example.com or @yourtelegram"
          />

          {/* Message Field */}
          <TextField
            label="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            multiline
            minRows={4}
            maxRows={8}
            fullWidth
            required
            error={!!errors.message}
            helperText={
              errors.message || 
              `${formData.message.length}/1000 characters ${
                formData.reportType === 'bug' 
                  ? '• Include steps to reproduce the issue' 
                  : '• Be specific about your suggestions'
              }`
            }
            placeholder={
              formData.reportType === 'bug'
                ? "Describe the bug: What did you expect to happen? What actually happened? Steps to reproduce..."
                : "Share your feedback: What would you like to see improved? Any new features you'd like?"
            }
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {loading ? 'Sending...' : 'Send Report'}
          </Button>
        </Stack>
      </form>

      {/* Success Message */}
      {submitted && (
        <Alert 
          severity="success" 
          sx={{ mt: 3 }}
          icon={<CheckCircle />}
        >
          <Typography variant="subtitle2" gutterBottom>
            ✅ Report sent successfully!
          </Typography>
          <Typography variant="body2">
            Thank you for your {formData.reportType === 'bug' ? 'bug report' : 'feedback'}! 
            We'll review it and get back to you if needed.
          </Typography>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            ❌ Failed to send report
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Tips */}
      <Paper elevation={0} sx={{ mt: 3, p: 2, backgroundColor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>💡 Tip:</strong> The more details you provide, the better we can help! 
          Include screenshots or screen recordings if reporting a bug.
        </Typography>
      </Paper>
    </Paper>
  );
};

export default ReportForm;
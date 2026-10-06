package com.personalized.learning.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:adpativelearnai@gmail.com}")
    private String fromEmail;

    public boolean sendOtpEmail(String toEmail, String otp) {
        String subject = "Your AdaptiveLearn Password Reset Verification Code: " + otp;
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
                .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; }
                .header { background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #dc2626; }
                .header h1 { color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px; }
                .content { padding: 32px 24px; }
                .badge { display: inline-block; padding: 4px 10px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 2px; }
                .otp-box { margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; text-align: center; border-radius: 4px; }
                .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626; margin: 0; }
                .footer { padding: 20px 24px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>AdaptiveLearn Platform</h1>
                </div>
                <div class="content">
                  <span class="badge">Security Verification</span>
                  <h2 style="font-size: 18px; margin-top: 12px; margin-bottom: 8px;">Password Reset Request</h2>
                  <p style="font-size: 14px; line-height: 1.5; color: #475569;">
                    We received a request to reset the password for your AdaptiveLearn account (<strong>%s</strong>). Use the verification code below to complete the reset.
                  </p>
                  <div class="otp-box">
                    <div class="otp-code">%s</div>
                  </div>
                  <p style="font-size: 13px; color: #64748b; line-height: 1.4;">
                    ⏳ This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this message.
                  </p>
                </div>
                <div class="footer">
                  © 2026 AdaptiveLearn AI Platform. All rights reserved. • adpativelearnai@gmail.com
                </div>
              </div>
            </body>
            </html>
            """.formatted(toEmail, otp);

        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "AdaptiveLearn Security");
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                logger.info("Successfully dispatched Password Reset OTP email to: {}", toEmail);
                return true;
            } else {
                logger.warn("JavaMailSender is not initialized. Logging OTP to console: [{}] for {}", otp, toEmail);
                return false;
            }
        } catch (Exception e) {
            logger.error("Failed to send OTP email via SMTP to {}: {}. Fallback OTP code: [{}]", toEmail, e.getMessage(), otp);
            return false;
        }
    }
}

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


def send_otp_email(to_email: str, company_name: str, otp: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Hire Karo — Email Verification Code"
        msg["From"] = f"Hire Karo <{settings.SMTP_USER}>"
        msg["To"] = to_email

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 32px; text-align:center;">
                      <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700; letter-spacing:-0.5px;">
                        🧠 Hire Karo
                      </h1>
                      <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">
                        AI-Powered Hiring Platform
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 40px 32px;">
                      <h2 style="color:#1a1a2e; margin:0 0 12px; font-size:22px; font-weight:600;">
                        Verify Your Email Address
                      </h2>
                      <p style="color:#555; font-size:15px; line-height:1.6; margin:0 0 28px;">
                        Hi <strong>{company_name}</strong>, welcome to Hire Karo! 
                        Use the verification code below to complete your signup.
                      </p>

                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 28px;">
                            <div style="display:inline-block; background: linear-gradient(135deg, #667eea15, #764ba215); border: 2px dashed #667eea; border-radius:12px; padding: 24px 48px;">
                              <p style="margin:0 0 6px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                                Verification Code
                              </p>
                              <p style="margin:0; color:#667eea; font-size:42px; font-weight:800; letter-spacing:10px; font-family: 'Courier New', monospace;">
                                {otp}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#fff8e1; border-left:4px solid #ffc107; border-radius:0 8px 8px 0; padding:14px 18px; margin-bottom:24px;">
                            <p style="margin:0; color:#856404; font-size:13px; line-height:1.5;">
                              ⏰ <strong>This code expires in 10 minutes.</strong> 
                              Do not share this code with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <hr style="border:none; border-top:1px solid #eee; margin:0;">
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; text-align:center;">
                      <p style="color:#aaa; font-size:12px; margin:0; line-height:1.6;">
                        If you did not create an account on Hire Karo, please ignore this email.<br>
                        &copy; 2025 Hire Karo. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

       

        return True

    except Exception as e:
        print(f"Email send failed: {e}")
        return False
    

def send_shortlist_email(to_email: str, candidate_name: str, job_title: str, company_name: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Congratulations! You've been shortlisted — {job_title}"
        msg["From"] = f"{company_name} via Hire Karo <{settings.SMTP_USER}>"
        msg["To"] = to_email

        html = f"""
        <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr><td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">🎉 You've Been Shortlisted!</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">{company_name}</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 16px;">Dear <strong>{candidate_name or 'Candidate'}</strong>,</p>
                <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px;">
                  We are pleased to inform you that your application for <strong>{job_title}</strong> has been reviewed and 
                  you have been <strong style="color:#10b981;">shortlisted for the interview</strong>.
                </p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 20px;">
                  <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Next Steps</p>
                  <p style="margin:8px 0 0;color:#15803d;font-size:14px;">You will shortly receive an email with your interview date, time, and instructions.</p>
                </div>
                <p style="color:#555;font-size:14px;line-height:1.7;">Please keep an eye on your inbox. We look forward to speaking with you!</p>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
                <p style="color:#aaa;font-size:12px;margin:0;">This email was sent by Hire Karo on behalf of {company_name}</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
        </body></html>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo(); server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Shortlist email failed: {e}")
        return False


def send_rejection_email(to_email: str, candidate_name: str, job_title: str, company_name: str, reason: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Update on your application — {job_title}"
        msg["From"] = f"{company_name} via Hire Karo <{settings.SMTP_USER}>"
        msg["To"] = to_email

        html = f"""
        <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr><td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr><td style="background:linear-gradient(135deg,#0a1628,#1e3a5f);padding:40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">🧠 Hire Karo</h1>
                <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Application Update — {company_name}</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 16px;">Dear <strong>{candidate_name or 'Candidate'}</strong>,</p>
                <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px;">
                  Thank you for your interest in the <strong>{job_title}</strong> position at <strong>{company_name}</strong>. 
                  After careful review, we regret to inform you that we will not be moving forward with your application at this time.
                </p>
                <div style="background:#fef9f0;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin:0 0 20px;">
                  <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">📋 Feedback</p>
                  <p style="margin:8px 0 0;color:#b45309;font-size:14px;">{reason}</p>
                </div>
                <p style="color:#555;font-size:14px;line-height:1.7;">We encourage you to apply for future opportunities that match your profile. Thank you for your time.</p>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
                <p style="color:#aaa;font-size:12px;margin:0;">This email was sent by Hire Karo on behalf of {company_name}</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
        </body></html>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo(); server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Rejection email failed: {e}")
        return False
    
def send_interview_email(
    to_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    scheduled_date: str,
    start_time: str,
    duration_minutes: int,
    username: str,
    password: str,
    interview_link: str
) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Interview Scheduled — {job_title} at {company_name}"
        msg["From"] = f"{company_name} via Hire Karo <{settings.SMTP_USER}>"
        msg["To"] = to_email

        hours = duration_minutes // 60
        mins = duration_minutes % 60
        duration_str = f"{hours}h {mins}min" if hours > 0 else f"{mins} minutes"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" 
              style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr><td style="background:linear-gradient(135deg,#0a1628,#162847);padding:40px;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🧠</div>
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Interview Scheduled!</h1>
                <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:14px;">
                  {company_name} · {job_title}
                </p>
              </td></tr>

              <!-- Body -->
              <tr><td style="padding:40px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 20px;">
                  Dear <strong>{candidate_name or 'Candidate'}</strong>,
                </p>
                <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 28px;">
                  Congratulations! Your interview for <strong>{job_title}</strong> has been scheduled. 
                  Please find your interview details below.
                </p>

                <!-- Interview Details -->
                <table width="100%" cellpadding="0" cellspacing="0" 
                  style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                  <tr><td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="8">
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;width:40%;">📅 Date</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{scheduled_date}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;">⏰ Time</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{start_time}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;">⏱️ Duration</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{duration_str}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;">💼 Position</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{job_title}</td>
                      </tr>
                    </table>
                  </td></tr>
                </table>

                <!-- Credentials -->
                <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;
                  border-radius:12px;padding:24px;margin-bottom:28px;">
                  <p style="margin:0 0 14px;color:#1e40af;font-size:14px;font-weight:700;">
                    🔐 Your Interview Login Credentials
                  </p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#3b82f6;font-size:12px;font-weight:600;
                        text-transform:uppercase;padding:4px 16px 4px 0;width:100px;">Username</td>
                      <td style="font-family:'Courier New',monospace;font-size:16px;font-weight:800;
                        color:#1e293b;background:#fff;padding:6px 14px;border-radius:8px;
                        border:1px solid #bfdbfe;">{username}</td>
                    </tr>
                    <tr><td colspan="2" style="padding:6px 0;"></td></tr>
                    <tr>
                      <td style="color:#3b82f6;font-size:12px;font-weight:600;
                        text-transform:uppercase;padding:4px 16px 4px 0;">Password</td>
                      <td style="font-family:'Courier New',monospace;font-size:16px;font-weight:800;
                        color:#1e293b;background:#fff;padding:6px 14px;border-radius:8px;
                        border:1px solid #bfdbfe;">{password}</td>
                    </tr>
                  </table>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="{interview_link}" 
                    style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1e40af);
                    color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;
                    font-size:15px;font-weight:700;box-shadow:0 4px 16px rgba(37,99,235,0.4);">
                    Join Interview →
                  </a>
                </div>

                <!-- Warning -->
                <div style="background:#fff8ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;">
                  <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
                    ⚠️ <strong>Important:</strong> You can only access the interview during the scheduled 
                    time slot. The link will not work before or after the allotted time. 
                    Please be ready 5 minutes early.
                  </p>
                </div>
              </td></tr>

              <!-- Footer -->
              <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">
                  Sent by Hire Karo on behalf of {company_name} · Do not share your credentials
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Interview email failed: {e}")
        return False


def send_reschedule_email(
    to_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    scheduled_date: str,
    start_time: str,
    duration_minutes: int,
    username: str,
    interview_link: str
) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Interview Rescheduled — {job_title} at {company_name}"
        msg["From"] = f"{company_name} via Hire Karo <{settings.SMTP_USER}>"
        msg["To"] = to_email

        hours = duration_minutes // 60
        mins = duration_minutes % 60
        duration_str = f"{hours}h {mins}min" if hours > 0 else f"{mins} minutes"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">📅</div>
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Interview Rescheduled</h1>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">
                  {company_name} · {job_title}
                </p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#1a1a2e;font-size:16px;margin:0 0 16px;">
                  Dear <strong>{candidate_name}</strong>,
                </p>
                <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
                  Your interview for <strong>{job_title}</strong> has been rescheduled.
                  Please note the updated date and time below.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                  <tr><td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="8">
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;width:40%;">📅 New Date</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{scheduled_date}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;">⏰ New Time</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{start_time}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;padding:6px 0;">⏱️ Duration</td>
                        <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">{duration_str}</td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;">🔐 Your Login Credentials (unchanged)</p>
                  <p style="margin:0;color:#3b82f6;font-size:13px;">Username: <strong style="font-family:monospace;">{username}</strong></p>
                  <p style="margin:4px 0 0;color:#64748b;font-size:12px;">Your password remains the same as before.</p>
                </div>
                <div style="text-align:center;">
                  <a href="{interview_link}"
                    style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1e40af);
                    color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;
                    font-size:15px;font-weight:700;">
                    Join Interview →
                  </a>
                </div>
              </td></tr>
              <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">
                  Sent by Hire Karo on behalf of {company_name}
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
        </body></html>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Reschedule email failed: {e}")
        return False
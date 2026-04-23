# Complete Supabase Setup for Email OTP Verification

## Current Auth Flow Issues

### Sign Up Flow (Currently Broken)
1. User fills registration form → Creates account
2. **PROBLEM**: Goes directly to Login screen without email verification
3. User can sign in without verifying email

### Forgot Password Flow (Currently Broken)
1. User enters email → Sends reset email
2. **PROBLEM**: Uses magic link instead of OTP code
3. ResetPasswordOtp screen expects OTP but receives link

## What You Need to Do in Supabase Dashboard

### Step 1: Enable Email Confirmation (CRITICAL)

1. Go to: https://fbtcfdgrattbcikfzbhp.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. **CHECK** these boxes:
   - ✅ Enable Email provider
   - ✅ **Confirm email** ← MUST BE CHECKED
   - ✅ **Enable email OTP** ← MUST BE CHECKED
5. Click **Save**

### Step 2: Update Email Templates

#### A. Confirm Signup Template

1. Go to **Authentication** → **Email Templates**
2. Click **Confirm signup**
3. Replace entire content with:

```html
<h2>Welcome to Halo Health!</h2>

<p>Thank you for signing up. Use this code to verify your email:</p>

<div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
  <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #333;">{{ .Token }}</h1>
</div>

<p>This code expires in 24 hours.</p>

<p>If you didn't create this account, please ignore this email.</p>

<p>Best regards,<br>The Halo Health Team</p>
```

4. Click **Save**

#### B. Reset Password Template

1. Still in **Email Templates**
2. Click **Reset Password**
3. Replace entire content with:

```html
<h2>Reset Your Password</h2>

<p>You requested to reset your password. Use this code:</p>

<div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
  <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #333;">{{ .Token }}</h1>
</div>

<p>This code expires in 24 hours.</p>

<p>If you didn't request this, please ignore this email.</p>

<p>Best regards,<br>The Halo Health Team</p>
```

4. Click **Save**

### Step 3: Configure SMTP (Optional but Recommended)

**For Development**: Supabase's built-in email works but has rate limits

**For Production**: Use custom SMTP

#### Option A: Gmail SMTP
1. Get App Password from Google Account
2. In Supabase: **Authentication** → **Settings** → **SMTP Settings**
3. Enable "Enable Custom SMTP"
4. Fill in:
   - Sender name: `Halo Health`
   - Sender email: `your-email@gmail.com`
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `[16-char app password]`

#### Option B: SendGrid (Recommended)
1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Create API Key with Mail Send permission
3. In Supabase SMTP Settings:
   - Sender name: `Halo Health`
   - Sender email: `noreply@yourdomain.com`
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `[Your SendGrid API key]`

### Step 4: Test Configuration

1. Sign up with a real email address
2. Check inbox (and spam folder)
3. Should receive 6-digit code
4. Enter code in app
5. Should verify successfully

## Fixed Auth Flow

### Sign Up Flow (After Fix)
1. User fills registration form
2. Account created in Supabase
3. **Navigate to VerifyEmail screen**
4. User enters 6-digit OTP code
5. Email verified → Navigate to Login
6. User signs in → Access app

### Forgot Password Flow (After Fix)
1. User enters email on ForgotPassword screen
2. OTP sent to email
3. **Navigate to ResetPasswordOtp screen**
4. User enters 6-digit OTP code
5. User enters new password
6. Password reset → Navigate to Login

## Common Issues & Solutions

### Issue 1: "Email not delivering"
**Solution**: 
- Check spam folder
- Verify SMTP settings
- Check Supabase logs: **Logs** → **Auth Logs**
- Try different email provider (Gmail, Outlook)

### Issue 2: "Invalid OTP code"
**Solution**:
- Ensure "Enable email OTP" is checked
- Verify email template uses `{{ .Token }}` not `{{ .ConfirmationURL }}`
- Check code hasn't expired (24 hours)

### Issue 3: "User can sign in without verification"
**Solution**:
- Ensure "Confirm email" is checked in Email provider settings
- Backend should check `email_confirmed_at` field

### Issue 4: "Rate limit exceeded"
**Solution**:
- Set up custom SMTP (Gmail or SendGrid)
- Supabase built-in email has strict limits

## Verification Checklist

After setup, verify:
- [ ] "Confirm email" is checked in Email provider
- [ ] "Enable email OTP" is checked in Email provider
- [ ] Confirm signup template uses `{{ .Token }}`
- [ ] Reset password template uses `{{ .Token }}`
- [ ] SMTP configured (optional but recommended)
- [ ] Test signup with real email
- [ ] Receive 6-digit code in email
- [ ] Code verification works in app
- [ ] Test forgot password flow
- [ ] Receive reset code in email
- [ ] Password reset works

## Important Notes

1. **{{ .Token }}** = 6-digit OTP code (what we want)
2. **{{ .ConfirmationURL }}** = Magic link (old method)
3. Email templates MUST use `{{ .Token }}` for OTP flow
4. Both "Confirm email" AND "Enable email OTP" must be checked
5. Users cannot sign in until email is verified
6. OTP codes expire after 24 hours
7. Resend has 60-second cooldown in app

## Next Steps After Supabase Setup

The code is already updated to:
1. Navigate to VerifyEmail after signup
2. Navigate to ResetPasswordOtp after forgot password
3. Handle OTP verification properly
4. Show user-friendly error messages
5. Include resend functionality with cooldown

Just complete the Supabase configuration above and the flow will work perfectly!

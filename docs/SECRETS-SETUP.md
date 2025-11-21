# Secrets Setup Guide

Complete guide to configuring all API keys and credentials.

## 🔐 Security Best Practices

1. **NEVER commit secrets to the repository**
2. Store all credentials as GitHub Secrets (encrypted at rest)
3. Use app-specific passwords (not your main password)
4. Rotate secrets periodically
5. Use minimum required permissions for API tokens

## Adding Secrets to GitHub

1. Go to repository **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

---

## Weather API (OpenWeather)

### Get API Key
1. Sign up at [OpenWeather](https://openweathermap.org/api)
2. Go to API Keys section
3. Copy your API key

### Required Secrets
```
OPENWEATHER_API_KEY = your_api_key_here
```

### Optional Secrets
```
OPENWEATHER_CITY = Boston
OPENWEATHER_UNITS = imperial   # or metric
```

---

## Email Notifications (Gmail)

### Get App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (if not enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select app: **Mail**, device: **Other**
5. Copy the 16-character password

### Required Secrets
```
EMAIL_SMTP_HOST = smtp.gmail.com
EMAIL_SMTP_PORT = 587
EMAIL_USERNAME = your.email@gmail.com
EMAIL_PASSWORD = your_16_char_app_password
EMAIL_TO = where.to.send@email.com
```

### Alternative Email Providers

**Outlook/Office 365:**
```
EMAIL_SMTP_HOST = smtp.office365.com
EMAIL_SMTP_PORT = 587
```

**Custom SMTP Server:**
```
EMAIL_SMTP_HOST = mail.yourserver.com
EMAIL_SMTP_PORT = 587 or 465
```

---

## SMS Notifications (Twilio)

### Get Twilio Credentials
1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Get $15 free credit for testing
3. Go to Console Dashboard
4. Copy Account SID and Auth Token
5. Get a Twilio phone number

### Required Secrets
```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = your_auth_token_here
TWILIO_FROM_PHONE = +15551234567  # Your Twilio number
TWILIO_TO_PHONE = +15559876543    # Your personal number
```

**Note:** Free trial numbers can only send to verified numbers.

---

## Slack Integration

### Create Incoming Webhook
1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: "Actionsflow Bot", select workspace
4. Click **Incoming Webhooks**
5. Toggle **Activate Incoming Webhooks** to On
6. Click **Add New Webhook to Workspace**
7. Select channel and authorize
8. Copy the webhook URL

### Required Secrets
```
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### Optional: Slack Bot Token (for advanced features)
```
SLACK_BOT_TOKEN = xoxb-your-token-here
```

See [Slack Integration Guide](SLACK-INTEGRATION.md) for slash commands.

---

## GitHub Token

**Auto-provided by GitHub Actions** - no setup needed!

For local testing or additional permissions:

### Create Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token

### Optional Secret
```
GITHUB_TOKEN = ghp_your_token_here
```

---

## Reddit API (Optional)

For better rate limits when monitoring Reddit.

### Get API Credentials
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click **create another app**
3. Type: **script**
4. Copy client ID and secret

### Optional Secrets
```
REDDIT_CLIENT_ID = your_client_id
REDDIT_CLIENT_SECRET = your_client_secret
```

---

## Verifying Secrets

Test your configuration with the emergency alert workflow:

```bash
# Go to Actions tab → Emergency Alert Demo → Run workflow
```

Check that you receive:
- ✅ Email (if EMAIL_USERNAME configured)
- ✅ SMS (if TWILIO_ACCOUNT_SID configured)
- ✅ Slack message (if SLACK_WEBHOOK_URL configured)

---

## Complete Secrets Checklist

Copy this list to track your setup:

```
Core Services:
[ ] OPENWEATHER_API_KEY
[ ] EMAIL_USERNAME
[ ] EMAIL_PASSWORD
[ ] EMAIL_TO

Optional (recommended):
[ ] SLACK_WEBHOOK_URL
[ ] OPENWEATHER_CITY
[ ] OPENWEATHER_UNITS

Advanced:
[ ] TWILIO_ACCOUNT_SID
[ ] TWILIO_AUTH_TOKEN
[ ] TWILIO_FROM_PHONE
[ ] TWILIO_TO_PHONE
[ ] REDDIT_CLIENT_ID
[ ] REDDIT_CLIENT_SECRET
```

---

## Troubleshooting

### Email not sending?
- Verify app password is correct (16 characters, no spaces)
- Check Gmail security settings
- Try alternative SMTP port (465 with SSL)

### SMS not working?
- Verify trial account phone numbers are verified
- Check Twilio console for error logs
- Ensure phone numbers include country code (+1 for US)

### Slack messages not appearing?
- Test webhook URL with curl:
  ```bash
  curl -X POST "YOUR_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d '{"text":"Test message"}'
  ```
- Verify webhook is for correct channel
- Check Slack app permissions

---

## Security Notes

### If a Secret is Compromised

1. **Immediately revoke** the credential at the source (API provider)
2. **Delete** the secret from GitHub
3. **Generate new** credential
4. **Add new** secret to GitHub
5. **Test** workflows still work

### Secret Rotation Schedule

Recommended rotation:
- API keys: Every 90 days
- Passwords: Every 30 days
- Tokens: Every 60 days

Set calendar reminders!

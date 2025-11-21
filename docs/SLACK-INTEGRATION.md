# Slack Integration Guide

Complete guide to integrating Actionsflow with Slack.

## Quick Setup (Incoming Webhooks)

### 1. Create Webhook

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: `Actionsflow Bot`
4. Select your workspace
5. Click **Incoming Webhooks** in left sidebar
6. Toggle **Activate Incoming Webhooks** to **On**
7. Click **Add New Webhook to Workspace**
8. Select channel (e.g., `#automation`)
9. Click **Allow**
10. Copy the webhook URL

### 2. Add to GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: `https://hooks.slack.com/services/...` (paste webhook URL)
5. Click **Add secret**

### 3. Test

Run the emergency alert workflow manually to test Slack notifications.

---

## Sending Messages

### Simple Text Message

```yaml
- name: Send Slack message
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H 'Content-Type: application/json' \
      -d '{"text": "Hello from Actionsflow!"}'
```

### Formatted Block Message

```yaml
- name: Send formatted message
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H 'Content-Type: application/json' \
      -d '{
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "🚀 Deployment Complete"
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": "*Environment:*\nProduction"
              },
              {
                "type": "mrkdwn",
                "text": "*Status:*\nSuccess"
              }
            ]
          }
        ]
      }'
```

### With Buttons (Actions)

```yaml
- name: Send message with button
  run: |
    curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
      -H 'Content-Type: application/json' \
      -d '{
        "text": "Deployment ready",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Deployment is ready. Click to approve:"
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Approve"
                },
                "url": "https://github.com/jeremyeder/actionsflow-automation/actions"
              }
            ]
          }
        ]
      }'
```

---

## Advanced: Slash Commands

Enable triggering workflows from Slack with slash commands.

### 1. Create Slash Command

1. Go to your Slack app settings
2. Click **Slash Commands**
3. Click **Create New Command**
4. Command: `/actionsflow`
5. Request URL: Use GitHub webhook endpoint (see below)
6. Short description: `Trigger Actionsflow workflows`
7. Click **Save**

### 2. Set Up GitHub Webhook

You need an intermediary service to convert Slack requests to GitHub `repository_dispatch`:

**Option A: Use a serverless function (AWS Lambda, Cloudflare Workers)**

```javascript
// Example Cloudflare Worker
export default {
  async fetch(request) {
    const body = await request.formData();
    const command = body.get('text');
    const user = body.get('user_name');

    // Trigger GitHub repository_dispatch
    const githubResponse = await fetch(
      'https://api.github.com/repos/jeremyeder/actionsflow-automation/dispatches',
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'slack_command',
          client_payload: {
            command: command,
            user_name: user,
            channel_name: body.get('channel_name')
          }
        })
      }
    );

    return new Response(
      JSON.stringify({ text: `Triggered workflow: ${command}` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

**Option B: Use ngrok for local testing**

```bash
# Start ngrok
ngrok http 3000

# Use ngrok URL in Slack slash command
# https://abc123.ngrok.io/slack
```

### 3. Handle in Workflow

The `slack-trigger.yml` workflow is already configured to handle repository_dispatch events.

---

## Message Formatting

### Markdown

```
*bold*
_italic_
~strike~
`code`
```

### Links

```
<https://example.com|Link Text>
```

### Mentions

```
<@USER_ID>  # Mention user
<!channel>  # Mention channel
<!here>     # Mention active users
```

### Emoji

```
:rocket:  🚀
:fire:    🔥
:check:   ✅
:x:       ❌
```

---

## Block Kit Examples

### Simple Section

```json
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "*This is bold* and _this is italic_"
  }
}
```

### Section with Image

```json
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "Check out this deployment:"
  },
  "accessory": {
    "type": "image",
    "image_url": "https://example.com/image.png",
    "alt_text": "Deployment graph"
  }
}
```

### Divider

```json
{
  "type": "divider"
}
```

### Context (Footer)

```json
{
  "type": "context",
  "elements": [
    {
      "type": "mrkdwn",
      "text": "Triggered by Actionsflow | <https://github.com/jeremyeder|View on GitHub>"
    }
  ]
}
```

---

## Rate Limits

Slack incoming webhooks have rate limits:

- **1 message per second** per webhook
- Bursts allowed, but sustained rate is limited
- If exceeded, you'll receive HTTP 429 errors

**Best practice:** Add delays between messages:

```yaml
- name: Send message 1
  run: curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" ...

- name: Wait
  run: sleep 2

- name: Send message 2
  run: curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" ...
```

---

## Troubleshooting

### Webhook not working?

1. Test with curl:
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test"}'
   ```

2. Check for errors:
   - `invalid_payload` - JSON syntax error
   - `channel_not_found` - Webhook deleted or channel removed
   - `400` - Malformed request

### Messages not formatting?

- Use [Block Kit Builder](https://app.slack.com/block-kit-builder/) to test
- Validate JSON syntax
- Check quotes are properly escaped

### Rate limited?

- Add delays between messages
- Batch multiple notifications into one message
- Use Slack's batch API for high volume

---

## Resources

- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Message Formatting](https://api.slack.com/reference/surfaces/formatting)
- [Block Kit Documentation](https://api.slack.com/block-kit)

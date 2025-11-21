# Quick Start Guide

Add your first automated workflow in 5 minutes!

## Step 1: Configure Secrets

1. Go to your repository's **Settings** tab
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these minimum secrets for the morning digest:

```
Name: OPENWEATHER_API_KEY
Value: your_api_key_from_openweathermap.org

Name: EMAIL_USERNAME
Value: your.email@gmail.com

Name: EMAIL_PASSWORD
Value: your_gmail_app_password

Name: EMAIL_TO
Value: where.to.send@email.com
```

## Step 2: Test a Workflow

1. Go to the **Actions** tab
2. Click on **Actionsflow** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait 30-60 seconds
5. Check your email for the morning digest!

## Step 3: Add Your Own Workflow

Create `workflows/my-first-workflow.yml`:

```yaml
name: My First Workflow
on:
  # RSS feed trigger
  rss:
    url: https://hnrss.org/newest?points=100
    config:
      every: 60  # Check every hour

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "New HN post: ${{ on.rss.outputs.title }}",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*<${{ on.rss.outputs.link }}|${{ on.rss.outputs.title }}>*"
                }
              }]
            }'
```

**That's it!** Commit and push. Your workflow runs automatically.

## Common Workflow Patterns

### Daily at Specific Time

```yaml
on:
  script:
    config:
      every: "0 9 * * *"  # 9 AM UTC daily
      timeZone: "America/New_York"  # Convert to EST/EDT
```

### Every N Minutes

```yaml
on:
  script:
    config:
      every: 30  # Every 30 minutes
```

### Weekdays Only

```yaml
on:
  script:
    config:
      every: "0 9 * * 1-5"  # 9 AM Monday-Friday
```

### Manual Trigger Only

```yaml
on:
  script:
    config:
      skipSchedule: true
      manualRunEvent:
        - workflow_dispatch
```

## Next Steps

- [Configure more secrets](SECRETS-SETUP.md) for SMS, Slack, etc.
- [Browse workflow templates](WORKFLOW-TEMPLATES.md) for more examples
- [Set up Slack integration](SLACK-INTEGRATION.md)
- Customize existing workflows in `workflows/` directory

## Troubleshooting

**Workflow not running?**
- Check GitHub Actions tab for error messages
- Verify secrets are set correctly
- Make sure `.github/workflows/actionsflow.yml` schedule is uncommented

**Not receiving notifications?**
- Test secrets with manual workflow run
- Check spam folder for emails
- Verify Slack webhook URL is correct

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more help.

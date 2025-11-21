# Actionsflow Automation Hub

> **Free IFTTT/Zapier alternative** for automating workflows using GitHub Actions. Monitor weather, aggregate news, track GitHub activity, integrate with Slack, and more!

[![Actionsflow](https://img.shields.io/badge/Powered%20by-Actionsflow-blue)](https://github.com/actionsflow/actionsflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🌤️ Morning Digest**: Daily email with weather, top Reddit posts, and Hacker News
- **👁️ GitHub Monitor**: Track issues, PRs, and releases from your favorite repos
- **💬 Slack Integration**: Trigger workflows from Slack commands and send notifications
- **📧 Multi-Channel Alerts**: Send to email, SMS, Slack, or save to files
- **🔄 Fully Automated**: Runs on GitHub Actions (free tier: 2,000 minutes/month)
- **🔐 Secure**: All API keys stored as encrypted GitHub Secrets

## 🚀 Quick Start

### 1. Set Up Repository

This repository is already configured! Just add your secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the secrets listed in [Secret Setup Guide](docs/SECRETS-SETUP.md)

### 2. Essential Secrets

At minimum, configure these for the morning digest:

- `OPENWEATHER_API_KEY` - Get free API key from [OpenWeather](https://openweathermap.org/api)
- `EMAIL_USERNAME` - Your Gmail address
- `EMAIL_PASSWORD` - Gmail app password ([how to create](https://support.google.com/accounts/answer/185833))
- `EMAIL_TO` - Where to send notifications

### 3. Enable Workflows

Workflows run automatically every 15 minutes (you can adjust in `.github/workflows/actionsflow.yml`).

To trigger manually:
1. Go to **Actions** tab
2. Select **Actionsflow** workflow
3. Click **Run workflow**

## 📋 Available Workflows

| Workflow | Schedule | Triggers | Outputs |
|----------|----------|----------|---------|
| **Morning Digest** | Daily 7 AM ET | Weather + Reddit + HN | Email, Slack |
| **GitHub Monitor** | Hourly | New issues/PRs/releases | Email, Slack, Files |
| **Slack Commands** | On-demand | Slack webhook | Slack response |
| **Emergency Alert** | Manual only | Workflow dispatch | Email, SMS, Slack, Files, GitHub Issue |

## 📖 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Add your first workflow in 5 minutes
- **[Secrets Setup](docs/SECRETS-SETUP.md)** - Configure API keys and credentials
- **[Workflow Templates](docs/WORKFLOW-TEMPLATES.md)** - Copy-paste templates for common tasks
- **[Slack Integration](docs/SLACK-INTEGRATION.md)** - Connect Slack webhooks and commands
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 Example Use Cases

### Monitor Cryptocurrency Prices
```yaml
on:
  script:
    config:
      every: "0 */4 * * *"  # Every 4 hours
    run: |
      const btc = await helpers.axios.get('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      return [{ price: btc.data.data.amount }];
```

### Daily Stand-up Reminder
```yaml
on:
  script:
    config:
      every: "0 9 * * 1-5"  # Weekdays 9 AM
      timeZone: "America/New_York"
    run: |
      return [{ message: "Time for daily stand-up!" }];
```

### Website Uptime Monitor
```yaml
on:
  script:
    config:
      every: 5  # Every 5 minutes
    run: |
      const response = await helpers.axios.get('https://yoursite.com');
      if (response.status !== 200) {
        return [{ error: 'Site down!', status: response.status }];
      }
      return [];
```

## 🔐 Security

- **Never commit secrets** to this repository
- All sensitive data stored as GitHub Secrets (encrypted)
- Workflow files are public-safe (no API keys in code)
- Review [Security Best Practices](docs/SECRETS-SETUP.md#security-best-practices)

## 📊 Dashboard

View workflow status and manually trigger runs:
**[Open Dashboard](https://jeremyeder.github.io/actionsflow-automation/)**

## 🛠️ Customization

### Add a New Workflow

1. Create `workflows/my-workflow.yml`
2. Define your trigger and schedule
3. Add job steps for actions
4. Commit and push - it runs automatically!

See [Quick Start Guide](docs/QUICKSTART.md) for detailed instructions.

### Modify Existing Workflows

All workflow files are in `workflows/` directory:
- `morning-digest.yml` - Weather + news aggregator
- `github-monitor.yml` - Repository activity tracking
- `slack-trigger.yml` - Slack command handler
- `emergency-alert.yml` - Multi-channel alert demo

## 🤝 Contributing

This is a personal automation repository, but feel free to:
- Fork for your own automation needs
- Submit issues for bugs
- Share interesting workflow patterns

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Resources

- [Actionsflow Documentation](https://actionsflow.github.io/docs/)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actionsflow Workflows](https://github.com/actionsflow/awesome-actionsflow)

---

**Built with ❤️ using [Actionsflow](https://github.com/actionsflow/actionsflow)**

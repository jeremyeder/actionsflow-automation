# Workflow Templates

Copy-paste templates for common automation tasks.

## Table of Contents

- [API Polling](#api-polling)
- [RSS Feeds](#rss-feeds)
- [Web Scraping](#web-scraping)
- [Scheduled Reports](#scheduled-reports)
- [Monitoring & Alerts](#monitoring--alerts)
- [Data Aggregation](#data-aggregation)

---

## API Polling

### Monitor API Endpoint

```yaml
name: API Monitor
on:
  poll:
    url: https://api.example.com/status
    config:
      every: 15  # Check every 15 minutes

jobs:
  check-status:
    runs-on: ubuntu-latest
    steps:
      - name: Alert if status changed
        run: |
          echo "Status: ${{ on.poll.outputs.status }}"
```

### Cryptocurrency Price Tracker

```yaml
name: Crypto Prices
on:
  script:
    config:
      every: "0 */6 * * *"  # Every 6 hours
    run: |
      const btc = await helpers.axios.get('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const eth = await helpers.axios.get('https://api.coinbase.com/v2/prices/ETH-USD/spot');

      return [{
        btc_price: parseFloat(btc.data.data.amount),
        eth_price: parseFloat(eth.data.data.amount),
        timestamp: new Date().toISOString()
      }];

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send price update
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "💰 Crypto Update",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "BTC: $$${{ on.script.outputs.btc_price }}\nETH: $$${{ on.script.outputs.eth_price }}"
                }
              }]
            }'
```

---

## RSS Feeds

### Hacker News Monitor

```yaml
name: Hacker News Top Posts
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
      every: "0 */3 * * *"  # Every 3 hours

jobs:
  share:
    runs-on: ubuntu-latest
    steps:
      - name: Post to Slack
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "🔥 Trending on HN: <${{ on.rss.outputs.link }}|${{ on.rss.outputs.title }}>"
            }'
```

### Multi-Feed News Aggregator

```yaml
name: News Aggregator
on:
  script:
    config:
      every: "0 8,12,18 * * *"  # 8 AM, noon, 6 PM
    run: |
      const feeds = [
        'https://news.ycombinator.com/rss',
        'https://www.reddit.com/r/technology/.rss',
        'https://techcrunch.com/feed/'
      ];

      let articles = [];
      for (const feedUrl of feeds) {
        const feed = await helpers.rssParser.parseURL(feedUrl);
        articles.push(...feed.items.slice(0, 3));
      }

      return [{ articles: articles, count: articles.length }];

jobs:
  send-digest:
    runs-on: ubuntu-latest
    steps:
      - name: Email news digest
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.EMAIL_SMTP_HOST }}
          server_port: ${{ secrets.EMAIL_SMTP_PORT }}
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "📰 News Digest - ${{ on.script.outputs.count }} articles"
          to: ${{ secrets.EMAIL_TO }}
          from: ${{ secrets.EMAIL_USERNAME }}
          body: "Your personalized news digest is ready!"
```

---

## Web Scraping

### Monitor Website Changes

```yaml
name: Website Change Monitor
on:
  script:
    config:
      every: 60  # Check hourly
    run: |
      const response = await helpers.axios.get('https://example.com');
      const contentHash = require('crypto')
        .createHash('md5')
        .update(response.data)
        .digest('hex');

      const cache = await helpers.cache.get('website-hash');

      if (cache && cache !== contentHash) {
        await helpers.cache.set('website-hash', contentHash);
        return [{ changed: true, hash: contentHash }];
      }

      await helpers.cache.set('website-hash', contentHash);
      return [];

jobs:
  alert:
    runs-on: ubuntu-latest
    if: on.script.outputs.changed == 'true'
    steps:
      - name: Send change alert
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d '{"text": "🔄 Website changed! Hash: ${{ on.script.outputs.hash }}"}'
```

---

## Scheduled Reports

### Daily Summary Email

```yaml
name: Daily Summary
on:
  script:
    config:
      every: "0 17 * * 1-5"  # 5 PM weekdays
      timeZone: "America/New_York"
    run: |
      const today = new Date().toDateString();

      // Gather data from multiple sources
      const weather = await helpers.axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Boston&appid=${process.env.OPENWEATHER_API_KEY}`
      );

      const githubEvents = await helpers.axios.get(
        'https://api.github.com/users/jeremyeder/events/public?per_page=5'
      );

      return [{
        date: today,
        temp: Math.round(weather.data.main.temp - 273.15),
        github_events: githubEvents.data.length
      }];

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Send daily summary
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.EMAIL_SMTP_HOST }}
          server_port: ${{ secrets.EMAIL_SMTP_PORT }}
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "📊 Daily Summary - ${{ on.script.outputs.date }}"
          to: ${{ secrets.EMAIL_TO }}
          from: ${{ secrets.EMAIL_USERNAME }}
          body: |
            Daily Summary for ${{ on.script.outputs.date }}

            Temperature: ${{ on.script.outputs.temp }}°C
            GitHub Events: ${{ on.script.outputs.github_events }}
```

### Weekly Digest (Weekend)

```yaml
name: Weekly Digest
on:
  script:
    config:
      every: "0 10 * * 0"  # Sundays at 10 AM
      timeZone: "America/New_York"
    run: |
      // Compile weekly stats
      return [{
        week: `Week of ${new Date().toLocaleDateString()}`,
        message: "Your weekly summary is ready!"
      }];

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Send weekly email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.EMAIL_SMTP_HOST }}
          server_port: ${{ secrets.EMAIL_SMTP_PORT }}
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "📅 ${{ on.script.outputs.week }} Digest"
          to: ${{ secrets.EMAIL_TO }}
          from: ${{ secrets.EMAIL_USERNAME }}
          body: ${{ on.script.outputs.message }}
```

---

## Monitoring & Alerts

### Server Uptime Monitor

```yaml
name: Uptime Monitor
on:
  script:
    config:
      every: 5  # Every 5 minutes
    run: |
      const sites = [
        'https://example.com',
        'https://api.example.com/health'
      ];

      let downSites = [];

      for (const site of sites) {
        try {
          const response = await helpers.axios.get(site, { timeout: 10000 });
          if (response.status !== 200) {
            downSites.push({ site, status: response.status });
          }
        } catch (error) {
          downSites.push({ site, error: error.message });
        }
      }

      if (downSites.length > 0) {
        return [{ down: true, sites: downSites }];
      }

      return [];

jobs:
  alert:
    runs-on: ubuntu-latest
    if: on.script.outputs.down == 'true'
    steps:
      - name: Send SMS alert
        run: |
          curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${{ secrets.TWILIO_ACCOUNT_SID }}/Messages.json" \
            --data-urlencode "From=${{ secrets.TWILIO_FROM_PHONE }}" \
            --data-urlencode "To=${{ secrets.TWILIO_TO_PHONE }}" \
            --data-urlencode "Body=🚨 Site(s) down! Check monitoring dashboard." \
            -u "${{ secrets.TWILIO_ACCOUNT_SID }}:${{ secrets.TWILIO_AUTH_TOKEN }}"
```

### Disk Space Alert

```yaml
name: Disk Space Monitor
on:
  script:
    config:
      every: "0 */6 * * *"  # Every 6 hours
    run: |
      // This would monitor your server's disk space
      // For demo, simulating 85% usage
      const usage = 85;

      if (usage > 80) {
        return [{ alert: true, usage: usage }];
      }

      return [];

jobs:
  notify:
    runs-on: ubuntu-latest
    if: on.script.outputs.alert == 'true'
    steps:
      - name: Send alert
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "⚠️ Disk Usage: ${{ on.script.outputs.usage }}%"
            }'
```

---

## Data Aggregation

### Social Media Metrics

```yaml
name: Social Media Stats
on:
  script:
    config:
      every: "0 9 * * 1"  # Monday mornings
    run: |
      // Aggregate followers, engagement, etc.
      // This is a template - add your actual API calls

      return [{
        twitter_followers: 1234,
        github_stars: 567,
        reddit_karma: 890
      }];

jobs:
  log:
    runs-on: ubuntu-latest
    steps:
      - name: Save to file
        run: |
          mkdir -p metrics
          cat << EOF > metrics/$(date +%Y-%m-%d).json
          {
            "date": "$(date -I)",
            "twitter": ${{ on.script.outputs.twitter_followers }},
            "github": ${{ on.script.outputs.github_stars }},
            "reddit": ${{ on.script.outputs.reddit_karma }}
          }
          EOF

      - name: Commit metrics
        run: |
          git config user.name "Metrics Bot"
          git config user.email "bot@example.com"
          git add metrics/
          git commit -m "Update metrics: $(date -I)"
          git push
```

---

## Tips for Creating Workflows

1. **Start simple** - Test with a basic trigger first
2. **Use caching** - Prevent duplicate processing with `helpers.cache`
3. **Handle errors** - Wrap API calls in try/catch
4. **Test locally** - Use `.env` file for local development
5. **Add timeouts** - Prevent workflows from hanging
6. **Log output** - Use `console.log()` for debugging

See [Actionsflow Triggers](https://actionsflow.github.io/docs/triggers/) for more built-in triggers!

# Troubleshooting Guide

Common issues and solutions.

## Workflows Not Running

### Issue: Workflows never execute

**Symptoms:**
- No workflow runs in Actions tab
- Schedule seems to be ignored

**Solutions:**

1. **Check schedule is enabled:**
   - Open `.github/workflows/actionsflow.yml`
   - Ensure schedule block is not commented out:
     ```yaml
     schedule:
       - cron: "*/15 * * * *"  # Should not have # at start
     ```

2. **Verify repository is active:**
   - GitHub disables schedules on inactive repos (60 days)
   - Make any commit to re-enable

3. **Check workflow syntax:**
   - Go to Actions tab
   - Look for workflow file errors
   - Fix any YAML syntax issues

### Issue: Specific workflow doesn't trigger

**Solutions:**

1. **Check workflow file location:**
   - Must be in `workflows/` directory
   - File must end in `.yml` or `.yaml`

2. **Verify trigger configuration:**
   ```yaml
   on:
     script:
       config:
         every: 60  # Correct format
   ```

3. **Check if skipSchedule is set:**
   ```yaml
   skipSchedule: true  # This prevents automatic runs
   ```

---

## Notifications Not Sending

### Email not working

**Symptoms:**
- Workflow runs successfully
- No email received

**Solutions:**

1. **Verify secrets are set:**
   ```
   EMAIL_SMTP_HOST
   EMAIL_SMTP_PORT
   EMAIL_USERNAME
   EMAIL_PASSWORD
   EMAIL_TO
   ```

2. **Check spam folder**

3. **Test Gmail app password:**
   ```bash
   # Try manual test with curl
   curl --url 'smtps://smtp.gmail.com:465' \
     --ssl-reqd \
     --mail-from 'your@gmail.com' \
     --mail-rcpt 'recipient@email.com' \
     --user 'your@gmail.com:your_app_password'
   ```

4. **Try alternative port:**
   - Change `EMAIL_SMTP_PORT` to `465`
   - Or try `587`

5. **Verify Gmail settings:**
   - 2FA must be enabled
   - App password must be generated
   - Less secure apps NOT needed (app passwords bypass this)

### Slack not working

**Symptoms:**
- No messages in Slack
- Workflow succeeds

**Solutions:**

1. **Test webhook manually:**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test message"}'
   ```

2. **Check webhook URL:**
   - Should start with `https://hooks.slack.com/services/`
   - No extra spaces or quotes
   - Webhook channel still exists

3. **Verify secret:**
   - Go to Settings → Secrets
   - Secret name is exact: `SLACK_WEBHOOK_URL`
   - Re-add if unsure

4. **Check Slack app:**
   - App not deleted
   - Still has permissions
   - Channel still accessible

### SMS not working

**Symptoms:**
- No text messages received
- Twilio errors in logs

**Solutions:**

1. **Verify phone numbers:**
   ```
   TWILIO_FROM_PHONE = +15551234567  # Include country code
   TWILIO_TO_PHONE = +15559876543    # Include country code
   ```

2. **Check Twilio trial restrictions:**
   - Trial accounts only send to verified numbers
   - Verify recipient number in Twilio console

3. **Check Twilio balance:**
   - Ensure account has credits
   - Trial gives $15 free credit

4. **Review Twilio logs:**
   - Go to Twilio console
   - Check error messages
   - Common: unverified number, insufficient balance

---

## API Issues

### Rate limiting

**Symptoms:**
- HTTP 429 errors
- "Rate limit exceeded" messages

**Solutions:**

1. **Add delays between requests:**
   ```yaml
   - name: Wait
     run: sleep 5
   ```

2. **Use caching to reduce requests:**
   ```javascript
   const cached = await helpers.cache.get('data');
   if (cached) return cached;
   ```

3. **Authenticate API calls:**
   - Many APIs have higher limits for authenticated requests
   - Add API keys to secrets

### Invalid API keys

**Symptoms:**
- 401 Unauthorized errors
- "Invalid API key" messages

**Solutions:**

1. **Regenerate API key:**
   - Delete old key from provider
   - Generate new key
   - Update secret in GitHub

2. **Check secret name:**
   - Exact match required (case-sensitive)
   - `OPENWEATHER_API_KEY` not `openweather_api_key`

3. **Verify key format:**
   - No extra spaces
   - Complete key copied

---

## GitHub Actions Issues

### Workflow timeout

**Symptoms:**
- Workflow cancelled after 6 hours
- "Job exceeded timeout" error

**Solutions:**

1. **Add timeout to long-running jobs:**
   ```yaml
   jobs:
     my-job:
       runs-on: ubuntu-latest
       timeout-minutes: 30  # Max 360 (6 hours)
   ```

2. **Optimize workflow:**
   - Cache dependencies
   - Reduce API calls
   - Use parallel jobs

### Out of disk space

**Symptoms:**
- "No space left on device"
- Build failures

**Solutions:**

1. **Clean up in workflow:**
   ```yaml
   - name: Free disk space
     run: |
       sudo rm -rf /usr/share/dotnet
       sudo rm -rf /opt/ghc
       df -h
   ```

2. **Use smaller runners:**
   - Standard runners have ~14GB free
   - Clean unnecessary files

### Permission denied errors

**Symptoms:**
- Can't push commits
- Can't create issues

**Solutions:**

1. **Check workflow permissions:**
   ```yaml
   permissions:
     contents: write  # For pushing commits
     issues: write    # For creating issues
   ```

2. **Verify GITHUB_TOKEN:**
   - Auto-provided, no setup needed
   - Has default permissions for repo

---

## Debugging Workflows

### Enable debug logging

1. Go to Settings → Secrets
2. Add secrets:
   ```
   ACTIONS_STEP_DEBUG = true
   ACTIONS_RUNNER_DEBUG = true
   ```

3. Re-run workflow
4. Check logs for detailed output

### Test locally

1. Install `act`:
   ```bash
   # macOS
   brew install act

   # Linux
   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
   ```

2. Run workflow locally:
   ```bash
   act -W .github/workflows/actionsflow.yml
   ```

### Check workflow syntax

Use GitHub's workflow validator:
```bash
# Install actionlint
brew install actionlint

# Check workflow file
actionlint .github/workflows/actionsflow.yml
```

---

## Common Errors

### "Error: No workflow file"

**Cause:** Workflow file not in correct location

**Fix:** Move to `.github/workflows/` directory

### "Invalid YAML"

**Cause:** Syntax error in workflow file

**Fix:**
- Check indentation (use spaces, not tabs)
- Validate at [yamllint.com](http://www.yamllint.com/)
- Look for missing colons or quotes

### "Secret not found"

**Cause:** Secret name mismatch

**Fix:**
- Check exact spelling (case-sensitive)
- Verify secret exists in Settings → Secrets
- No extra quotes around name in workflow

### "Resource not accessible"

**Cause:** GitHub token lacks permissions

**Fix:** Add permissions to workflow:
```yaml
permissions:
  contents: read
  issues: write
```

---

## Getting Help

1. **Check workflow logs:**
   - Actions tab → Select run → View details

2. **Review Actionsflow docs:**
   - [actionsflow.github.io](https://actionsflow.github.io/docs/)

3. **Test components individually:**
   - Use manual trigger to test
   - Add debug output: `run: echo "Test value: $VALUE"`

4. **Check GitHub Status:**
   - [githubstatus.com](https://www.githubstatus.com/)

5. **File an issue:**
   - Include workflow file
   - Share error logs
   - Describe expected vs actual behavior

---

## Quick Fixes Checklist

When workflow fails, try these:

- [ ] Check Actions tab for error message
- [ ] Verify all required secrets are set
- [ ] Test API keys independently
- [ ] Check workflow file syntax
- [ ] Review recent commits for changes
- [ ] Enable debug logging
- [ ] Try manual workflow trigger
- [ ] Check API rate limits
- [ ] Verify network/service status
- [ ] Review permissions

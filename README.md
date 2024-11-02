# Email Automation System

A comprehensive automation system that handles both email collection and outreach campaigns. The system first scrapes emails from business websites, then manages the complete email campaign lifecycle from initial contact to follow-up sequences.

## Key Features

### 1. Automated Email Collection
- Scrapes emails from business websites automatically
- Supports bulk website processing
- Intelligent email extraction from various website structures
- Saves enriched business data with collected emails

### 2. Smart Email Validation
- Validates extracted and existing emails
- Filters out:
  - System-generated emails (e.g., @sentry.io)
  - Numeric-prefix emails (e.g., 123@domain.com)
  - Invalid format emails
  - Generic/placeholder emails
- Ensures high-quality business contacts

### 3. Campaign Management
- Manages multiple campaigns simultaneously
- Tracks campaign progress and statistics
- Maintains campaign history and state
- Supports city-specific customization

### 4. Follow-up System
- Automated follow-up sequences
  - First follow-up: 2 days after initial
  - Second follow-up: 4 days after initial
  - Final follow-up: 7 days after initial
- Different templates for each stage
- Prevents duplicate emails

## Prerequisites

- Node.js installed
- Python installed (for email extraction)
- SMTP server access for sending emails

## Setup

1. Clone the repository:
```bash
git clone https://github.com/mainul-islam-faruqi/email-collector-automation-system.git
cd email-collector-automation-system
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
DAILY_EMAIL_LIMIT=100
DELAY_BETWEEN_EMAILS=5000
```

## Usage Guide

### 1. Prepare Your CSV File
Create a CSV file with these columns (use semicolon as separator):
```csv
Business Name;Phone;Reviews Count;Website
ABC Cleaning;123-456-7890;25;http://abccleaning.com
XYZ Services;098-765-4321;10;http://xyzservices.com
```

Save this file in the `data` folder.

### 2. Start New Campaign (With Email Collection)
```bash
# Format:
node src/index.js path/to/csv city-name

# Example:
node src/index.js data/new-businesses.csv los-angeles
```

This will:
- Read your CSV file
- Visit each website to collect emails
- Filter out invalid emails
- Save enriched data
- Send initial emails
- Show you the campaign ID for follow-ups

### 3. Send Follow-up Emails
```bash
# Format:
node src/index.js campaign-id city-name --follow-up TYPE

# Examples:
# First follow-up (2 days after initial)
node src/index.js los-angeles-1234567890 los-angeles --follow-up FIRST

# Second follow-up (4 days after initial)
node src/index.js los-angeles-1234567890 los-angeles --follow-up SECOND

# Final follow-up (7 days after initial)
node src/index.js los-angeles-1234567890 los-angeles --follow-up FINAL
```

### 4. Monitor Your Campaigns
The system automatically shows:
```
=== Campaign Status ===
Campaign: los-angeles
ID: los-angeles-1234567890
Status: active
Emails Sent: 50
Current Sequence: 2 of 4
Last Run: 2024-01-01T12:00:00Z
```

### 5. File Locations
- CSV files: `data/`
- Enriched data: `data/enriched-lists/{campaign-id}-enriched.json`
- Campaign configs: `data/campaigns/{campaign-id}/campaign-config.json`
- Email history: `data/email-history.json`

### 6. Customize Email Templates
Edit templates in:
- Initial offer: `src/templates/initial/review-offer.js`
- Follow-ups: `src/templates/follow-up/first-follow-up.js`

## Safety Features & Limits

1. **Email Collection**
- Respects website robots.txt
- Implements delays between requests
- Handles various website structures

2. **Email Validation**
- Removes system-generated emails
- Filters out invalid formats
- Prevents duplicate sends

3. **Rate Limiting**
- Configurable daily email limit
- Adjustable delay between emails
- Campaign state saving

## Troubleshooting

### Common Issues

1. **Email Collection Fails**
- Check website accessibility
- Verify website format
- Ensure proper internet connection

2. **Email Sending Fails**
- Verify SMTP settings in .env
- Check daily limits
- Confirm email format

3. **Campaign Interruption**
- System auto-saves state
- Will resume from last position
- Check last-run-state.json

### Error Messages

1. "Daily email limit reached"
- Wait until next day
- Adjust DAILY_EMAIL_LIMIT in .env

2. "SMTP connection failed"
- Check EMAIL_HOST and credentials
- Verify network connection

3. "No emails found"
- Verify website URLs in CSV
- Check website accessibility

## Best Practices

1. **Starting Out**
- Begin with small test campaigns (5-10 businesses)
- Verify email collection quality
- Monitor delivery rates

2. **Campaign Management**
- Run follow-ups at appropriate intervals
- Keep email history clean
- Back up campaign data regularly

3. **Email Templates**
- Customize for your use case
- Test before bulk sending
- Keep content professional

## Maintenance

1. **Regular Tasks**
- Clean email history
- Update email templates
- Back up campaign data

2. **System Updates**
- Check for dependencies updates
- Test after any changes
- Keep Python modules updated

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs
3. Open an issue on GitHub

## Security Notes

1. Protect your .env file
2. Regular security updates
3. Monitor email sending patterns
4. Respect website robots.txt

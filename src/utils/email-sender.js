import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email-config.js';
import { getEmailTemplate } from '../templates/index.js';
import fs from 'fs/promises';
import path from 'path';

export class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
    this.emailsSentToday = 0;
    this.campaignHistory = new Map();
    this.historyFile = path.join(process.cwd(), 'data', 'email-history.json');
    this.lastRunFile = path.join(process.cwd(), 'data', 'last-run-state.json');
  }

  async loadHistory() {
    try {
      const historyExists = await fs.access(this.historyFile).then(() => true).catch(() => false);
      if (historyExists) {
        const data = await fs.readFile(this.historyFile, 'utf8');
        const history = JSON.parse(data);
        this.campaignHistory = new Map(Object.entries(history));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  async saveHistory() {
    try {
      const history = Object.fromEntries(this.campaignHistory);
      await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async loadLastRunState() {
    try {
      const stateExists = await fs.access(this.lastRunFile).then(() => true).catch(() => false);
      if (stateExists) {
        const data = await fs.readFile(this.lastRunFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading last run state:', error);
    }
    return null;
  }

  async saveLastRunState(businesses, currentIndex, templateType) {
    try {
      const state = {
        lastProcessedIndex: currentIndex,
        templateType,
        timestamp: new Date().toISOString(),
        remainingBusinesses: businesses.slice(currentIndex + 1)
      };
      await fs.writeFile(this.lastRunFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Error saving last run state:', error);
    }
  }

  async sendEmail(business, templateType, specificEmail, cityName) {
    if (this.emailsSentToday >= emailConfig.dailyEmailLimit) {
      throw new Error('Daily email limit reached');
    }

    // Check if this email has already received this template type
    const emailHistory = this.campaignHistory.get(specificEmail) || [];
    if (emailHistory.some(h => h.templateType === templateType)) {
      console.log(`Skipping ${specificEmail} - already received template: ${templateType}`);
      return;
    }

    const emailContent = getEmailTemplate(templateType, business, cityName);
    const mailOptions = {
      from: emailConfig.auth.user,
      to: specificEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.emailsSentToday++;
      this.updateCampaignHistory(specificEmail, templateType);
      await this.saveHistory();
      console.log(`Email sent successfully to ${business.businessName} (${specificEmail}) using template: ${templateType}`);
    } catch (error) {
      console.error(`Failed to send email to ${business.businessName} (${specificEmail}):`, error);
      throw error;
    }
  }

  updateCampaignHistory(email, templateType) {
    const history = this.campaignHistory.get(email) || [];
    history.push({
      templateType,
      sentAt: new Date().toISOString()
    });
    this.campaignHistory.set(email, history);
  }

  async sendBulkEmails(businesses, templateType, cityName) {
    await this.loadHistory();
    
    console.log(`Starting email campaign for ${cityName}`);
    console.log(`Total businesses to process: ${businesses.length}`);

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      try {
        const emails = business.email.split(',').map(email => email.trim());
        console.log(`Processing ${emails.length} emails for ${business.businessName}:`, emails);

        for (const email of emails) {
          if (email) {
            try {
              await this.sendEmail(business, templateType, email, cityName);
              await new Promise(resolve => setTimeout(resolve, emailConfig.delayBetweenEmails / 2));
            } catch (error) {
              if (error.message === 'Daily email limit reached') {
                // Save state before stopping
                await this.saveLastRunState(businesses, i, templateType);
                console.log(`Daily limit reached. Saved state at index ${i}`);
                return;
              }
              console.error(`Error sending to ${email} for ${business.businessName}:`, error);
              continue;
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, emailConfig.delayBetweenEmails));
        await this.saveLastRunState(businesses, i, templateType);

      } catch (error) {
        console.error(`Error processing business ${business.businessName}:`, error);
        await this.saveLastRunState(businesses, i, templateType);
      }
    }

    // Campaign completed
    await fs.unlink(this.lastRunFile).catch(() => {});
    console.log('Email campaign completed successfully');
  }

  async resumeCampaign() {
    const lastState = await this.loadLastRunState();
    if (lastState) {
      console.log('Resuming previous campaign...');
      console.log(`Starting from index: ${lastState.lastProcessedIndex + 1}`);
      console.log(`Template type: ${lastState.templateType}`);
      console.log(`Remaining businesses: ${lastState.remainingBusinesses.length}`);
      
      await this.sendBulkEmails(
        lastState.remainingBusinesses,
        lastState.templateType,
        'your city'
      );
    } else {
      console.log('No previous campaign to resume');
    }
  }

  getCampaignHistory() {
    return Object.fromEntries(this.campaignHistory);
  }
} 
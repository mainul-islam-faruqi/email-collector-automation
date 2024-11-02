import { parseCSV } from './utils/csv-parser.js';
import { EmailSender } from './utils/email-sender.js';
import { CampaignManager } from './utils/campaign-manager.js';
import { EmailTemplates } from './templates/index.js';
import path from 'path';
import fs from 'fs/promises';

async function monitorCampaigns() {
  const campaignManager = new CampaignManager();
  const activeCampaigns = await campaignManager.listActiveCampaigns();
  
  console.log('\n=== Campaign Status ===');
  for (const campaign of activeCampaigns) {
    console.log(`
Campaign: ${campaign.name}
ID: ${campaign.id}
Status: ${campaign.status}
Emails Sent: ${campaign.stats.emailsSent}
Current Sequence: ${campaign.currentSequenceIndex + 1} of ${campaign.emailSequence.length}
Last Run: ${campaign.lastRunDate || 'Never'}
    `);
  }
}

async function main() {
  try {
    // Add monitoring at start
    await monitorCampaigns();

    const campaignManager = new CampaignManager();
    const emailSender = new EmailSender();

    // List all active campaigns
    const activeCampaigns = await campaignManager.listActiveCampaigns();
    console.log('Active campaigns:', activeCampaigns);

    // Check for new CSV to process
    if (process.argv[2]) {
      if (process.argv[4] === '--follow-up') {
        const campaignId = process.argv[2];
        const cityName = process.argv[3] || 'unknown-city';
        const followUpType = process.argv[5] || 'FIRST';
        
        const enrichedListPath = path.join(
          campaignManager.enrichedListsDir,
          `${campaignId}-enriched.json`
        );
        
        const businesses = JSON.parse(await fs.readFile(enrichedListPath, 'utf8'));
        const campaign = await campaignManager.initializeCampaign(`${cityName}-followup`, enrichedListPath);
        console.log(`Initialized follow-up campaign: ${campaign.id}`);
        
        switch(followUpType.toUpperCase()) {
          case 'FIRST':
            await emailSender.sendBulkEmails(businesses, EmailTemplates.followUp.FIRST, cityName);
            break;
          case 'SECOND':
            await emailSender.sendBulkEmails(businesses, EmailTemplates.followUp.SECOND, cityName);
            break;
          case 'FINAL':
            await emailSender.sendBulkEmails(businesses, EmailTemplates.followUp.FINAL, cityName);
            break;
          default:
            console.log('Invalid follow-up type. Using first follow-up.');
            await emailSender.sendBulkEmails(businesses, EmailTemplates.followUp.FIRST, cityName);
        }
      } else {
        // For new campaigns, do full email extraction
        const csvPath = process.argv[2];
        const cityName = process.argv[3] || 'unknown-city';
        
        const campaign = await campaignManager.initializeCampaign(cityName, csvPath);
        const businesses = await parseCSV(csvPath, false); // Do email extraction
        await campaignManager.enrichAndSaveBusinessList(campaign.id, businesses);
        console.log(`Initialized new campaign: ${campaign.id}`);
        
        // Send initial emails
        await emailSender.sendBulkEmails(businesses, EmailTemplates.initial.REVIEW_OFFER, cityName);
      }
    }

    // Process each active campaign
    for (const campaign of activeCampaigns) {
      if (await campaignManager.shouldRunSequence(campaign.id)) {
        const nextStep = await campaignManager.getNextSequenceStep(campaign.id);
        const enrichedListPath = path.join(
          campaignManager.enrichedListsDir,
          `${campaign.id}-enriched.json`
        );
        
        const businesses = JSON.parse(await fs.readFile(enrichedListPath, 'utf8'));
        
        console.log(`Running ${nextStep.type} for campaign ${campaign.id}`);
        await emailSender.sendBulkEmails(
          businesses, 
          EmailTemplates[nextStep.type][nextStep.template],
          campaign.name.split('-')[0] // Extract city name from campaign name
        );
        
        await campaignManager.updateCampaignStatus(campaign.id, {
          currentSequenceIndex: campaign.currentSequenceIndex + 1,
          lastRunDate: new Date().toISOString(),
          'stats.emailsSent': campaign.stats.emailsSent + businesses.length
        });
      }
    }

    // Add monitoring at end
    await monitorCampaigns();
    
  } catch (error) {
    console.error('Error running campaigns:', error);
    process.exit(1);
  }
}

main(); 
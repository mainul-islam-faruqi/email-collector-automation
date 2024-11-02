import fs from 'fs/promises';
import path from 'path';
import { parseCSV } from './csv-parser.js';

export class CampaignManager {
  constructor() {
    this.campaignsDir = path.join(process.cwd(), 'data', 'campaigns');
    this.enrichedListsDir = path.join(process.cwd(), 'data', 'enriched-lists');
    this.initializeDirs();
  }

  async initializeDirs() {
    try {
      await fs.mkdir(this.campaignsDir, { recursive: true });
      await fs.mkdir(this.enrichedListsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async initializeCampaign(campaignName, csvPath) {
    const campaignData = {
      id: `${campaignName}-${Date.now()}`,
      name: campaignName,
      status: 'initialized',
      createdAt: new Date().toISOString(),
      originalCsvPath: csvPath,
      emailSequence: [
        { type: 'initial', template: 'REVIEW_OFFER', delay: 0 },
        { type: 'followup1', template: 'FIRST_FOLLOWUP', delay: 2 }, // 2 days after initial
        { type: 'followup2', template: 'SECOND_FOLLOWUP', delay: 4 }, // 4 days after initial
        { type: 'followup3', template: 'FINAL_FOLLOWUP', delay: 7 }  // 7 days after initial
      ],
      currentSequenceIndex: 0,
      lastRunDate: null,
      stats: {
        totalBusinesses: 0,
        emailsSent: 0,
        completedSequences: 0
      }
    };

    // Create campaign directory
    const campaignDir = path.join(this.campaignsDir, campaignData.id);
    await fs.mkdir(campaignDir, { recursive: true });

    // Save campaign config
    await fs.writeFile(
      path.join(campaignDir, 'campaign-config.json'),
      JSON.stringify(campaignData, null, 2)
    );

    return campaignData;
  }

  async enrichAndSaveBusinessList(campaignId, businesses) {
    const enrichedListPath = path.join(this.enrichedListsDir, `${campaignId}-enriched.json`);
    await fs.writeFile(enrichedListPath, JSON.stringify(businesses, null, 2));
    return enrichedListPath;
  }

  async getCampaignStatus(campaignId) {
    const configPath = path.join(this.campaignsDir, campaignId, 'campaign-config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    return config;
  }

  async updateCampaignStatus(campaignId, updates) {
    const configPath = path.join(this.campaignsDir, campaignId, 'campaign-config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const updatedConfig = { ...config, ...updates };
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
    return updatedConfig;
  }

  async listActiveCampaigns() {
    const campaigns = [];
    const campaignDirs = await fs.readdir(this.campaignsDir);
    
    for (const dir of campaignDirs) {
      const configPath = path.join(this.campaignsDir, dir, 'campaign-config.json');
      const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
      campaigns.push(config);
    }
    
    return campaigns;
  }

  async getNextSequenceStep(campaignId) {
    const config = await this.getCampaignStatus(campaignId);
    return config.emailSequence[config.currentSequenceIndex];
  }

  async shouldRunSequence(campaignId) {
    const config = await this.getCampaignStatus(campaignId);
    if (!config.lastRunDate) return true;

    const lastRun = new Date(config.lastRunDate);
    const currentStep = config.emailSequence[config.currentSequenceIndex];
    const nextRunDate = new Date(lastRun.getTime() + currentStep.delay * 24 * 60 * 60 * 1000);

    return new Date() >= nextRunDate;
  }
} 
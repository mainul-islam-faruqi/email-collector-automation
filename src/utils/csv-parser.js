import { parse } from 'csv-parse';
import fs from 'fs/promises';
import { extractEmailsFromWebsites } from '../python/emailExtractor.js';

function isValidBusinessEmail(email) {
  // List of domains to exclude
  const excludedDomains = [
    'sentry.wixpress.com',
    'sentry.io',
    'sentry-next.wixpress.com',
    'mysite.com',
    'mystore.com',
    'mailservice.com',
    'example.com'
  ];

  // Check for auto-generated/system email patterns
  const invalidPatterns = [
    /^[a-f0-9]{32}@/,  // 32 char hex string
    /^[a-f0-9]{24}@/,  // 24 char hex string
    /^[a-f0-9]{16}@/,  // 16 char hex string
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@/,  // UUID format
    /^\d+@/,  // Starts with numbers (simplified version)
    /^[a-f0-9]{8,}@/  // Any long hex string
  ];

  // Check domain exclusions
  if (excludedDomains.some(domain => email.toLowerCase().includes(domain))) {
    return false;
  }

  // Check invalid patterns
  if (invalidPatterns.some(pattern => pattern.test(email.toLowerCase()))) {
    return false;
  }

  // Basic email format validation
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailPattern.test(email)) {
    return false;
  }

  return true;
}

export async function parseCSV(filePath, skipEmailExtraction = false) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: header => {
        return header.map(column => {
          const cleanColumn = column.replace(/["\n\r]/g, '').trim();
          console.log('Column:', cleanColumn);
          switch(cleanColumn) {
            case 'Business Name':
              return 'businessName';
            case 'Phone':
              return 'phone';
            case 'Reviews Count':
              return 'reviewCount';
            case 'Website':
              return 'websiteLink';
            default:
              return cleanColumn;
          }
        });
      },
      delimiter: ';',
      skip_empty_lines: true,
      trim: true,
      from_line: 1
    }, async (err, records) => {
      if (err) reject(err);
      
      console.log('Raw records:', records[0]);
      
      // Clean up the data
      const cleanedRecords = records.map(record => {
        console.log('Processing record:', record);
        const businessName = record.businessName || '';
        const phone = record.phone || '';
        const reviewCount = record.reviewCount ? 
          Math.abs(parseInt(record.reviewCount.replace(/[^0-9-]/g, '')) || 0) : 0;
        const websiteLink = record.websiteLink || '';

        return {
          businessName: businessName.trim(),
          phone: phone.trim(),
          reviewCount,
          websiteLink: websiteLink.trim().toLowerCase(),
          email: record.email || ''
        };
      });

      console.log('First cleaned record:', cleanedRecords[0]);

      // Skip email extraction if requested (for follow-ups)
      if (skipEmailExtraction) {
        return resolve(cleanedRecords);
      }

      // Only do email extraction for records without emails
      const recordsNeedingEmails = cleanedRecords.filter(record => {
        return !record.email && record.websiteLink;
      });
      
      if (recordsNeedingEmails.length > 0) {
        try {
          const enrichedRecords = await extractEmailsFromWebsites(recordsNeedingEmails);
          
          // Merge enriched records with original records that had emails
          const finalRecords = cleanedRecords.map(record => {
            if (record.email) {
              // For existing emails, validate them
              return {
                ...record,
                email: record.email.split(',')
                  .map(e => e.trim())
                  .filter(isValidBusinessEmail)
                  .join(',')
              };
            }
            const enriched = enrichedRecords.find(r => r.websiteLink === record.websiteLink);
            if (enriched) {
              // For newly extracted emails, validate them
              return {
                ...enriched,
                email: enriched.email.split(',')
                  .map(e => e.trim())
                  .filter(isValidBusinessEmail)
                  .join(',')
              };
            }
            return record;
          }).filter(record => record.email); // Only keep records with valid emails
          
          resolve(finalRecords);
        } catch (error) {
          console.error('Error extracting emails:', error);
          resolve([]);
        }
      } else {
        resolve(cleanedRecords.filter(record => record.email));
      }
    });
  });
} 
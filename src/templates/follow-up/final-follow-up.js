export function finalFollowUpTemplate(business) {
  return {
    subject: `Final notice - Free review offer for ${business.businessName}`,
    html: `
      <p>Hey ${business.businessName},</p>
      
      <p>I'm reaching out one last time about our <b>7 free Google reviews in 7 days</b> program. 
      We're closing this free trial offer this week, and I wanted to make sure you didn't miss out.</p>
      
      <p>With your current ${business.reviewCount} reviews, adding 7 more verified reviews would significantly 
      boost your online presence and help you stand out from competitors.</p>
      
      <p><b>Last chance to claim your spot:</b></p>
      
      <p>→ <b>Ready to start now?</b> Book your 25-minute launch call:<br>
      <a href="https://link.goleadsolution.com/widget/booking/GTD1CQgned0Vsu1KQ4xr">Schedule Launch Call</a></p>
      
      <p>→ <b>Still have questions?</b> Book a quick 5-minute chat:<br>
      <a href="https://link.goleadsolution.com/widget/booking/jlXvDho8caV2hGeQqYSN">Schedule Quick Chat</a></p>
      
      <p>After this week, the free trial offer will end, and we'll be moving forward with the businesses 
      who have already joined.</p>
      
     <p>Best regards,<br>
      Go Lead Solution<br>
      <a href="https://goleadsolution.com" style="color: #0066cc; text-decoration: none;">goleadsolution.com</a></p>
      
      <p style="font-size: 12px; color: #666;">
      P.S. This is my final email about this opportunity. If you're interested, please book a call today 
      before the free trial spots are gone.
      </p>
    `
  };
} 
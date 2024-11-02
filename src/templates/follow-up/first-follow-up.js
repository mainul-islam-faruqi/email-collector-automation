export function firstFollowUpTemplate(business) {
  return {
    subject: `Re: ${business.businessName} - Following up`,
    html: `
      <p>Hey ${business.businessName},</p>
      
      <p>I wanted to follow up on my previous email about helping you get more Google reviews. 
      The offer for <b>7 free reviews in 7 days</b> is still available!</p>
      
      <p>If you're ready to grab the free trial, you can <b>book a 25-minute launch call</b> here:<br>
      <a href="https://link.goleadsolution.com/widget/booking/GTD1CQgned0Vsu1KQ4xr">Schedule a Launch Call</a></p>
      
      <p>Or if you'd like to learn more about this free offer first, let's have a quick <b>5-minute intro call</b>:<br>
      <a href="https://link.goleadsolution.com/widget/booking/jlXvDho8caV2hGeQqYSN">Schedule aQuick Intro Call</a></p>
      
      <p>Looking forward to helping ${business.businessName} grow!</p>
      
      <p>Best regards,<br>
      Go Lead Solution<br>
      <a href="https://goleadsolution.com" style="color: #0066cc; text-decoration: none;">goleadsolution.com</a></p>
      
      <p style="font-size: 12px; color: #666;">
      P.S. Both calls are completely free, no obligation - just pick the option that works best for you!
      </p>
    `
  };
} 
export function secondFollowUpTemplate(business) {
  return {
    subject: `Quick update for ${business.businessName}`,
    html: `
      <p>Hey ${business.businessName},</p>
      
      <p>I wanted to send you a quick update - we still have a few spots left for our 
      <b>7 free Google reviews in 7 days</b> program, but they're filling up fast.</p>
      
      <p>Since you have ${business.reviewCount} reviews right now, this could be a great opportunity 
      to boost your online reputation and attract more customers.</p>
      
      <p>To make it easier, I've set up two quick booking options:</p>
      
      <p>1. <b>Ready to start?</b> Book your 25-minute launch call:<br>
      <a href="https://link.goleadsolution.com/widget/booking/GTD1CQgned0Vsu1KQ4xr">→ Schedule Launch Call</a></p>
      
      <p>2. <b>Have questions?</b> Book a quick 5-minute chat:<br>
      <a href="https://link.goleadsolution.com/widget/booking/jlXvDho8caV2hGeQqYSN">→ Schedule Quick Chat</a></p>
      
      <p>Looking forward to helping you get more reviews and grow your business!</p>
      
      <p>Best regards,<br>
      Go Lead Solution<br>
      <a href="https://goleadsolution.com" style="color: #0066cc; text-decoration: none;">goleadsolution.com</a></p>
      
      <p style="font-size: 12px; color: #666;">
      P.S. This is a limited-time offer, and we can only take on a few more businesses for the free trial.
      </p>
    `
  };
} 
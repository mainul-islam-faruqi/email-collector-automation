export function reviewOfferTemplate(business, cityName = 'your city') {
  return {
    subject: `Is this ${business.businessName}?`,
    html: `
      <p>Hey ${business.businessName},</p>
      
      <p>I'm contacting you because I'm looking to partner with a Cleaning Service in ${cityName} for a brand new program 
      we're launching offering <b>7 new Google reviews in 7 days absolutely for free</b>.</p>
      
      <p>I noticed you currently have ${business.reviewCount} reviews, and we'd love to help increase that number.</p>
      
      <p><b>Willing to do a free trial in exchange for a case study testimonial</b> :)</p>
      
      <p>Reply with a quick "<b>YES</b>" and your best number if you want more info on how it works!</p>
      
      <p>Best regards,<br>
      Go Lead Solution<br>
      <a href="https://goleadsolution.com" style="color: #0066cc; text-decoration: none;">goleadsolution.com</a></p>
    `
  };
} 
export function seoOfferTemplate(business) {
  return {
    subject: `${business.businessName} - Quick SEO Question`,
    html: `
      <p>Hey ${business.businessName},</p>
      
      <p>I was searching for cleaning services in Denver and noticed your website could rank higher 
      in Google searches. We're offering a <b>free SEO audit and competitive analysis</b> to select cleaning businesses.</p>
      
      <p>Would you be interested in seeing how you compare to your top competitors and what quick wins 
      you could implement to improve your rankings?</p>
      
      <p><b>Reply YES if you'd like to see your free audit report!</b></p>
      
      <p>Best regards,<br>
      Go Lead Solution</p>
    `
  };
} 
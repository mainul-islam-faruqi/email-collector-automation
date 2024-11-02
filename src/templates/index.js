import { reviewOfferTemplate } from './initial/review-offer.js';
import { seoOfferTemplate } from './initial/seo-offer.js';
// import { webDesignOfferTemplate } from './initial/web-design-offer.js';
import { firstFollowUpTemplate } from './follow-up/first-follow-up.js';
import { secondFollowUpTemplate } from './follow-up/second-follow-up.js';
import { finalFollowUpTemplate } from './follow-up/final-follow-up.js';

export const EmailTemplates = {
  initial: {
    REVIEW_OFFER: 'review_offer',
    SEO_OFFER: 'seo_offer',
    WEB_DESIGN_OFFER: 'web_design_offer'
  },
  followUp: {
    FIRST: 'first_follow_up',
    SECOND: 'second_follow_up',
    FINAL: 'final_follow_up'
  }
};

export function getEmailTemplate(templateType, business, cityName = 'your city') {
  switch(templateType) {
    case EmailTemplates.initial.REVIEW_OFFER:
      return reviewOfferTemplate(business, cityName);
    case EmailTemplates.initial.SEO_OFFER:
      return seoOfferTemplate(business, cityName);
    case EmailTemplates.initial.WEB_DESIGN_OFFER:
      return webDesignOfferTemplate(business, cityName);
    case EmailTemplates.followUp.FIRST:
      return firstFollowUpTemplate(business, cityName);
    case EmailTemplates.followUp.SECOND:
      return secondFollowUpTemplate(business, cityName);
    case EmailTemplates.followUp.FINAL:
      return finalFollowUpTemplate(business, cityName);
    default:
      return reviewOfferTemplate(business, cityName);
  }
} 
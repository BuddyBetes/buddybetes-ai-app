import { emailStyles } from './styles.ts';
import { createBaseTemplate } from './base-template.ts';

interface BuddyBetesPromoEmailProps {
  firstName?: string;
  appUrl: string;
  unsubscribeUrl: string;
}

export const createBuddyBetesPromoEmail = (props: BuddyBetesPromoEmailProps): string => {
  const { firstName, appUrl, unsubscribeUrl } = props;
  
  const greeting = firstName 
    ? `Hi ${firstName}!` 
    : 'Hello there!';
  
  const bodyContent = `
    <div style="margin: 30px 0;">
      <h2 style="color: #208687; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
        Take Control of Your Diabetes Journey 💙
      </h2>
      
      <p style="${emailStyles.text}">
        Managing diabetes just got easier with BuddyBetes – your intelligent companion for glucose tracking, 
        insights, and personalized care.
      </p>
      
      <!-- Hero CTA -->
      <div style="${emailStyles.buttonContainer}">
        <a href="${appUrl}" style="${emailStyles.button}">
          Get Started Free
        </a>
      </div>
      
      <!-- Features Grid -->
      <div style="margin: 40px 0;">
        <h3 style="color: #333; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
          Everything you need in one place:
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                Easy Tracking
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Log glucose levels effortlessly with our intuitive interface
              </p>
            </td>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">🤖</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                AI Insights
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Get personalized recommendations from our AI assistant
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">📸</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                Photo Analysis
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Simply snap a photo of your meal for instant nutritional analysis
              </p>
            </td>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">📈</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                Beautiful Charts
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Visualize your trends with interactive charts and analytics
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">🔔</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                Smart Reminders
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Never miss a reading with customizable notifications
              </p>
            </td>
            <td style="padding: 15px; vertical-align: top;">
              <div style="font-size: 32px; margin-bottom: 10px;">💙</div>
              <h4 style="color: #208687; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                Supportive Community
              </h4>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                Join a caring community that understands your journey
              </p>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Social Proof -->
      <div style="${emailStyles.infoBox}">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; text-align: center; font-style: italic;">
          "BuddyBetes has transformed how I manage my diabetes. The AI insights are incredibly helpful, 
          and the photo feature makes tracking so much easier!"
        </p>
        <p style="color: #666; font-size: 14px; margin: 10px 0 0 0; text-align: center;">
          — Sarah, BuddyBetes User
        </p>
      </div>
      
      <!-- Final CTA -->
      <div style="text-align: center; margin: 40px 0;">
        <h3 style="color: #333; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
          Ready to take control?
        </h3>
        <div style="${emailStyles.buttonContainer}">
          <a href="${appUrl}" style="${emailStyles.button}">
            Start Your Free Journey
          </a>
        </div>
      </div>
      
      <hr style="${emailStyles.divider}" />
      
      <!-- Unsubscribe -->
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Don't want to receive these emails? 
          <a href="${unsubscribeUrl}" style="color: #208687; text-decoration: underline;">
            Unsubscribe here
          </a>
        </p>
      </div>
    </div>
  `;
  
  return createBaseTemplate({
    headerTitle: 'BuddyBetes',
    greeting,
    bodyContent,
    footerText: 'Making diabetes management easier, one day at a time.'
  });
};

import { emailStyles } from './styles.ts';

interface BaseTemplateOptions {
  headerTitle: string;
  greeting: string;
  bodyContent: string;
  footerText?: string;
}

export const createBaseTemplate = (options: BaseTemplateOptions): string => {
  const { headerTitle, greeting, bodyContent, footerText } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${headerTitle}</title>
    </head>
    <body style="${emailStyles.main}">
      <div style="${emailStyles.container}">
        <!-- Header -->
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.headerTitle}">${headerTitle}</h1>
        </div>
        
        <!-- Content -->
        <div style="${emailStyles.content}">
          <p style="${emailStyles.greeting}">${greeting}</p>
          ${bodyContent}
        </div>
        
        <!-- Footer -->
        <div style="${emailStyles.footer}">
          ${footerText ? `<p style="${emailStyles.footerText}">${footerText}</p>` : ''}
          <div style="${emailStyles.footerBrand}">BuddyBetes</div>
          <p style="${emailStyles.footerText}">Your diabetes management companion 💙</p>
          <p style="${emailStyles.footerText}">
            Questions? Contact us at <a href="mailto:support@buddybetes.com" style="color: #35cab4; text-decoration: none;">support@buddybetes.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

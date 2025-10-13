// Shared CSS styles for all email templates
export const emailStyles = {
  // Main container
  main: `
    background-color: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    padding: 40px 20px;
  `,
  
  // Content container
  container: `
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
  
  // Header with gradient
  header: `
    background: linear-gradient(135deg, #35cab4 0%, #208687 100%);
    padding: 40px 30px;
    text-align: center;
  `,
  
  headerTitle: `
    color: #ffffff;
    font-size: 28px;
    font-weight: bold;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `,
  
  // Content area
  content: `
    padding: 40px 30px;
  `,
  
  greeting: `
    font-size: 18px;
    color: #333333;
    margin: 0 0 20px 0;
  `,
  
  text: `
    font-size: 16px;
    line-height: 1.6;
    color: #666666;
    margin: 0 0 20px 0;
  `,
  
  // Info box (highlighted section)
  infoBox: `
    background: linear-gradient(135deg, rgba(53, 202, 180, 0.1) 0%, rgba(32, 134, 135, 0.1) 100%);
    border-left: 4px solid #35cab4;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
  `,
  
  infoBoxTitle: `
    font-size: 18px;
    font-weight: bold;
    color: #208687;
    margin: 0 0 15px 0;
  `,
  
  infoBoxContent: `
    font-size: 14px;
    line-height: 1.8;
    color: #333333;
    margin: 0;
  `,
  
  // Button
  buttonContainer: `
    text-align: center;
    margin: 30px 0;
  `,
  
  button: `
    display: inline-block;
    background: linear-gradient(135deg, #35cab4 0%, #208687 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 14px 40px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(53, 202, 180, 0.3);
  `,
  
  // Divider
  divider: `
    height: 1px;
    background-color: #e0e0e0;
    margin: 30px 0;
    border: none;
  `,
  
  // List
  list: `
    margin: 20px 0;
    padding-left: 20px;
  `,
  
  listItem: `
    font-size: 16px;
    line-height: 1.6;
    color: #666666;
    margin-bottom: 10px;
  `,
  
  // Footer
  footer: `
    background-color: #f9f9f9;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e0e0e0;
  `,
  
  footerText: `
    font-size: 14px;
    color: #999999;
    margin: 0 0 10px 0;
  `,
  
  footerBrand: `
    font-size: 16px;
    font-weight: bold;
    background: linear-gradient(135deg, #35cab4 0%, #208687 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 10px 0;
  `,
  
  // Security note
  securityNote: `
    background-color: #fff9e6;
    border: 1px solid #ffd700;
    border-radius: 6px;
    padding: 15px;
    margin: 20px 0;
    font-size: 14px;
    color: #856404;
  `,
  
  // Badge
  badge: `
    display: inline-block;
    background-color: #35cab4;
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  
  successBadge: `
    display: inline-block;
    background-color: #10b981;
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  
  warningBadge: `
    display: inline-block;
    background-color: #f59e0b;
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
};

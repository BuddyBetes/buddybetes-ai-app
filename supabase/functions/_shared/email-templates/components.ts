import { emailStyles } from './styles.ts';

// Reusable email component functions

export const createButton = (text: string, url: string): string => {
  return `
    <div style="${emailStyles.buttonContainer}">
      <a href="${url}" style="${emailStyles.button}">${text}</a>
    </div>
  `;
};

export const createInfoBox = (title: string, content: string): string => {
  return `
    <div style="${emailStyles.infoBox}">
      <h3 style="${emailStyles.infoBoxTitle}">${title}</h3>
      <div style="${emailStyles.infoBoxContent}">${content}</div>
    </div>
  `;
};

export const createDivider = (): string => {
  return `<hr style="${emailStyles.divider}" />`;
};

export const createList = (items: string[]): string => {
  const listItems = items.map(item => 
    `<li style="${emailStyles.listItem}">${item}</li>`
  ).join('');
  
  return `<ul style="${emailStyles.list}">${listItems}</ul>`;
};

export const createSecurityNote = (message: string): string => {
  return `
    <div style="${emailStyles.securityNote}">
      <strong>⚠️ Security Note:</strong> ${message}
    </div>
  `;
};

export const createBadge = (text: string, type: 'default' | 'success' | 'warning' = 'default'): string => {
  const badgeStyle = type === 'success' ? emailStyles.successBadge : 
                     type === 'warning' ? emailStyles.warningBadge : 
                     emailStyles.badge;
  
  return `<span style="${badgeStyle}">${text}</span>`;
};

export const createTable = (rows: { label: string; value: string }[]): string => {
  const tableRows = rows.map(row => `
    <tr>
      <td style="padding: 8px 12px; color: #666; font-size: 14px; border-bottom: 1px solid #f0f0f0;">
        ${row.label}
      </td>
      <td style="padding: 8px 12px; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0; text-align: right;">
        ${row.value}
      </td>
    </tr>
  `).join('');
  
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      ${tableRows}
    </table>
  `;
};

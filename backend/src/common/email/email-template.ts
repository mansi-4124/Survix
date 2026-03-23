type EmailTemplateInput = {
  heading: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  footer?: string;
};

export const buildSurvixEmailHtml = ({
  heading,
  body,
  actionLabel,
  actionUrl,
  footer,
}: EmailTemplateInput) => {
  const safeFooter =
    footer ?? 'If you did not request this, you can safely ignore this email.';

  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f8fafc, #eef2ff); padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="padding: 24px; background: linear-gradient(90deg, #4f46e5, #7c3aed); color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px;">Survix</h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin-top: 0; color: #0f172a;">${heading}</h2>
        <p style="color: #334155; line-height: 1.6;">${body}</p>
        ${
          actionLabel && actionUrl
            ? `<a href="${actionUrl}" style="display: inline-block; margin-top: 12px; background: linear-gradient(90deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; border-radius: 10px; padding: 12px 16px; font-weight: 600;">${actionLabel}</a>`
            : ''
        }
        <p style="margin-top: 24px; color: #64748b; font-size: 13px;">${safeFooter}</p>
      </div>
    </div>
  </div>`;
};

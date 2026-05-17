export function buildInvitationEmailHtml(params: {
  inviterName: string;
  accountName: string;
  invitationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #1C2B4A;">Te han invitado a unirte a ${params.accountName}</h2>
  <p>${params.inviterName} te ha invitado a colaborar en <strong>${params.accountName}</strong>.</p>
  <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
  <a
    href="${params.invitationUrl}"
    style="display:inline-block;background:#1C2B4A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;"
  >
    Aceptar invitación
  </a>
  <p style="color: #888; font-size: 12px; margin-top: 24px;">
    Si no esperabas esta invitación, puedes ignorar este correo.
    Este enlace expira en 7 días.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Envio de e-mails transacionais via Resend (https://resend.com).
 *
 * Requer a variável de ambiente RESEND_API_KEY.
 *
 * O domínio mandaprints.com.br está verificado no Resend (DKIM + SPF),
 * então o remetente usa esse domínio diretamente e entrega pra qualquer
 * destinatário — não é mais o modo sandbox (onboarding@resend.dev).
 */

interface EnviarEmailParams {
  para: string;
  assunto: string;
  html: string;
}

const REMETENTE_PADRAO = "pedidos@mandaprints.com.br";

export async function enviarEmail({ para, assunto, html }: EnviarEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY não configurada — e-mail para ${para} não foi enviado (modo simulação).`
    );
    console.log(`[email simulado] Para: ${para} | Assunto: ${assunto}`);
    return { simulado: true };
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: REMETENTE_PADRAO,
      to: para,
      subject: assunto,
      html,
    }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao enviar e-mail para ${para}: ${erro}`);
  }

  return { simulado: false };
}

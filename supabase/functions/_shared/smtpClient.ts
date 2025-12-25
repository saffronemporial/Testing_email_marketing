/**
 * SMTP client for Supabase Edge (Deno)
 * Supports STARTTLS + AUTH LOGIN
 */

type SMTPConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
};

type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
};

async function readLine(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  return decoder.decode(value || new Uint8Array());
}

function encodeBase64(value: string) {
  return btoa(value);
}

export async function sendSMTPMail(
  config: SMTPConfig,
  mail: SendMailArgs
): Promise<void> {
  const conn = await Deno.connect({
    hostname: config.host,
    port: config.port,
  });

  const reader = conn.readable.getReader();
  const writer = conn.writable.getWriter();

  const send = async (cmd: string) => {
    await writer.write(new TextEncoder().encode(cmd + "\r\n"));
    const res = await readLine(reader);
    if (!res.startsWith("2") && !res.startsWith("3")) {
      throw new Error(`SMTP error: ${res}`);
    }
  };

  // Initial handshake
  await readLine(reader);
  await send(`EHLO saffron-emporial`);

  // STARTTLS
  await send("STARTTLS");

  // Upgrade to TLS
  const tlsConn = await Deno.startTls(conn, {
    hostname: config.host,
  });

  const tlsReader = tlsConn.readable.getReader();
  const tlsWriter = tlsConn.writable.getWriter();

  const sendTLS = async (cmd: string) => {
    await tlsWriter.write(new TextEncoder().encode(cmd + "\r\n"));
    const res = await readLine(tlsReader);
    if (!res.startsWith("2") && !res.startsWith("3")) {
      throw new Error(`SMTP TLS error: ${res}`);
    }
  };

  await readLine(tlsReader);
  await sendTLS(`EHLO saffron-emporial`);

  // AUTH LOGIN
  await sendTLS("AUTH LOGIN");
  await sendTLS(encodeBase64(config.username));
  await sendTLS(encodeBase64(config.password));

  // MAIL FLOW
  await sendTLS(`MAIL FROM:<${config.from}>`);
  await sendTLS(`RCPT TO:<${mail.to}>`);
  await sendTLS("DATA");

  const message =
    `From: ${config.from}\r\n` +
    `To: ${mail.to}\r\n` +
    `Subject: ${mail.subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
    `${mail.html}\r\n.`;

  await tlsWriter.write(new TextEncoder().encode(message));
  await readLine(tlsReader);

  // QUIT
  await sendTLS("QUIT");

  tlsWriter.releaseLock();
  tlsReader.releaseLock();
  tlsConn.close();
}

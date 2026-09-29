type DailyCheckinReminderOptions = {
  name: string;
  locale?: "id" | "en";
  appUrl?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createDailyCheckinReminderEmail({
  name,
  locale = "id",
  appUrl,
}: DailyCheckinReminderOptions) {
  const safeName = escapeHtml(
    name.trim() || "kamu"
  );

  const url =
    appUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const checkinUrl = `${url}/${locale}/check-in`;

  if (locale === "en") {
    return {
      subject:
        "A small moment to check in with yourself",

      text: `Hi ${name || "there"},

How are you feeling today?

Take a couple of minutes to check in with yourself on Moodify. You can choose the emotions you're experiencing, add a little context, and reflect on what may be behind them.

Open Moodify:
${checkinUrl}

You don't have to figure everything out right now. Just start with how you feel.

— Moodify`,

      html: createHtml({
        greeting: `Hi ${safeName},`,
        title:
          "A small moment for yourself.",
        description:
          "How are you feeling today? Take a couple of minutes to check in with yourself and notice what is going on inside.",
        button:
          "Open today's check-in",
        checkinUrl,
        footer:
          "You can always come back to Moodify whenever you're ready.",
      }),
    };
  }

  return {
    subject:
      "Waktunya check-in sebentar di Moodify",

    text: `Hai ${name || "kamu"},

Gimana keadaanmu hari ini?

Luangkan sekitar dua menit untuk check-in di Moodify. Kamu bisa memilih emosi yang sedang dirasakan, menambahkan sedikit cerita, dan memahami apa yang sedang terjadi.

Buka Moodify:
${checkinUrl}

Kamu nggak harus menyelesaikan semuanya sekarang. Mulai saja dari apa yang sedang kamu rasakan.

— Moodify`,

    html: createHtml({
      greeting: `Hai ${safeName},`,
      title:
        "Luangkan sebentar untuk dirimu.",
      description:
        "Gimana keadaanmu hari ini? Luangkan sekitar dua menit untuk berhenti sejenak dan mengenali apa yang sedang kamu rasakan.",
      button:
        "Buka check-in hari ini",
      checkinUrl,
      footer:
        "Kamu bisa kembali ke Moodify kapan pun kamu siap.",
    }),
  };
}

function createHtml({
  greeting,
  title,
  description,
  button,
  checkinUrl,
  footer,
}: {
  greeting: string;
  title: string;
  description: string;
  button: string;
  checkinUrl: string;
  footer: string;
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Moodify</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#FDFBF7;
    font-family:Arial,Helvetica,sans-serif;
    color:#4A3F35;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background:#FDFBF7;"
  >
    <tr>
      <td
        align="center"
        style="padding:40px 16px;"
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:560px;
            background:#FFFFFF;
            border:1px solid rgba(74,63,53,0.08);
            border-radius:20px;
            overflow:hidden;
          "
        >
          <!-- HEADER -->

          <tr>
            <td
              style="
                padding:28px 32px 22px;
                border-bottom:1px solid rgba(74,63,53,0.06);
              "
            >
              <div
                style="
                  font-size:21px;
                  line-height:28px;
                  font-weight:700;
                  letter-spacing:-0.4px;
                  color:#4A3F35;
                "
              >
                Moodify
              </div>
            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td
              style="
                padding:36px 32px 34px;
              "
            >
              <p
                style="
                  margin:0 0 14px;
                  font-size:14px;
                  line-height:22px;
                  color:#5C6B9C;
                  font-weight:600;
                "
              >
                ${greeting}
              </p>

              <h1
                style="
                  margin:0;
                  font-size:28px;
                  line-height:36px;
                  letter-spacing:-0.7px;
                  color:#4A3F35;
                  font-weight:700;
                "
              >
                ${title}
              </h1>

              <p
                style="
                  margin:18px 0 0;
                  font-size:15px;
                  line-height:26px;
                  color:rgba(74,63,53,0.68);
                "
              >
                ${description}
              </p>

              <!-- BUTTON -->

              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="margin-top:28px;"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#E2725B"
                    style="border-radius:12px;"
                  >
                    <a
                      href="${checkinUrl}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:13px 20px;
                        border-radius:12px;
                        background:#E2725B;
                        color:#FFFFFF;
                        font-size:14px;
                        line-height:20px;
                        font-weight:700;
                        text-decoration:none;
                      "
                    >
                      ${button}
                    </a>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:28px 0 0;
                  padding:16px 18px;
                  border-radius:12px;
                  background:#FDFBF7;
                  font-size:13px;
                  line-height:21px;
                  color:rgba(74,63,53,0.58);
                "
              >
                ${footer}
              </p>
            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td
              style="
                padding:20px 32px 26px;
                border-top:1px solid rgba(74,63,53,0.06);
              "
            >
              <p
                style="
                  margin:0;
                  font-size:11px;
                  line-height:18px;
                  color:rgba(74,63,53,0.38);
                "
              >
                Kamu menerima email ini karena pengingat
                harian Moodify diaktifkan pada akunmu.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
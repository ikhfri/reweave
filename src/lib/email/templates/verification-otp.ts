type VerificationOtpTemplateInput = {
  name: string;
  otp: string;
};

export function verificationOtpTemplate({
  name,
  otp,
}: VerificationOtpTemplateInput) {
  return {
    subject: `${otp} — Kode verifikasi Moodify`,

    text: `
Hai ${name},

Kode verifikasi email Moodify kamu adalah:

${otp}

Kode ini berlaku selama 10 menit.

Kalau kamu tidak membuat akun Moodify, abaikan email ini.

Moodify
`,

    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifikasi Email Moodify</title>
</head>

<body style="margin:0;background:#fdfbf7;font-family:Arial,sans-serif;color:#4a3f35;">
  <div style="padding:40px 20px;">
    <div style="
      max-width:520px;
      margin:0 auto;
      background:#ffffff;
      border:1px solid #e7ddd5;
      border-radius:20px;
      padding:36px;
    ">

      <div style="
        font-size:24px;
        font-weight:700;
        color:#e2725b;
        margin-bottom:28px;
      ">
        Moodify
      </div>

      <h1 style="
        margin:0 0 12px;
        font-size:24px;
        color:#4a3f35;
      ">
        Verifikasi email kamu
      </h1>

      <p style="
        margin:0 0 24px;
        font-size:15px;
        line-height:1.7;
        color:#4a3f35;
        opacity:.7;
      ">
        Hai ${name}, satu langkah kecil lagi untuk mulai menggunakan Moodify.
      </p>

      <div style="
        background:#fbc4ab;
        border-radius:16px;
        padding:24px;
        text-align:center;
        margin-bottom:24px;
      ">

        <div style="
          font-size:12px;
          color:#4a3f35;
          opacity:.65;
          margin-bottom:8px;
        ">
          KODE VERIFIKASI
        </div>

        <div style="
          font-size:34px;
          font-weight:700;
          letter-spacing:8px;
          color:#4a3f35;
        ">
          ${otp}
        </div>

      </div>

      <p style="
        margin:0;
        font-size:13px;
        line-height:1.6;
        color:#4a3f35;
        opacity:.55;
      ">
        Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.
      </p>

      <div style="
        margin-top:32px;
        padding-top:20px;
        border-top:1px solid #e7ddd5;
        font-size:12px;
        color:#4a3f35;
        opacity:.45;
      ">
        Kalau kamu tidak membuat akun Moodify, kamu bisa mengabaikan email ini.
      </div>

    </div>
  </div>
</body>
</html>
`,
  };
}
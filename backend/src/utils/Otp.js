function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function getOtpHtml(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Your OTP Code</h2>
        <p class="otp">${otp}</p>
        <p>Please use this code to verify your email address.</p>
    </div>
</body>
</html>`;
}

export function getWelcomeHtml(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 480px;
            margin: 40px auto;
            background-color: #fff;
            padding: 32px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        .message {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
        .highlight {
            color: #4f46e5;
            font-weight: bold;
        }
        .footer {
            margin-top: 24px;
            font-size: 13px;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">Welcome to the Platform, <span class="highlight">${firstName}</span>! 🚀</div>
        <p class="message">
            Your email has been verified successfully.<br />
            You can now log in and start solving problems.
        </p>
        <p class="footer">Happy coding!</p>
    </div>
</body>
</html>`;
}

export default { generateOtp, getOtpHtml, getWelcomeHtml };

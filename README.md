# Digital Dairy

Digital Dairy is a dairy-breed reference for cows, goats and buffaloes. The site has a password-free customer check-in that saves a customer's name and phone number to a private Google Sheet. The sheet can be downloaded as an Excel workbook.

The check-in does not verify that a phone number belongs to the person entering it. Do not use it as identity verification or for sensitive account access.

## Set up the private customer sheet

1. Create a Google Sheet in your account. Keep its sharing set to **Restricted**. Copy the spreadsheet ID from its URL (the text between `/d/` and `/edit`).
2. In that sheet, open **Extensions → Apps Script**. Replace the editor contents with `google-sheets-apps-script.gs` and save.
3. In Apps Script, open **Project Settings → Script Properties** and add:
   - `SHEET_ID`: the spreadsheet ID from step 1.
   - `SHARED_SECRET`: a long random secret of at least 32 characters. Keep it private.
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to yourself and **Who has access** to **Anyone**, then deploy. Google will ask you to authorize the script. Copy the web app URL.
5. In Render, open the Digital Dairy service → **Environment** and add:
   - `GOOGLE_SHEETS_WEB_APP_URL`: the web app URL from step 4.
   - `GOOGLE_SHEETS_SHARED_SECRET`: the same secret from step 3.
6. Save the environment changes and redeploy the service.

The Apps Script endpoint only accepts a request with the shared secret. The secret and spreadsheet contents stay on the server; they are not sent to the browser or stored in this repository. Sign-in records use columns for first sign-in, name, phone, and last sign-in. Re-entering the same phone number updates its existing row.

To get an Excel copy, open the private Google Sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env` and fill in the two Google Sheets settings. Never commit `.env` or its secret.
4. Run `npm start` and open `http://localhost:3000`.

Render's Blueprint is in `render.yaml`. When adding environment variables to an existing Render service, set them in the service's **Environment** page.

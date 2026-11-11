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
   - `MANAGER_PASSWORD`: a separate strong password for the manager login.
6. Save the environment changes and redeploy the service.

The Apps Script endpoint only accepts a request with the shared secret. The secret and spreadsheet contents stay on the server; they are not sent to the browser or stored in this repository. Every sign-in creates a new row with the sign-in time, name and phone number. Managers can update product availability and animal counts in the manager panel, and set product prices in its separate **Set product prices** form; rates are saved separately so price changes do not overwrite stock. Inventory and rates are stored in an `Inventory` tab. A successful order checks stock and prices in Apps Script, subtracts the ordered quantities, and records the item list, total, delivery address, and payment method in the private `Orders` tab. Payment choices are cash or UPI at delivery; the site does not process online payments. When updating an existing deployment, paste the latest `google-sheets-apps-script.gs` into Apps Script, save, then choose **Deploy → Manage deployments → Edit → New version → Deploy** so ordering and stock deduction are enabled.

## ESP32 temperature, humidity, and flame monitor

The Home page can display the latest temperature, humidity, and flame status from the ESP32. Wire DHT11 VCC to 3V3, DATA to GPIO 4, and GND to GND; wire flame sensor `+` to 3V3, `G` to GND, and `DO` to GPIO 27. See `hardware/temperature_monitor/README.md` for Arduino IDE setup. Create a long random `ESP32_DEVICE_TOKEN`, set it in Render's **Environment** as `ESP32_DEVICE_TOKEN`, and place the same token only in the local ignored `hardware/temperature_monitor/secrets.h` file. The sensor sends readings over verified HTTPS every 30 seconds. The website shows the sensor offline if no update arrives for 90 seconds. Only the latest reading is kept in server memory; it is not historical storage or a certified fire-safety alarm.

To get an Excel copy, open the private Google Sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env` and fill in the Google Sheets settings and manager password. Set `ESP32_DEVICE_TOKEN` only if the sensor is configured. Never commit `.env` or its secrets.
4. Run `npm start` and open `http://localhost:3000`.

Render's Blueprint is in `render.yaml`. When adding environment variables to an existing Render service, set them in the service's **Environment** page.

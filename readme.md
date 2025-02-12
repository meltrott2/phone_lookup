# Phone Lookup Tool

**Author** Michael Henke

**Description**
The Phone Lookup Tool is designed to assist in retrieving information about individuals calling Mel Trotter Ministries (MTM). When a call is received, the system uses the provided phone number to search for contact information in a local database and, if necessary, in the Virtuous CRM system. The tool then displays the relevant contact information and allows users to add notes to the contact's profile.

**Features**
- Phone Number Lookup: Retrieve contact information based on the caller's phone number.
- Local Database Integration: Store and retrieve contact information from a local SQLite database.
- Virtuous CRM Integration: Search for contact information and notes in the Virtuous CRM system.
- Note Management: Add new notes to a contact's profile.
- Web Interface: User-friendly web interface for displaying contact information and managing notes.
- Automatic Database Updates: The database will automatically update itself with new contact information from Virtuous CRM as calls come in.
    - Adding a new contact
    - Updating contact gift information
- Automatic Database Updates: The database will automatically update its note types every day at midnight using cron jobs.
- Logging: Uses Winston package to handle logging to terminal and to log file.
- Send notification to microsoft teams when an error occurrs (Advancement -> App Status)

**Key Files and Directories**
- src/data/create_database.py: Script to create and populate the local SQLite database with contact information and note types.
- css: Contains CSS files for styling the web interface.
- js: Contains JavaScript files for handling client-side logic.
- routes: Contains Express route handlers for handling HTTP requests.
- utils: Contains utility modules for logging, database operations, and Virtuous CRM API interactions.
- views: Contains EJS templates for rendering HTML pages.
- server.js: Main server file that sets up the Express server and routes.

**Installation**
1. Download and install [Node.js](https://nodejs.org/en/download) and [Python](https://www.python.org/downloads/)
2. Download the repository
3. Open terminal to downloaded repository (phone_lookup/)
4. Install dependencies
    - `npm install`
    - `pip install requests`
5. Create local database:
      - Download this query using the pre selected fields: [Virtuous Query](https://app.virtuoussoftware.com/Generosity/Query/Editor/5400)
      - Move the downloaded csv file to the `src/data` folder
      - Confirm that the headers are in the following order
          - Full Name
          - Individual ID
          - Contact ID
          - Phone Number
          - Email Address
          - Last Gift Date
          - Last Gift Amount
    - Open terminal to `phone_lookup/src/data`
    - Run create_database script: `python create_database.py`
    - Do not re-run after the database has been created
6. Create environmental variable
    - Copy "Phone Call Lookup" API key from Virtuous
        - Settings -> all settings -> connectivity -> api keys
    - Copy webhook URL from Teams
       - App Status Channel -> open sidebar on right -> manage channel -> connectors -> edit -> configure incoming webhook -> create one and copy url
    - Open terminal
       - Windows
          - Example `setx VIRTUOUS_TOKN "xxxxxxx-xxxxxxx-xxxxxxx"`
          - Example `setx TEAMS_WEBHOOK "your link"`
       - Linux
          - Run this in the terminal `nano start-phone-lookup-server.sh` and add the following lines
              - `#!/bin/bash`
              - `export VIRTUOUS_TOKN="xxxxxxx-xxxxxxx-xxxxxxx"`
              - `export TEAMS_WEBHOOK="https://yourlink"`
              - `cd path/to/phone_lookup/`
              - `npm start`
          - Run this command `chmod +x start-phone-lookup-server.sh`
          - Run this command `crontab -e`
              - Add this to the end of the file `@reboot path/to/start-phone-lookup-server.sh`

**Vonage Setup**
1. Open Vonage Business application
2. Go to settings -> web launcher
3. Change the end to your name and paste into the box that says `Enter Website URL`
    - http://app04.meltrotter.net/handle-call?phone_number=%%phone_number_without_country_code%%&user_name=Your Name

**Usage**
1. Open terminal to `phone_lookup/`
2. Start server: `npm start`

**Contact**
For any issues or questions, please contact Michael Henke at michaelhenke@meltrotter.org.

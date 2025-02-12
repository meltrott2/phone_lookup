const express = require('express');
const { queryDatabase, insertDatabase } = require('../utils/database');
const { getContactNotes, searchForIndividual, searchForContact, cleanNote } = require('../utils/virtuous');
const { log } = require('../utils/logger');
const router = express.Router();

router.get('/handle-call', async (req, res) => {
    const { phone_number: number, user_name } = req.query;
    const formatted_number = `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;

    if (number.length !== 10) {
        log('error', "validate number", `Received an invalid number: ${formatted_number}`);
        res.redirect("/?invalid_number=true");
        return;
    }

    log('info', "", `${user_name} received a call from: ${formatted_number}`);
    log('callLog', "", `${user_name} received a call from: ${formatted_number}`);

    // Search database for user based on phone number
    let rows = [];
    try {
        rows = await queryDatabase('SELECT * FROM users WHERE PhoneNumber = ?', [number]);
    } catch (err) {
        log('error', 'query database', err);
    }

    // If not in database search Virtuous
    if (rows.length == 0) {
        try {
            log('info', "", `No entries in database for ${formatted_number}`);
            log('info', "", `Searching Virtuous for contact with phone number: ${formatted_number}`);
            rows = await searchForIndividual(number);
        } catch (err) {
            log('error', 'search for individual', err);
        }

        // Add contact to local database
        if (rows.length > 0) {
            let email = "";
            for (let i = 0; i < rows[0].contactMethods.length; i++) {
                if (rows[0].contactMethods[i].isPrimary && rows[0].contactMethods[i].type.includes("Email")) {
                    email = rows[0].contactMethods[i].value;
                    break;
                }
            }
            let giftData;
            try {
                giftData = await searchForContact(rows[0].contactId);
                const data = [
                    `${rows[0].firstName} ${rows[0].lastName}`,
                    rows[0].id, rows[0].contactId,
                    number, email,
                    giftData.date, giftData.amount.replace('$', '')
                ];
                await insertDatabase(data);
                rows = await queryDatabase('SELECT * FROM users WHERE PhoneNumber = ?', [number]);
            } catch (err) {
                log('error', "searching virtuous for contact", err);
                log('info' , "", 'Contact not added to local database');
            }
        }
    // In the database check to see if the gift data is up to date
    } else {
        try {
            let giftData = await searchForContact(rows[0].ContactID);
            giftData.amount = giftData.amount.replace('$', '');
            if (giftData.date != rows[0].LastGiftDate || giftData.amount != rows[0].LastGiftAmount) {
                let query = "UPDATE users SET LastGiftDate = ?, LastGiftAmount = ? WHERE IndividualID = ?";
                let data = [giftData.date, giftData.amount, rows[0].IndividualID];
                await queryDatabase(query, data);
                rows[0].LastGiftDate = giftData.date;
                rows[0].LastGiftAmount = giftData.amount;
                log('info', "", `Updated latest gift info for ${rows[0].FullName}`);
            }
        } catch (err) {
            log('error', "getting updated gift data", err);
            log('info', "", "No new gift data fetched");
        }
    }

    // User not in our system
    if (rows.length === 0) {
        log('info', "", `No entries found for: ${formatted_number}`);
        res.render('handle_call', { number, formatted_number, found_user: false, user: null, note: null, noteTypes: null, userName: user_name });
        return;
    }

    log('info', "", `Found user: ${rows[0].FullName}`);

    // Get contact notes
    let note;
    try {
        note = await getContactNotes(rows[0].ContactID);
        if (note === undefined) {
            log('info', "", `No notes found for: ${rows[0].FullName}`);
        } else {
            cleanNote(note);
        }
    } catch (err) {
        log('error', "getting contact notes", err);
    }

    // Get note types
    const noteTypes = await queryDatabase('SELECT * FROM noteTypes');

    // Render page with user info
    res.render('handle_call', { number, formatted_number, found_user: true, user: rows[0], note, noteTypes, userName: user_name });
});

module.exports = router;
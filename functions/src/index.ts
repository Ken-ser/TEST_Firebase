/* eslint-disable guard-for-in */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp({ storageBucket: "just-zoo-234019.appspot.com" });

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const addmessage = onRequest(async (request, response) => {
    // Grab the text parameter.
    const original = request.query.text;
    logger.log("Uploading", original);

    const db = getFirestore();
    // Push the new message into Firestore using the Firebase Admin SDK.
    const uppercaseRef = db.collection("messages").doc("up");

    const res = await uppercaseRef.set({
        original,
    });
    // Send back a message that we've successfully written the message
    response.json({
        result: "Message added",
        res,
    });
});

// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
export const makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
    // Grab the current value of what was written to Firestore.
    const original = event.data?.data().original;
    // Access the parameter `{documentId}` with `event.params`
    logger.log("Uppercasing on creation", event.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing
    // asynchronous tasks inside a function
    // such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return event.data?.ref.set({ uppercase }, { merge: true });
});
export const updateuppercase = onDocumentUpdated("/messages/{documentId}", (event) => {
    logger.log("Uppercasing on update");
    // Grab the current value of what was written to Firestore.
    if (event.data?.before.data().original != event.data?.after.data().original) {
        const uppercase = event.data?.after.data().original.toUpperCase();
        logger.log("Uppercased");
        return event.data?.after.ref.set({ uppercase }, { merge: true });
    }
    return { res: "ok" };
});

export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send({ pippo: "pippo" });
});

export const loadCV = onRequest(async (request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    const storage = getStorage().bucket();

    await storage.upload("lib/cv copy.pdf", {
        destination: "cvs/cv copy.pdf",
    }).catch((error) => response.send(error));

    response.send("ok");
});

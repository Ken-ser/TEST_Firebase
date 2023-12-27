import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import busboy from "busboy";
const app = initializeApp({ projectId: "just-zoo-234019", storageBucket: "just-zoo-234019.appspot.com" });
export const loadCV = onRequest(async (req, res) => {
    const bboy = busboy({ headers: req.headers });
    let fileBuffer;
    const formData = {
        name: '',
        surname: '',
        email: '',
        position: '',
        motivation: ''
    };
    bboy.on('file', (fieldname, file) => {
        file.on('data', (data) => {
            fileBuffer = data;
        });
    });
    bboy.on('field', (fieldname, val) => {
        formData[fieldname] = val;
    });
    bboy.on('finish', async () => {
        if (!fileBuffer) {
            return res.status(400).send('Invalid Request Body');
        }
        try {
            const storage = getStorage(app);
            const storageRef = ref(storage, `cvs/${formData.name} ${formData.surname}`);
            // Push file into storage
            await uploadBytes(storageRef, fileBuffer, {
                contentType: 'application/pdf',
            });
            console.log(`Filename Input Value:`, formData);
            const db = getFirestore(app);
            // Push data into Firestore
            const applicationRef = doc(db, "applications", formData.name);
            await setDoc(applicationRef, formData, { merge: true });
            return res.status(200).send('File uploaded successfully');
        }
        catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    });
    bboy.end(req.rawBody);
});
//# sourceMappingURL=index.js.map
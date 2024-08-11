import express from "express";
import {
    signUp,
    login,
    getUserDataFromGoogle,
    oAuthLogin,
    generateTokens,
    checkOAuthData,
    checkProfileValidation
} from "./auth";
import { asyncHandler } from "../util/route-util";
import { LoginInfo, SignUpInfo, ErrorMessage } from "../util/types";
import { createJSONToken } from "../util/auth";
import env from "dotenv";

const fs = require('fs');
const path = require('path');


env.config();
const FROTEND_URL = process.env.FRONTEND_URL;
const router = express.Router();



router.post("/signup", asyncHandler(async (req, res) => {
    const signUpInfo: SignUpInfo = req.body;
    const errors: ErrorMessage = await checkProfileValidation(signUpInfo);

    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: "User signup failed due to validation errors.",
            errors,
        })
    }

    await signUp(signUpInfo);
    res.status(200).json({ message: 'Successfully created user.' })
}));

router.post("/login", asyncHandler(async (req, res) => {
    const loginInfo: LoginInfo = req.body;
    const userDetails = await login(loginInfo);
    const token = createJSONToken(userDetails.email);

    res.status(200).json({
        message: 'Successfully logged in with user credentials.',
        data: userDetails,
        token: token
    })
}));



//create the url for google login and send it back to the frontend
router.post("/oauth", asyncHandler(async (req, res) => {

    res.header('Access-Control-Allow-Origin', `${FROTEND_URL}`); 
    res.header("Referrer-Policy", 'no-referrer-when-downgrade');

    const authUrl = await oAuthLogin();
    res.status(200).json({ authUrl });
}));

// localhost:8080/auth/google?
// code=4%2F0AcvDMrBKyO_0nCVsvBnhbft1E7QTDmc6-aDbth7mvoGctegmbiBY51qY32CMupM98D0xgQ
// &
// scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=0&prompt=consent

router.get("/auth/google", asyncHandler(async function (req, res) {
    const code: string = req.query.code as string;
    if (!code) res.status(400).json({ message: 'Authorization code is missing' });

    const tokens = await generateTokens(code);

    const { email, first_name, last_name } = await getUserDataFromGoogle(tokens.id_token);

    const password = "google";

    //check if the user already login this website or not
    await checkOAuthData({ email, password, first_name, last_name });

    //create JSON token
    const token = createJSONToken(email);
    //console.log(token);
    const filePath = path.join(__dirname, '../../redirect.html');

    // Read in the HTML file content
    fs.readFile(filePath, { encoding: 'utf-8' }, (err: any, htmlContent: string) => {
        if (err) {
            console.error('Error reading the HTML file:', err);
            return res.status(500).send('Error loading the authentication page.');
        }

        // Replace the placeholder with the actual token
        const updatedHtmlContent = htmlContent.replace('RETRIEVED_ID_TOKEN', token);

        // Send the modified HTML content as the response
        res.send(updatedHtmlContent);
    });
    // res.send(`<script>window.opener.postMessage({ token: '${token}' }, window.origin); window.close();</script>`);
    // res.status(200).json({
    //     message: "Success",
    //     token: "1345rhgdfjhgav4yug1q4hetkqh345y134thqekrjhvgtkq3h5"
    // })
}))



export default router;
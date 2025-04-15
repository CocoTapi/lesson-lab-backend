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


router.get("/auth/google", asyncHandler(async function (req, res) {
    const code: string = req.query.code as string;
    if (!code) res.status(400).json({ message: 'Authorization code is missing' });

    // Generate token using code from google
    const tokens = await generateTokens(code);

    // Get user data from google
    const { email, first_name, last_name } = await getUserDataFromGoogle(tokens.id_token);

    const password = "google";

    //check if the user already login this website or not
    await checkOAuthData({ email, password, first_name, last_name });

    //create JSON token
    const token = createJSONToken(email);

    res.redirect(`${process.env.FRONTEND_URL}${process.env.SUB_URL}?token=${token}`);

}))



export default router;
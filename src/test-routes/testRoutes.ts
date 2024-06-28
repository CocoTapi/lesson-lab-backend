import express from "express";
import { asyncHandler } from "../util/route-util";

import env from "dotenv";

env.config();

const testENV = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    // password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432'),

}


const router = express.Router();

//perform basic test
router.get('/', asyncHandler(async (_req, res) => {
    res.status(200).json({ message: "succeeded!" })
}));

//ensure env variables are loaded
router.get('/testENV', asyncHandler(async (_req, res) => {
    res.status(200).json( testENV );
}));

export default router;
import * as Redis from "ioredis";

export const sessionPrefix = "sess:";
export const userSessionIDPrefix = "userSid:";
export const forgotPasswordPrefix = "forgotPassword:";
export const redis = new Redis();

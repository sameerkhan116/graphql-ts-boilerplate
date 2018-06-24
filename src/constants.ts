import * as Redis from "ioredis";

export const redis = new Redis();

export const sessionPrefix = "sess:";
export const userSessionIDPrefix = "userSid:";
export const forgotPasswordPrefix = "forgotPassword:";

import 'dotenv/config';

export const GOOGLE = {
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:3000/api/auth/google/callback"
};
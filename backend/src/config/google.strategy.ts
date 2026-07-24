import passport from "passport";
import {
  _StrategyOptionsBase,
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";
import { Env } from "./env.config";
import { findOrCreateUserService } from "../services/auth.service";
import { NotFoundException } from "../utils/app-error";

passport.use(
  new GoogleStrategy(
    {
      clientID: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
      callbackURL: Env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    } as _StrategyOptionsBase,
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new NotFoundException("No Account found in google"));
        }

        const user = await findOrCreateUserService({
          googleId,
          email,
          name,
          avatar,
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import React from "react";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendMail } = await import("./mailer");
      const { ResetPasswordEmail } = await import("../emails/reset-password");
      await sendMail(
        user.email,
        "Réinitialise ton mot de passe — Prospecto",
        React.createElement(ResetPasswordEmail, { url, name: user.name })
      );
    },
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      sendMagicLink: async ({ email, url }) => {
        const { sendMail } = await import("./mailer");
        const { MagicLinkEmail } = await import("../emails/magic-link");
        await sendMail(
          email,
          "Ton lien de connexion — Prospecto",
          React.createElement(MagicLinkEmail, { url, email })
        );
      },
    }),
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      invitationExpiresIn: 48 * 60 * 60,
      sendInvitationEmail: async ({ invitation, organization: org }) => {
        const { sendMail } = await import("./mailer");
        const { InvitationEmail } = await import("../emails/invitation");
        const url = `${process.env.BETTER_AUTH_URL}/accept-invitation/${invitation.id}`;
        await sendMail(
          invitation.email,
          `Rejoins ${org.name} sur Prospecto`,
          React.createElement(InvitationEmail, {
            orgName: org.name,
            inviterName: invitation.inviterId,
            url,
          })
        );
      },
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { sendMail } = await import("./mailer");
            const { WelcomeEmail } = await import("../emails/welcome");
            await sendMail(
              user.email,
              `Bienvenue sur Prospecto, ${user.name}`,
              React.createElement(WelcomeEmail, { name: user.name })
            );
          } catch {
            // Never block user creation
          }
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

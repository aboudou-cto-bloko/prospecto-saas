import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendMail } = await import("./mailer");
      await sendMail(
        user.email,
        "Réinitialise ton mot de passe — Prospecto",
        `<p>Salut ${user.name},</p><p><a href="${url}">Clique ici pour réinitialiser ton mot de passe</a></p>`
      );
    },
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      sendMagicLink: async ({ email, url }) => {
        const { sendMail } = await import("./mailer");
        await sendMail(
          email,
          "Ton lien de connexion — Prospecto",
          `<p><a href="${url}">Clique ici pour te connecter</a></p>`
        );
      },
    }),
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      invitationExpiresIn: 48 * 60 * 60,
      sendInvitationEmail: async ({ invitation, organization: org }) => {
        const { sendMail } = await import("./mailer");
        const url = `${process.env.BETTER_AUTH_URL}/accept-invitation/${invitation.id}`;
        await sendMail(
          invitation.email,
          `Rejoins ${org.name} sur Prospecto`,
          `<p>Tu as été invité(e) à rejoindre <strong>${org.name}</strong> sur Prospecto.</p><p><a href="${url}">Accepter l'invitation</a></p>`
        );
      },
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

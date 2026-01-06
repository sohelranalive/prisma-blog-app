import { email } from "better-auth/*";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    // Check existing user in DB
    const adminData = {
      name: "Admin User",
      email: "admin@email.com",
      password: "admin1234",
      role: "ADMIN",
    };
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exits");
    }
    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      }
    );
    if (signUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

async function main() {
  const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const auth = getAuth(app);

  const email = "fitria.novetasari15@admin.sd.belajar.id";
  const password = "20320722";

  try {
    const existing = await auth.getUserByEmail(email);
    console.log("✓ Super Admin already exists:", existing.email);
  } catch (e: any) {
    if (e.code === "auth/user-not-found") {
      const newUser = await auth.createUser({
        email,
        password,
        displayName: "Fitria Novetasari (Admin SDN Kaliwungu 05)",
      });
      console.log("✓ Successfully created Super Admin account:", newUser.email);
    } else {
      throw e;
    }
  }

  console.log("\n--- ADMIN CREDENTIALS ---");
  console.log("Email   :", email);
  console.log("Password:", password);
}

main().catch(console.error);


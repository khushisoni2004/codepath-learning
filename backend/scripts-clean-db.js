const mongoose = require("mongoose");
require("dotenv").config();

async function cleanDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const db = mongoose.connection.db;

  await db.collection("registrations").updateMany(
    {},
    {
      $unset: {
        certificateId: "",
        certificateIssuedAt: "",
        paymentStatus: "",
        utrNumber: "",
        paymentSubmittedAt: "",
        __v: "",
      },
    }
  );

  console.log("Old unwanted fields removed from registrations.");
  console.log("Database:", mongoose.connection.name);

  await mongoose.disconnect();
}

cleanDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});

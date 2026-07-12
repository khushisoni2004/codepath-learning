const mongoose = require("mongoose");
require("dotenv").config();

async function cleanDatabase() {
  await mongoose.connect(process.env.MONGO_URI);

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

const Registration = require("../models/Registration");

async function generateRegistrationId() {
  const year = new Date().getFullYear();

  const count = await Registration.countDocuments({
    registrationId: new RegExp(`^CPL-REG-${year}-`),
  });

  return `CPL-REG-${year}-${String(count + 1).padStart(5, "0")}`;
}

module.exports = generateRegistrationId;

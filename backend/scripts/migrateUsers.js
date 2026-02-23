import mongoose from "mongoose";
import dotenv from "dotenv";

import Project from "../src/models/Project.js";
import Task from "../src/models/Task.js";
import Invoice from "../src/models/Invoice.js";
import PaymentLog from "../src/models/PaymentLog.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const DEFAULT_USER_ID = "698659c12efc65d735a66c6d";

await Project.updateMany({}, { user: DEFAULT_USER_ID });
await Task.updateMany({}, { user: DEFAULT_USER_ID });
await Invoice.updateMany({}, { user: DEFAULT_USER_ID });
await PaymentLog.updateMany({}, { user: DEFAULT_USER_ID });

console.log("✅ Migration complete");
process.exit();

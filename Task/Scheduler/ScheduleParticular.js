import { sendEmail } from "../Email/nodemailer.js";
import connectDB from "../db/db.js";
import mongoose from "mongoose";

// connect Database
connectDB()
  .then(() => {
    console.log("Connection Established");
  })
  .catch((err) => {
    console.log(`MongoDB connection failed`, err);
  });

// task to perform
const task = async () => {
  try {
    const myCollection = mongoose.connection.db.collection(process.env.MONGOBB_COLLECTION);

    // Fetch data from collection
    const fetchedData = await myCollection.find({}).toArray();

    /* sample data 
    { 
      "_id":{"$oid":"65fc79a576618de11ce5fa6a"},
      "text":["Hi","Hello","Bye","GoodBye"]},
    }
    */

    if (Array.isArray(fetchedData) && fetchedData.length > 0) {
      sendEmail(fetchedData[0].text);
      console.log("Email sent successfully!");
    } else {
      sendEmail("No data found in the fetched collection");
      console.log(
        "No data found in the fetched collection or it is not an array."
      );
    }
  } catch (error) {
    sendEmail(`Error occurred while fetching data: ${error}`);
    console.log("Error occurred while performing task:", error);
  }
};

function scheduleParticular() {
  const targetDate = new Date("2024-03-22T18:30:00");
  const currentTime = new Date();

  const timeDifference = targetDate.getTime() - currentTime.getTime();

  if (timeDifference < 0) {
    console.log("Target time has already passed. Task not scheduled.");
    return;
  }

  setTimeout(function () {
    task();
  }, timeDifference);
}

scheduleParticular();

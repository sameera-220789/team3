const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await User.findOne();
    if (user) {
        console.log("USER_ID:" + user._id);
    } else {
        console.log("NO_USER");
    }
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});

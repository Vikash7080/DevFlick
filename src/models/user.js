const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        },
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Please enter a strong password: " + value);
            }
        },
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: {
values: ["male","female","other"],
message:`{VALUE} is not a valid gender type`,
        },
        // validate(value) {
        //     if (!["male", "female", "others"].includes(value)) {
        //         throw new Error("Gender data is not valid");
        //     }
        // },
    },
    photoUrl: {
        type: String,
        default: "https://i.imgur.com/MT9Q4Vj.png",
        validate(value) {
            if (value && !validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
                throw new Error("Invalid photo URL: " + value);
            }
        },
    },
    about: {
        type: String,
        default: "This is default about of the user!",
    },
    skills: {
        type: [String],
    },
}, {
    timestamps: true,
});

// ✅ Generate JWT token
userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, "Dev1234@123", {
        expiresIn: "7d"
    });
    return token;
};

// ✅ Compare password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
    return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

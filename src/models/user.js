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
            values: ["male", "female", "other"],
            message: `{VALUE} is not a valid gender type`,
        },
       
    },
     isPremium:{
            type:Boolean,
            default:false,
        },
        membershipType:{
            type:String,
        },
    photoUrl: {
        type: String,
        default: "https://satyam-kumar-yadav.github.io/assets/img/profile.png",
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
    githubUrl: {   // ✅ new field
        type: String,
        validate(value) {
            if (value && !validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
                throw new Error("Invalid GitHub URL: " + value);
            }
        }
    }
}, {
    timestamps: true,
});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
    return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

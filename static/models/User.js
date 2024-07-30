const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "superadmin"]
    },
    password: {
        type: String,
        required: true
    },
    passwordAttemp: {
        type: Number,
        default: 0,
        required: true
    },
    passwordhist: {
        type: String,
        required: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginFailDelay: Date,
    passwordExpiresDate: Date,
    lastLoginAt: {
        type: String,
        required: false
    }

}, { timestamps: true })




module.exports = model('users', UserSchema)
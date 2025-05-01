const {Schema, model} = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const { type } = require("express/lib/response");
const { min, times } = require("lodash");
const { use } = require("../app");

const userSchema = Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: 3,
        maxlength: 100,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        maxlength: 1024,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",        
    }
}, {timestamps: true});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, role: this.role, email: this.email, name: this.name}, process.env.JET_SECRET_KEY, {expiresIn: "7d"});
    return token;
};

const validatUser = user => {
    const schema = joi.object({
        name: joi.string().min(3).max(100).required(),
        email: joi.string().min(5).max(255).required(),
        password: joi.string().min(5).max(225).required()
    })
    return schema.validate(user);
}

module.exports = model("User", userSchema);
module.exports.validate = validatUser;
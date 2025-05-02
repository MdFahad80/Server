const {Schema, model} = require("mongoose");
const joi = require("joi");

module.exports.Category = model('Category', Schema({
    name: {type: String, unique: true}
}, {timestamps: true}));

module.exports.validate = category => {
    const schema = joi.object({
        name: joi.string().min(3).max(50).required()
    })

    return schema.validate(category);
}

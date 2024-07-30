const { Schema, model } = require('mongoose')

const perSchema = new Schema({
    per: {
        type: Number,
        required: true
    }

}, { timestamps: true })


module.exports = model('per', perSchema)
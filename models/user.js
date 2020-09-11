const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    courses: {
        type: Array,
        unique: true,
        required: true
    }
}).pre('save', async function (next) {
    const user = this
    user.password = await bcrypt.hash(user.password, 8)
    next()
})

const User = mongoose.model('User', userSchema, 'users')

module.exports = User
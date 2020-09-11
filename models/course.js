const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    course_code: {
        type: String,
        unique: true,
        required: true
    },
    course_title: {
        type: String,
        unique: true,
        required: true
    },
    course_credit: {
        type: Number,
        required: true
    }
})

const Course = mongoose.model('Course', courseSchema, 'courses')

module.exports = Course
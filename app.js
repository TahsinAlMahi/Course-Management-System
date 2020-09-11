const path = require('path')
const express = require('express')
const router = require('express').Router()
const hbs = require('hbs')
const passport = require('passport')
const session = require('express-session')
require('./db/mongoose')
const User = require('./models/user')
const Course = require('./models/course')
const {authentication, secureAuthentication} = require('./authentication/auth')

const app = express()

const publicDirectory = path.join(__dirname, 'public')
const viewsPath = path.join(__dirname, '/public/templates/views')
const partialsPath = path.join(__dirname, '/public/templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
})

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(express.static(publicDirectory))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', function (req, res) {
    res.render('index.hbs', {
        title: 'LMS | Home'
    })
})

app.post('/register', async function (req, res) {
    try {
        const user = new User(req.body)
        await user.save()
        res.redirect('/')
        console.log('Registration Succesfull!')
    } catch (error) {
        res.redirect('/')
        console.log('Already Exist!')
    }
})

app.post('/login', async function (req, res, next) {
    await passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/'
    })(req, res, next)
})

app.get('/dashboard', secureAuthentication, async function (req, res) {
    const courses = await Course.find()
    res.render('dashboard.hbs', {
        title: 'Dashboard | Student',
        user: req.user,
        courses: courses
    })
})

app.get('/profile', secureAuthentication, function (req, res) {
    res.render('profile.hbs', {
        title: 'Profile | Student',
        user: req.user,
        courses: req.user.courses
    })
})

app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
    console.log('Logged out')
})

app.post('/enroll/:id', async function (req, res) {
    try {
        const userID = req.user.id
        const courseWithID = await Course.findById(req.params.id)

        await User.findByIdAndUpdate(userID, {
            $addToSet: {
                'courses': courseWithID
            }
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        res.redirect('/dashboard')
    } catch (error) {
        res.redirect('/dashboard')
        console.log(error)
    }
})

app.get('/users', async function (req, res) {
    try {
        const users = await User.find()
        res.render('users.hbs', {
            title: 'Users',
            users: users
        })
    } catch (error) {
        throw new Error()
    }
})


app.get('/course', async function (req, res) {
    try {
        const courses = await Course.find()
        res.render('course.hbs', {
            title: 'Course Builder',
            courses: courses
        })
    } catch (error) {
        throw new Error()
    }
})

app.post('/coursebuilder', async function (req, res) {
    try {
        const course = new Course(req.body)
        await course.save()
        res.redirect('/course')
    } catch (error) {
        res.redirect('/course')
        console.log('Already Exist!')
    }
})

app.get('*', function (req, res) {
    res.send('404 Not found')
})

const port = process.env.PORT || 3000
app.listen(port, function () {
    console.log('Server started on port ' + port)
})
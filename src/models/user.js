const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age : {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) throw new Error("Age must be a positive number.")
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate(value){
            if( !validator.isEmail(value) ) throw new Error("Email is invalid")
        } 
    },
    password : {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) throw new Error("Password may not contain \"password\"")
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})


// --------- Virtual relationships
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})


// --------- Dynamic user methods
// send back as json object
userSchema.methods.toJSON = function() {
    var user = this
    var userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

// generate token
userSchema.methods.generateAuthToken = async function () {
    var user = this
    var token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })

    await user.save()

    return token
}


// --------- Static User methods
userSchema.statics.findByCredentials = async(email, password) => {
    var user = await User.findOne({email})

    if (!user) throw new Error("Unable to login.")

    var isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new Error("Unable to login")

    return user
}


// --------- Middleware

// has plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// delete user tasks when user is removed
userSchema.pre("delete", async function(next) {
    var user = this

    await Task.deleteMany({owner: user._id})

    next()
    
})

const User = mongoose.model('User', userSchema )

module.exports = User
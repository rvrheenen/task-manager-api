const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT


// app config 
// Middleware to show method and path
app.use((req, res, next) => {
    console.log(req.method, req.path)
    next()
})

app.use(express.json())
app.use(userRouter, taskRouter)


// start listening
app.listen(port, () => {
    console.log("Server is up on port", port)
})

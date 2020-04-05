const express = require('express')
const router = new express.Router()
const auth = require("../middleware/auth")
const Task = require("../models/task")

// --------- task routes
// create tasks
router.post("/tasks", auth, async (req, res) => {
    var task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send()
    }
})

// read tasks
// GET /tasks?completed=[true/false]
// GET /tasks?limit=[int]&skip=[int] 
// GET /tasks?sortBy=[createdAt/completed]:[asc/desc]
router.get('/tasks', auth, async (req, res) => {
    // search
    var match = {}
    if (req.query.completed) match.completed = req.query.completed === "true"

    //sort
    var sort = {}
    if (req.query.sortBy) {
        var parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] == "desc" ? -1 : 1
    }

    try {
        await req.user.populate({
            path: "tasks",
            match, // search
            options: {
                limit: parseInt(req.query.limit), //pagination max
                skip: parseInt(req.query.skip), //pagination start
                sort
            }
        }).execPopulate()
        
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send()
    }
})

// read task
router.get("/tasks/:id", auth, async (req, res) => {
    try{
        var task = await Task.findOne({_id:req.params.id, "owner": req.user._id})
        
        if (!task) return res.status(404).send()
        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})

// update task
router.patch("/tasks/:id", auth, async (req, res) => {
    var updates = Object.keys(req.body)
    if (!updates.every(update => ["description", "completed"].includes(update))) {
        return res.status(400).send("Invalid updates!")
    }

    try {
        var task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send("Task not found")
        
        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        var task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send("Task not found")
        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router
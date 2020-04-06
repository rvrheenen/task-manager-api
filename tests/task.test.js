const request = require("supertest")
const app = require("../src/app")
const Task = require("../src/models/task")
const {userOneId, userOne, userTwoId, userTwo, taskOne, taskTwo, taskThree, setupDatabase} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should create task for user", async () => {
    var response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "finish learning testing"
        })
        .expect(201)

    var task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test("Should get all tasks for user one", async () => {
    var response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    expect(response.body.length).toBe(2)
})

test("Should not be able to delete other user's tasks", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)

    var task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})
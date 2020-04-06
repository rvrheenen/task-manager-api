const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const {userOneId, userOne, setupDatabase} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should signup a new user", async () => {
    var response = await request(app).post("/users").send({
        name: "Rick",
        email: "rick@example.com",
        password: "MyPass777!"
    }).expect(201)

    // assert database was changed correctly
    var user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assertions about the response
    expect(response.body.user.name).toBe("Rick")
    expect(response.body).toMatchObject({
        user: {
            name: "Rick",
            email: "rick@example.com"
        },
        token: user.tokens[0].token
    })
    
    expect(user.password).not.toBe("MyPass777!")
})

test("Should login existing user", async () => {
    var response  = await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    var userDB = await User.findById(userOneId)
    expect(userDB).not.toBeNull()
    expect(response.body.token).toBe(userDB.tokens[1].token)
})

test("Should login non-existing user", async () => {
    await request(app).post("/users/login").send({
        email: "doesnotexist@example.com",
        password: "irrelevant"
    }).expect(400)
})

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get profile for unauthenticated user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("Should delete account for user", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    var userDB = await User.findById(userOneId)

    expect(userDB).toBeNull()
})

test("Should not delete account for unauthenticated user", async () => {
    await request(app)
    .delete("/users/me")
    .send()
    .expect(401)
})

test("Should upload avatar image", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200)

    var user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should update valid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({name: "Mikey"})
        .expect(200)
    
    var user = await User.findById(userOneId)

    expect(user.name).toBe("Mikey")
})

test("Should not update invalid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({location: "Amsterdam"})
        .expect(400)
})
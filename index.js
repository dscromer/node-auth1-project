const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const session = require("express-session")
const KnexSessionStore = require("connect-session-knex")(session)
const usersRouter = require("./users/users-router")
const db = require("./database/config")

const server = express()
const port = process.env.PORT || 8080

server.use(helmet())
server.use(cors())
server.use(express.json())
server.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "I like eggs",
    store: new KnexSessionStore({
        knex: db,
        createtable: true,
    }),
}))

server.use(usersRouter)

server.use((err, req, next) => {
    console.log(err)

    res.status(500).json({
        message: "There was an error with the database"
    })
})

server.listen(port, () => {
    console.log(`Running at port http://localhost:${port}`)
})
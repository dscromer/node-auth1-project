const express = require("express")
const bcrypt = require("bcryptjs")
const Users = require("./users-model")
const usersMiddleware = require("./users-middleware")

const router = express.Router()

router.get("/api/users", usersMiddleware.restrict(), async (req, res, next) => {
    try {
        res.json(await Users.find())
    } catch(err) {
        next(err)
    }
})

router.post("/api/register", async (req, res, next) => {
    try {
        const {username, password} = req.body
        const user = await Users.findBy({ username }).first()

        if (user) {
            return res.status(409).json({
                message: "This isn't clone wars, choose a different username."
            })
        }

        const newUser = await Users.add({
            username,
            password: await bcrypt.hash(password, 15),
        })

        res.status(201).json(newUser)
    } catch(err) {
        next(err)
    }
})

router.post("/api/login", async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await Users.findBy({ username }).first()

        if (!user) {
            return res.status(401).json({
                message: "You entered a username that does not exist. Please check your username and try again."
            })
        }

        const passwordValid = await bcrypt.compare(password, user.password)

        if (!passwordValid) {
            return res.status(401).json({
                message: "You entered the wrong password. Please check your password and try again."
            })
        }

        req.session.user = user
        
        res.json({
            message: `You were logged in successfully! Welcome ${user.username}!`
        })
    } catch(err) {
        next(err)
    }
})

router.get("/api/logout", usersMiddleware.restrict(), async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                next(err)
            } else {
                res.status(204).json({
                    message: "You were logged out successfully!"
                })
            }
        })
    } catch(err) {
        next(err)
    }
})

module.exports = router
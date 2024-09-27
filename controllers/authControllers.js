const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.json({
        error: 'O nome é obrigatório'
      })
    }

    if (!password || password.length < 6) {
      return res.json({
        error: 'A senha é obrigatória e deve ter pelo menos 6 caracteres'
      })
    }

    const exist = await User.findOne({ email })

    if (exist) {
      return res.json({
        error: 'O e-mail colocado já está registrado.'
      })
    }

    const hashedPassword = await hashPassword(password)

    const user = await User.create({ name, email, password: hashedPassword })

    return res.json(user)
  } catch (error) {
    console.error(error)
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (!user) {
      return res.json({
        error: 'No user found'
      })
    }

    const match = await comparePassword(password, user.password)

    if (match) {
      jwt.sign({
        email: user.email,
        id: user._id,
        name: user.name
      }, process.env.JWT_SECRET, {}, (err, token) => {
        if (err) throw err

        res.cookie('token', token).json(user)
      })
    }

    if (!match) {
      res.json({
        error: 'O e-mail ou a senha estão incorretos.'
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const getProfile = (req, res) => {
  const { token } = req.cookies

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err

      res.json(user)
    })
  } else {
    res.json(null)
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile
}
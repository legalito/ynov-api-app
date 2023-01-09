import UserModel from '#components/user/user-model.js'
import Joi from 'joi'
import argon2, { hash } from 'argon2'
import { sendWelcomeEmail } from '#services/mailing/welcome-email.js'

export async function register (ctx) {
 try {
  const registerValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    terms_and_conditions: Joi.boolean().valid(true).required()
  })
  const params = ctx.request.body
  const { error, value } = registerValidationSchema.validate(params)
  if(error) throw new Error(error)
  const hashedPassword = await argon2.hash(value.password)
  const newUser = new UserModel({
    ...value,
    password: hashedPassword,
    settings: {
      terms_and_conditions: value.terms_and_conditions
    }
  })
  newUser.generateEmailVerificationToken()
  const user = await newUser.save()
  await sendWelcomeEmail(user, user.settings.validation_email_token)
  const token = user.generateJWT()
  ctx.ok({ token })
 } catch(e) {
  ctx.badRequest({ message: e.message })
 }
}


export async function login (ctx) {
  try {
    const loginValidationSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
    const { error, value } = loginValidationSchema.validate(ctx.request.body) 
    const genericError = () => { throw new Error('Email or password incorrect') }
    if(error) throw new Error(error)
    const user = await UserModel.findByEmail(value.email).select('password')
    if(!user) genericError()
    const passwordMatch = await argon2.verify(user.password, value.password)
    if(passwordMatch) {
      const token = user.generateJWT()
      return ctx.ok({ token })
    } else {
      genericError()
    }
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function profile (ctx) {
  if(!ctx.state.user) return ctx.notFound()
  ctx.ok(ctx.state.user)
}
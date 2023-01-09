import ListModel from '#components/list/list-model.js'
import TaskModel from '#components/task/task-model.js'

import Joi from 'Joi'

export async function index (ctx) {
  try {
    const lists = await ListModel.find({ /* user: ctx.state.user._id  */ })
    ctx.ok(lists)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function id (ctx) {
  try {
    if(!ctx.params.id) throw new Error('No id supplied')
    const list = await ListModel.findById({ user: ctx.state.user._id, _id: ctx.params.id }).lean()
    if(!list) { return ctx.notFound() }
    list.tasks = await TaskModel.findByListId(ctx.params.id)
    ctx.ok(list)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function create (ctx) {
  try {
    const listValidationSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string()
    })
    const { error, value } = listValidationSchema.validate(ctx.request.body)
    if(error) throw new Error(error)
    const newList = await ListModel.create({ ...value, user: ctx.state.user._id })
    ctx.ok(newList)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function update (ctx) {
  try {
    const listValidationSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      done: Joi.boolean()
    })
    if(!ctx.params.id) throw new Error('No id supplied')
    const { error, value } = listValidationSchema.validate(ctx.request.body)
    if(error) throw new Error(error)
    const updatedList = await ListModel.findOneAndUpdate({ _id: ctx.params.id, user: ctx.state.user._id}, value, { runValidators: true, new: true })
    if(!updatedList) return ctx.notFound()
    ctx.ok(updatedList)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function destroy (ctx) {
  try {
    if(!ctx.params.id) throw new Error('No id supplied')
    const ressourceDeleted = await ListModel.findOneAndDelete({ _id: ctx.params.id, user: ctx.state.user._id })
    if(!ressourceDeleted) return ctx.notFound()
    ctx.ok('Ressource deleted')
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}
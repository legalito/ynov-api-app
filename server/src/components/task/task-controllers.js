import TaskModel from '#components/task/task-model.js'
import { updateTask } from '#components/task/task-use-cases.js'
import Joi from 'Joi'

export async function index (ctx) {
  try {
    const tasks = await TaskModel.findAllByCreator(ctx.state.user._id)
    ctx.ok(tasks)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function id (ctx) {
  try {
    if(!ctx.params.id) throw new Error('No id supplied')
    const task = await TaskModel.findOneByCreator(ctx.state.user._id, { _id: ctx.params.id })
    if(!task) { return ctx.notFound() }
    ctx.ok(task)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function getAllByList (ctx) {
  try {
    if(!ctx.params.listId) throw new Error('No id supplied')
    const tasks = await TaskModel.findByListId(ctx.params.listId)
    ctx.ok(tasks)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}


export async function create (ctx) {
  try {
    const taskValidationSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      list: Joi.string().required()
    })
    const { error, value } = taskValidationSchema.validate(ctx.request.body)
    if(error) throw new Error(error)
    const newTask = await TaskModel.create({ ...value, user: ctx.state.user._id })
    ctx.ok(newTask)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function update (ctx) {
  try {
    const taskValidationSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      list: Joi.string(),
      done: Joi.boolean()
    })
    if(!ctx.params.id) throw new Error('No id supplied')
    const { error, value } = taskValidationSchema.validate(ctx.request.body)
    if(error) throw new Error(error)
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: ctx.params.id, user: ctx.state.user._id }, // Query parameters
      value, // Params to update
      { runValidators: true, new: true }) // Query options
    if(!updatedTask) return ctx.notFound()
    ctx.ok(updatedTask)
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}

export async function destroy (ctx) {
  try {
    if(!ctx.params.id) throw new Error('No id supplied')
    const deletedRessource = await TaskModel.findOneAndDelete({ _id: ctx.params.id, user: ctx.state.user._id })
    if(!deletedRessource) throw new Error('Ressource have not been deleted, check your rights')
    ctx.ok('Ressource deleted')
  } catch (e) {
    ctx.badRequest({ message: e.message })
  }
}
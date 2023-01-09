import mongoose from 'mongoose'

const { Schema } = mongoose

const listSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

const List = mongoose.model('List', listSchema)

export default List
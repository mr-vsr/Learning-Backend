import mongoose from 'mongoose';

const todosSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default:false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    subTodo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"SubTodo"
        }
    ]
},
    { timestamps: true });

export const Todo = mongoose.model('Todo', todosSchema);
import mongoose from 'mongoose';

const subTodoSchema = mongoose.Schema({
    title: {
        type: String,
        required:true
    },
    complete: {
        type: Boolean,
        default:false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
},
    { timestamps: true });

const subTodo = mongoose.model("SubTodo", subTodoSchema);
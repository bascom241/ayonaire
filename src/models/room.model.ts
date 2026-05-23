import mongoose,{Schema} from "mongoose"

const roomSchema = new Schema ({
    roomCreator: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: [true, "creator id is required"]
    },
    
})
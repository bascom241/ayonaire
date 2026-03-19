import mongoose, {Schema} from "mongoose";


const adminProfileSchema = new Schema ({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Admin Is required"]
    },
    fullName: {
        type: String,
        required: [true, "Admin FullName is Required"]
    },
    shortBio :{
        type: String,
    },
    department: {
        type: String
    },
    phoneNumber : {
        type: String
    }
}, {timestamps:true});


export default mongoose.model("")
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
     
    name: {
        type: String,
        required:true
    },
     email: {
        type: String,
         required: true,
        unique:[true,"email already exist"]
    },
    //  phone: {
    //     type: String,
    //     required:true
    // },
    password: {
        type: String,
        required:true,
    },
    role: {
        type: String,
        enum: ['student', 'recruiter'],
        default: "student",
        required:true
    },
    resume: {
        type: String,
        default:""
    },
    resumePublicId: {
        type: String,
        default:""
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Job'
    }] ,
    savedInterviewQuestion: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'InterviewQuestion'
    }],
     savedRoleQuestion: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'RoleQuestion'
    }],

    isVerified: {
        type: Boolean,
        default:false
    },
    verificationOTP: String,
    verificationOTPExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires:Date
    

   
       




}, { timestamps: true })


export const User=mongoose.model('User',userSchema)



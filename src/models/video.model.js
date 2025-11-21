import { urlencoded } from "express";
import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    video:{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
        }
    },
    title:{
        type:String,
        required: true,
        index: true
    },

    description:{
        type: String,
        index: true
    },
    videoDuration:{
        type: Number,
    },
    videoThumbnail:{
        url: {
            type: String,
        },
        public_id: {
            type: String
        }
    },
    views : {
        type: Number,
        required: true
    }


},{})

export const Video = mongoose.model("Video", videoSchema)
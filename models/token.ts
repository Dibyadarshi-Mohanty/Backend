import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    team_id:{
        type: String,
        required: true,
        unique: true
    },
    access_token:{
        type: String,
        required: true
    },
    refresh_token:{
        type:String,
        required:true,
    },
    expires_at: {
        type: Date,
        required: true
    }

});

export const TokenModel = mongoose.model("Token", TokenSchema);
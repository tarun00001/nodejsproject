const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
require('dotenv');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum : ['male','female','other']
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    paswordResetToken: String,
    paswordResetExpires: Date,
    cpassword: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
    role: {
        type: String,
        enum : ['user','admin'],
        default: 'user'
    },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]
},
{timestamps: true });       

UserSchema.pre('save', async function(next){
    // console.log('hii from inside')
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
    next();
})

    UserSchema.methods.createPasswordResetToken = function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        this.paswordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        // console.log({resetToken},this.paswordResetToken);

        this.paswordResetExpires = Date.now() + 5 * 60* 1000;

        return resetToken;
    }
// UserSchema.methods.generateAuthToken  = async function () {
//     try{
//         console.log(process.env.SECRET_KEY)
//         let token = jwt.sign({_id: this._id}, "MYNAMEISTARUNSINGHCHAUDHARYANDILIVESINGHAZIABAD");
//         console.log(token)
//         this.tokens = this.tokens.concat({token: token});
//         await this.save();
//         return token;
//     } catch(err){
//         console.log(err)
//     }
// }

module.exports = mongoose.model("user", UserSchema);
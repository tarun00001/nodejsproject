const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Projects = require('../model/project')
const fs = require("fs")
dotenv.config();

// Unique number
const {
    makeid,
    removeAllSpecialChars,
    checkCollectionName
} = require('../helper/helperFunctions')

const pojectCreation = async(req,res)=>{
    try {
        const {
            projectName,
            description,
            types
        } = req.body

        const projectNameToLower = projectName.toLowerCase();
        //  save to project

        // send to a function
        const typeCodeArr = [001,002]
        var schemaBlueprint = `const mongoose = require('mongoose')
    
        const schemaOptions = {
            timestamps: true,
            id: false,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const ${schemaName}Schema = new mongoose.Schema(
            {
                did: {
                    type: String,
                    required: [true, 'Device id is required.']
                },
                logGeneratedDate: {
                    type: Date
                },
                logMsg: {
                    type: String,
                    req
                },
                device_types: {
                    type: Number,
                    enum: ${typeCodeArr}
                },
                logType: {
                    type: String,
                    enum: ['w']
                }
            },
            schemaOptions
        )
                
        const ${schemaName} = mongoose.model('${schemaName}', ${schemaName}Schema)
        
        module.exports = ${schemaName}
        `

        fs.writeFile(`${__dirname.concat(`/../model/${schemaName}.js`)}`, schemaBlueprint, {
            encoding: "utf8",
            flag: "w",
            mode: 0o666
        }, (err) => {
            if (err) {
                console.log('err: ', err)
            }
            console.log('File written successfully')
            // console.log(fs.readFileSync(../models/${schemaName}.js, 'utf8'))
        })

        
        
    } catch (error) {
        
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

const getAllRegisterProject = async (req,res)=> {
    try {
        const allRgisterProject = await Projects.find();
        return res.status(200).json({'status':1,'data':allRgisterProject})
    } catch (error) {
        res.status(500).json({'status': -1,'error': error})
    }
}



/**
 * api      POST @/project_name
 * desc     To create new project
 */

const createNewProject = async (req,res) => {
    try {
        const{
            name,
            description,
            device_type
        } = req.body
        // device type will be  array 
        const arrayOfObjects = [];

        const typeCodeArray = [];

        if (device_type.length === 0) throw {message:"Please provide atleast one device name!"}

        //  loop and set the typecode and enum code
        for (let i = 0; i < device_type.length; i++) {
        arrayOfObjects.push({"typeCode":`00${i+1}`, "typeName":device_type[i]})
        typeCodeArray.push(`"00${i+1}"`)
        }

        const isCollectionExist = await checkCollectionName(name+'_collection');

        if (isCollectionExist) throw {message:"Project name already exist!!"}

        const collection_name = removeAllSpecialChars(name).toLowerCase()+'_collection'
        const project = await new Projects({
            name,
            description,
            code: makeid(5),
            device_types: arrayOfObjects,
            collection_name
        })
        const savedProject = await project.save(project);

        if(!savedProject) throw {message:"Project not created!!"}

        // dynamic schema

        const schemaBlueprint = `const mongoose = require('mongoose')
    
        const schemaOptions = {
            timestamps: true,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const ${collection_name}Schema = new mongoose.Schema(
            {
                did: {
                    type: String,
                    required: [true, 'Device id is required.'],
                    validate: {
                        validator: function(v) {
                            return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/.test(v)
                        },
                        message: '{VALUE} is not a valid device id.'
                    }
                },
                logGeneratedDate: {
                    type: Date,
                    required: [true, 'Log generation date is required.']
                },
                logMsg: {
                    type: String,
                    required: [true, 'Log message is required.']
                },
                device_types: {
                    type: String,
                    enum: [${typeCodeArray}],
                    required: [true, "Atleast one model required."]
                },
                logType: {
                    type: String,
                    enum: ["warn","info","error","debug"],
                    default: "info"
                }
            },
            schemaOptions
        )
                
        const ${collection_name} = mongoose.model('${collection_name}', ${collection_name}Schema)
        
        module.exports = ${collection_name}
        `

        fs.writeFile(`${__dirname.concat(`/../model/${collection_name}.js`)}`, schemaBlueprint, {
            encoding: "utf8",
            flag: "w",
            mode: 0o666
        }, (err) => {
            if (err) {
                console.log('err: ', err)
            }
            console.log('File written successfully')
            // console.log(fs.readFileSync(../models/${schemaName}.js, 'utf8'))
        })


        res.status(201).json({"status":1,"savedProject": savedProject})


    } catch (error) {
        if (error.code === 11000) res.status(409).json({
            "status":0,
            "message":"Duplicate project error",
            "errorMessage":error.message
        })
        res.status(400).json({"status":0,"errorMessage": 'Some error occurred.',"message":`${error.message}`})
    }
}


/**
 * api      GET @api/logger/project/:projectCode
 * @param {project code} req 
 * @param {whole project data} res 
 */
const  getProjectWithProjectCode = async (req,res)=>{
    try {
        const {projectCode} = req.params

        const getProject = await Projects.findOne({code:projectCode})

        if (!getProject) throw {
            "status":0,
            "message":"Project code Invalid!!"
        }

        res.status(200).json({
            "status":1,
            "data":getProject
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            "status":0,
            "error":error.message,
            "errorMessage":"Some error ocuured!"
        })
    }
}

/**
 * api      POST @api/logger/updateProjectDetail/:projectCode
 * @param {name, 
    * description, 
    * device_type} req 
 * @param {successful} res 
 */

const updateProjectWithProjectCode = async(req,res)=>{
    try {
        const {projectCode} = req.params
        const {
            name,
            description,
            device_type
        } = req.body
        console.log(req.body)
        
        const getProjectWithProjectCode = await Projects.findOne({code:projectCode})

        if (!getProjectWithProjectCode) throw {message:"We don't have any project with this code!!"}
        console.log(device_type)
        if (!device_type) {
            console.log("hello")
        }
        // if(!name  || device_type) throw "Please provide atleast one field to update!!"
        
        // let  modelSchema = `${getProjectWithProjectCode.collection_name}Schema`
        // const `${modelSchema}` = require(`../model/${getProjectWithProjectCode.collectionName}`)

        // Add new element to array
        
        const addNewElementToArray = []
        const newTypeCodeArray = []
        if(device_type) {
            const getLengthOfExistingDeviceType = getProjectWithProjectCode.device_types.length
            console.log(getLengthOfExistingDeviceType)

            getProjectWithProjectCode.device_types.map(deviceTypes => addNewElementToArray.push(deviceTypes));
    
            getProjectWithProjectCode.device_types.map(typeCodes => newTypeCodeArray.push(`"${typeCodes.typeCode}"`))
    
            for (let i = 0; i < device_type.length; i++) {
                addNewElementToArray.push({"typeCode":`00${getLengthOfExistingDeviceType+i+1}`, "typeName":device_type[i]})
                newTypeCodeArray.push(`"00${getLengthOfExistingDeviceType+i+1}"`)
            }
            
            
            const schemaBlueprint = `const mongoose = require('mongoose')
            
            const schemaOptions = {
                timestamps: true,
                toJSON: {
                    virtuals: false
                },
                toObject: {
                    virtuals: false
                }
            }
            
            const ${getProjectWithProjectCode.collection_name}Schema = new mongoose.Schema(
                {
                    did: {
                        type: String,
                        required: [true, 'Device id is required.'],
                        validate: {
                            validator: function(v) {
                                return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/.test(v)
                            },
                            message: '{VALUE} is not a valid device id.'
                        }
                    },
                    logGeneratedDate: {
                        type: Date,
                        required: [true, 'Log generation date is required.']
                    },
                    logMsg: {
                        type: String,
                        required: [true, 'Log message is required.']
                    },
                    device_types: {
                        type: String,
                        enum: [${newTypeCodeArray}],
                        required: [true, "Atleast one model required."]
                    },
                    logType: {
                        type: String,
                        enum: ["warn","info","error","debug"],
                        default: "info"
                    }
                },
                schemaOptions
                )
                
                const ${getProjectWithProjectCode.collection_name} = mongoose.model('${getProjectWithProjectCode.collection_name}', ${getProjectWithProjectCode.collection_name}Schema)
                
                module.exports = ${getProjectWithProjectCode.collection_name}
                `
                console.log(newTypeCodeArray);
                console.log(addNewElementToArray)
                
                fs.writeFile(`${__dirname.concat(`/../model/${getProjectWithProjectCode.collection_name}.js`)}`, schemaBlueprint, {
                    encoding: "utf8",
                    flag: "w",
                    mode: 0o666
                }, (err) => {
                    if (err) {
                        console.log('err: ', err)
                    }
                    console.log('File written successfully')
                    // console.log(fs.readFileSync(../models/${schemaName}.js, 'utf8'))
                })
            }
            
            getProjectWithProjectCode.name = name ? name : getProjectWithProjectCode.name;
            getProjectWithProjectCode.description = description ;
            getProjectWithProjectCode.device_types = device_type? addNewElementToArray : getProjectWithProjectCode.device_types;
            // Updating Data
            
            const isGetProjectWithProjectCodeSaved = getProjectWithProjectCode.save();
            
            if (!isGetProjectWithProjectCodeSaved) throw {
                "status":0,
                "message":"Some error occured during updating the project!!"
            }
            res.status(200).json({
            "status":1,
            "message":"Project Updated!!"
        })

        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "status":0,
            "message": error.message,
            "errorMessage":"Invalid data!"
        })
    }
}


const makeEntriesInDeviceLogger = async (req,res) => {
    try {
        const {project_code}  = req.params
        // check project exist or not
        const findProjectWithCode = await Projects.findOne({code:project_code})

        if (!findProjectWithCode) throw {
            "status": 0 ,
            "message":"Project does not exist"
        }

        const collectionName = findProjectWithCode.collection_name;

        const modelReference = require(`../model/${collectionName}`)

        const {
            mac_code,
            model_type,
            log_message,
            logGeneratedDate,
            log_type,
        } = req.body

        //  above details will be put in project tables

        //  check device id

        const putDataIntoLoggerDb = await new modelReference({
            did: mac_code,
            logGeneratedDate,
            logMsg: log_message,
            device_types: model_type,
            logType:log_type
        })

        const isLoggerSaved = await putDataIntoLoggerDb.save(putDataIntoLoggerDb)

        if(!isLoggerSaved) throw {
            "status":0,
            "message": "Logger entry failed!"
        }
        
        res.status(201).json({
            "status":1,
            "message":"Logger entry successful"
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "error":error
        })
    }
}


/**
 * desc     get project with filter
 * api      @/api/logger/projects/getDetails/:projectCode
 * 
 */

const getProjectWithFilter = async(req,res)=>{
    try {
        const {projectCode}  = req.params
        const {logType} = req.query
        const isProjectExist = await Projects.findOne({code:projectCode})
        if (!isProjectExist) throw {
            "message":"Project code invalid"
        }
        
        const collectionName = require(`../model/${isProjectExist.collection_name}.js`)
        // console.log({...collectionName})
        
        const logTypeList = ["warn","info","error","debug"];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let lotTypeObjext;
        if (logTypeList. includes(logType)){
            lotTypeObjext = await collectionName.find({logType}).skip(skip).limit(limit)
        }
        else{
            lotTypeObjext = await collectionName.find().skip(skip).limit(limit)
        }

        // Sending type name instead of type code
        isProjectExist.device_types.map( device => {
            lotTypeObjext.map( obj => {
                if(device.typeCode === obj.device_types) {
                    obj.device_types = device.typeName
                }
            })
        }) 

        return res.json({"message":"recieved at getProjectWithFilter ",'data':lotTypeObjext})
    } catch (error) {
        return res.json({
            "error":error.message
        })
    }
}

/**
 * 
 * @param {params} req 
 * @param {id of all device} res 
 * @returns 
 */
const getdeviceIdProjectWise = async(req,res)=>{
    try {
        const {projectCode}  = req.params
        const isProjectExist = await Projects.findOne({code:projectCode})
        if (!isProjectExist) throw {
            "message":"Project code invalid"
        }
        
        const collectionName = require(`../model/${isProjectExist.collection_name}.js`)
        const listOfId = await collectionName.find().select('did')
        return res.json({
            'deviceIds':listOfId
        })
    } catch (error) {
        console.log(error)
        return res.json({
            "errorMessage":"some error occured"
        })
    }
}

/**
 * desc     provide log count, logType wise count, log created date
 * api      @/api/logger/projects/getLogsCount/:projectCode
 */

const getProjectLogs = async(req,res)=>{
    try {
        const {projectCode} = req.params
        const isProjectExist = await Projects.findOne({code:projectCode})
        if (!isProjectExist) throw {
            "message":"Project code invalid "
        }
        
        const collectionName = require(`../model/${isProjectExist.collection_name}.js`)
        const typeWiseCount = await collectionName.aggregate([{$group :{_id : "$logType", count : {$sum : 1}}},{$project:{logType:"$_id",count:1, _id:0}}]);
        const totalLogCount = await collectionName.aggregate([{$group :{_id : "null", count : {$sum : 1}}}]);
        const lastLogEntry = await collectionName.findOne().sort({'createdAt':-1})

        return res.json({
            "data":{
                totalLogCount: totalLogCount[0].count,
                typeWiseCount,
                lastLogEntry: lastLogEntry.createdAt
            }
        })

    } catch (error) {
        return res.json({
            "error":error
        })
    }
}

module.exports = {
    createNewProject,
    getAllRegisterProject,
    makeEntriesInDeviceLogger,
    getProjectWithProjectCode,
    updateProjectWithProjectCode,
    getProjectWithFilter,
    getdeviceIdProjectWise,
    getProjectLogs
    
}
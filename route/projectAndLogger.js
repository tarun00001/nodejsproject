const express = require('express')
const router = express.Router();
const {
    createNewProject,
    getAllRegisterProject,
    makeEntriesInDeviceLogger,
    getProjectWithProjectCode,
    updateProjectWithProjectCode,
    getProjectWithFilter,
    getdeviceIdProjectWise,
    getProjectLogs
} = require('../controller/project');

const {authUser} = require('../middleware/authenticate')

// Unprotected
router.post('/makeLog/:project_code', makeEntriesInDeviceLogger)


// Protected
router.get('/',authUser,getAllRegisterProject);
router.post('/',authUser,createNewProject)
router.get('/:projectCode',authUser, getProjectWithProjectCode)
router.put('/:projectCode',authUser, updateProjectWithProjectCode)
router.get('/getDetail/:projectCode',authUser,getProjectWithFilter)
router.get('/getIds/:projectCode',authUser,getdeviceIdProjectWise)
router.get('/getLogsCount/:projectCode',authUser,getProjectLogs)

module.exports = router;
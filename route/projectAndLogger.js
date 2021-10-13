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
    getProjectLogs,
    getDeviceCount,
    getLogsCountWithOs,
    getLogsCountWithModelName,
    getLogsCountWithDate
} = require('../controller/project');

const {authUser,restrictToRole} = require('../middleware/authenticate');
const { authDevice } = require('../middleware/validate');

// Unprotected
router.post('/makeLog/:project_code' ,makeEntriesInDeviceLogger)


// Protected
router.get('/',authUser,getAllRegisterProject);
router.post('/',authUser,restrictToRole,createNewProject)
router.get('/:projectCode',authUser, getProjectWithProjectCode)
router.put('/:projectCode',authUser, updateProjectWithProjectCode)
router.get('/getDetail/:projectCode',authUser,getProjectWithFilter)
router.get('/getIds/:projectCode',authUser,getdeviceIdProjectWise)
router.get('/getLogsCount/:projectCode',authUser,getProjectLogs)
router.get('/getDeviceCount/:projectCode',authUser,getDeviceCount)
router.get('/getLogsCountWithOs/:projectCode',authUser,getLogsCountWithOs)
router.get('/getLogsCountWithModelName/:projectCode',authUser,getLogsCountWithModelName)
router.get('/getLogsCountWithDate/:projectCode',authUser,getLogsCountWithDate)

module.exports = router;
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
/*
var proID = {
  projectProperty: 'payload'
};
*/

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlProject = require('../controllers/project');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.get('/profile/:id', ctrlProfile.profileRead2);
router.post('/profileUpdate', auth, ctrlProfile.profileUpdate);
router.post('/profileDelete', auth, ctrlProfile.profileDelete);

// project
router.post('/projectCreate', ctrlProject.createProject);
router.get('/project/:id', ctrlProject.projectRead);
router.post('/projectUpdate/:id', auth, ctrlProject.projectUpdate);
router.post('/projectDelete/:id', auth, ctrlProject.projectDelete);
router.post('/fileUpload/:key', ctrlProject.uploadFile);
router.get('/download/:key', ctrlProject.downloadZip);

router.post('/runExistingCode/:key', ctrlProject.runExistingRCode);

router.post('/saveRCode/:key', ctrlProject.saveRCode);
router.post('/saveNote/:key', ctrlProject.saveNote);
router.post('/runRCode/:key', auth, ctrlProject.runRCode);
router.get('/loadTreedata/:key', ctrlProject.loadTreedata);
router.get('/loadTreedata2/:key/:string/:filename', ctrlProject.loadTreedata2);
router.get('/loadTreedata3/:key/:string/:filename', ctrlProject.loadTreedata3)

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
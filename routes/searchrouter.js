

const express = require('express')
const {search} = require('../controller/search')
const router = express.Router();


router.get('/',search);

exports.searchrouter = router;
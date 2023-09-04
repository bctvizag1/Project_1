const express = require('express');

const router = express.Router();


const contrl = require('./controllers/page-controller')

router.get('/',contrl.default);

router.get('/Jobstatus', contrl.jobStatus);
router.get('/faults', contrl.faultDailyLL);
router.get('/faultsFTTH', contrl.faultDailyFTTH);
router.get('/faultsBB', contrl.faultDailyBB);
router.get('/wkg_lines',contrl.wkg_lines);
router.get('/NPC_PENDING_ORDERS/:TYPE',contrl.NPC_PENDING_ORDERS);
router.get('/NPC_PENDING_ORDERS_SDE/:TYPE/:SDE',contrl.NPC_PENDING_ORDERS_SDE);

router.get('/LL_Provisions_service_sub_type_wise',contrl.LL_Provisions_service_sub_type_wise);
router.post('/LL_Provisions_service_sub_type_wise',contrl.LL_Provisions_service_sub_type_wise);





module.exports = router



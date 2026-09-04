<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectwebjmr.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connwebjmr)) {
    error_log("get_locations missing database connection");
    authJsonFail("Unable to load locations.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 41);

#region initialize variables
$locations = array();
#endregion

#region main
$locationQ = "SELECT * FROM `dispatch_locations` WHERE fldLocation!='WFH' AND fldActive=1";
$locationStmt = $connwebjmr->prepare($locationQ);
$locationStmt->execute();
if ($locationStmt->rowCount() > 0) {
    $locArr = $locationStmt->fetchAll();
    foreach ($locArr as $loc) {
        $output = array();
        $output['id'] = $loc['fldID'];
        $output['name'] = $loc['fldLocation'];
        array_push($locations, $output);
    }
}
#endregion

echo json_encode($locations);

<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

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

#region function

#endregion
echo json_encode($locations);

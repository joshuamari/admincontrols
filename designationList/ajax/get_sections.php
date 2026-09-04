<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt)) {
    error_log("get_sections missing database connection");
    authJsonFail("Unable to load sections.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 40);

#region initialize variables
$sections = array();
#endregion

#region main
$secQ = "SELECT * FROM `kdtpositions_sections` ORDER BY fldSectionID";
$secStmt = $connkdt->prepare($secQ);
$secStmt->execute();
if ($secStmt->rowCount() > 0) {
    $secArr = $secStmt->fetchAll();
    foreach ($secArr as $sec) {
        $output = array();
        $output["id"] = (int)$sec['fldSectionID'];
        $output["secName"] = $sec['fldSection'];
        array_push($sections, $output);
    }
}
#endregion

echo json_encode($sections);

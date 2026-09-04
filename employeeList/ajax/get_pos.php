<?php
#region Require Database Connections
ob_start();
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
ob_end_clean();
require_once '../../php/require_auth.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

if (!isset($connkdt, $connnew)) {
    error_log("get_pos missing database connection");
    authJsonFail("Unable to load positions.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 16);

#region initialize variables
$positions = array();
#endregion

#region main
$posQ = "SELECT * FROM `designation_list` ORDER BY `acronym`";
$posStmt = $connnew->query($posQ);
if ($posStmt !== false) {
    $positions = $posStmt->fetchAll();
}
#endregion

echo json_encode($positions);

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
    error_log("get_groups missing database connection");
    authJsonFail("Unable to load groups.");
}

$actorEmpNum = requireAuthenticatedUser();
requirePermission($actorEmpNum, 16);

#region initialize variables
$group = array();
#endregion

#region main
$groupsQ = "SELECT * FROM `group_list` ORDER BY `name`";
$groupStmt = $connnew->query($groupsQ);
if ($groupStmt !== false) {
    $group = $groupStmt->fetchAll();
}
#endregion

echo json_encode($group);

<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum = NULL;
if (!empty($_POST['empNum'])) {
    $empNum = $_POST['empNum'];
}
$pID = 39; //group list view and access MODULE PERMISSION ID kdtphdb>>>>p_permissions
$access = FALSE;
#endregion

#region main query
$accessQ = "SELECT COUNT(*) FROM `user_permissions` WHERE `fldEmployeeNum` = :empNum AND `permission_id` =:pID;";
$accessStmt = $connkdt->prepare($accessQ);
$accessStmt->execute([":empNum" => $empNum, ":pID" => $pID]);
$ac = $accessStmt->fetchColumn();
if ($ac) {
    $access = TRUE;
}
#endregion

#region function

#endregion

echo json_encode($access);

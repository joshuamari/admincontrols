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
$access = FALSE;
#endregion

#region main query
if (in_array($empNum, $sysItMembers)) {
    $access = TRUE;
}
#endregion

#region function

#endregion

echo json_encode($access);

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

csrf_require_boolean();
$access = FALSE;
$actorEmpNum = findAuthenticatedUser();
if ($actorEmpNum !== null && userHasPermission($actorEmpNum, 18)) {
    $access = TRUE;
}

echo json_encode($access);

<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$accName = NULL;
if (!empty($_POST['accName'])) {
    $accName = $_POST['accName'];
}
$modID = NULL;
if (!empty($_POST['modID'])) {
    $modID = $_POST['modID'];
}
$err = FALSE;
#endregion

#region Entries Query
try {
    $appQ = "INSERT INTO p_permissions(module_id,permission_name) VALUES (:modID,:accName)";
    $appStmt = $connkdt->prepare($appQ);
    $appStmt->execute([":accName" => $accName, ":modID" => $modID]);
} catch (Exception $e) {
    $err = $e;
}

#endregion

echo json_encode($err, JSON_PRETTY_PRINT);

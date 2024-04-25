<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$modName = NULL;
if (!empty($_POST['modName'])) {
    $modName = $_POST['modName'];
}
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = $_POST['projID'];
}
$err = FALSE;
#endregion

#region Entries Query
try {
    $modQ = "INSERT INTO kdtproject_modules(project_id,module_name) VALUES (:projID,:modName)";
    $modStmt = $connkdt->prepare($modQ);
    $modStmt->execute([":projID" => $projID, ":modName" => $modName]);
} catch (Exception $e) {
    $err = $e;
}

#endregion

echo json_encode($err, JSON_PRETTY_PRINT);

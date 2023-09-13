<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$appName = NULL;
if (!empty($_POST['appName'])) {
    $appName = $_POST['appName'];
}
$appColor = NULL;
if (!empty($_POST['appColor'])) {
    $appColor = $_POST['appColor'];
}
$err = FALSE;
#endregion

#region Entries Query
try {
    $appQ = "INSERT INTO kdtwebprojects(project_name,project_css_class) VALUES (:appName,:appColor)";
    $appStmt = $connkdt->prepare($appQ);
    $appStmt->execute([":appName" => $appName, ":appColor" => $appColor]);
} catch (Exception $e) {
    $err = $e;
}

#endregion

echo json_encode($err, JSON_PRETTY_PRINT);

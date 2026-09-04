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
    error_log("check_exists_edit missing database connection");
    authJsonFail("Unable to complete request.");
}

$actorEmpNum = requireAuthenticatedCsrfUser();
requirePermission($actorEmpNum, 16);

#region initialize variables
$empNum = NULL;
if (!empty($_POST['empnum'])) {
    $empNum = filter_var($_POST['empnum'], FILTER_VALIDATE_INT);
}
$empUser = NULL;
if (!empty($_POST['username'])) {
    $empUser = $_POST['username'];
}
$empEmail = NULL;
if (!empty($_POST['email'])) {
    $empEmail = $_POST['email'] . "@global.kawasaki.com";
}
$output = array();
#endregion

#region main
if ($empNum !== false && $empNum !== NULL && (int)$empNum > 0) {
    $empNum = (int)$empNum;
    if ($empUser !== NULL && $empUser !== '') {
        $userQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldUser =:empUser AND fldEmployeeNum <> :empNum LIMIT 1";
        $userStmt = $connkdt->prepare($userQ);
        $userStmt->execute([":empUser" => $empUser, ":empNum" => $empNum]);
        if ($userStmt->fetchColumn() !== false) {
            $output[] = 'Username';
        }
    }
    if ($empEmail !== NULL) {
        $emailQ = "SELECT fldEmployeeNum FROM kdtlogin WHERE fldOutlook =:empEmail AND fldEmployeeNum <> :empNum LIMIT 1";
        $emailStmt = $connkdt->prepare($emailQ);
        $emailStmt->execute([":empEmail" => $empEmail, ":empNum" => $empNum]);
        if ($emailStmt->fetchColumn() !== false) {
            $output[] = 'Email';
        }
    }
}

#endregion

echo json_encode($output);

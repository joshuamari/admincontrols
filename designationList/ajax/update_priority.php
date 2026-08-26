<?php
#region DB Connect
// require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$msg = array();
$sectionID = 0;
if (!empty($_POST['secID'])) {
    $sectionID = $_POST['secID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "SectionID Missing";
}
$posID = 0;
if (!empty($_POST['posID'])) {
    $posID = $_POST['posID'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Pos ID Missing";
}
$oldIndex = 0;
if (!empty($_POST['oldIndex'])) {
    $oldIndex = $_POST['oldIndex'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "Old Index Missing";
}
$newIndex = 0;
if (!empty($_POST['newIndex'])) {
    $newIndex = $_POST['newIndex'];
} else {
    $msg["isSuccess"] = false;
    $msg['message'] = "New Index Missing";
}
$maxPrio = getMax($sectionID);
if ($newIndex > $maxPrio) {
    $msg["isSuccess"] = true;
    $msg['message'] = "new: $newIndex, max: $maxPrio";
    die(json_encode($msg));
}

$conn_new_disable->beginTransaction();
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $updateCurrentQ = "UPDATE `designation_list` SET `priority` = :newIndex WHERE id=:posID AND `show_man_sum`=1";
        $updateStmt = $conn_new_disable->prepare($updateCurrentQ);
        $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID]);
        if ($newIndex != $oldIndex) {
            if ($newIndex < $oldIndex) {
                $updateQ = "UPDATE `designation_list` SET `priority` = `priority` + 1 WHERE `priority` >= :newIndex AND id<>:posID AND `priority`<>0 AND `priority` < :oldIndex AND `show_man_sum`=1";
                $updateStmt = $conn_new_disable->prepare(($updateQ));
                $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]);
            } else if ($oldIndex < $newIndex) {
                $updateQ = "UPDATE `designation_list` SET `priority` = `priority` - 1 WHERE `priority` <= :newIndex AND id<>:posID AND `priority`<>0 AND `priority` > :oldIndex AND `show_man_sum`=1";
                $updateStmt = $conn_new_disable->prepare(($updateQ));
                $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]);
            }
        }

        $conn_new_disable->commit();
        $msg["isSuccess"] = true;
        $msg["message"] = "Update Priority successfull";
    } else {
        $conn_new_disable->rollBack();
    }
} catch (Exception $e) {
    $conn_new_disable->rollBack();
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);

#region Functions
function getMax($secid)
{
    global $conn_new_disable;
    $max = 0;
    $maxQ = "SELECT MAX(`priority`) FROM `designation_list` WHERE `section`=:secid";
    $maxStmt = $conn_new_disable->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    if ($maxStmt->rowCount() > 0) {
        $max = (int)$maxStmt->fetchColumn();
    }
    return $max;
}
#endregion

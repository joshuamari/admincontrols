<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
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

$connDisable->beginTransaction();
#endregion

#region Entries Query
try {
    if (empty($msg)) {
        $updateCurrentQ = "UPDATE `kdtpositions` SET fldPrio = :newIndex WHERE id=:posID AND fldShowManSum=1";
        $updateStmt = $connDisable->prepare($updateCurrentQ);
        $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID]);
        if ($newIndex != $oldIndex) {
            if ($newIndex < $oldIndex) {
                $updateQ = "UPDATE `kdtpositions` SET fldPrio = fldPrio + 1 WHERE fldPrio >= :newIndex AND id<>:posID AND fldPrio<>0 AND fldPrio < :oldIndex AND fldShowManSum=1";
                $updateStmt = $connDisable->prepare(($updateQ));
                $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]);
            } else if ($oldIndex < $newIndex) {
                $updateQ = "UPDATE `kdtpositions` SET fldPrio = fldPrio - 1 WHERE fldPrio <= :newIndex AND id<>:posID AND fldPrio<>0 AND fldPrio > :oldIndex AND fldShowManSum=1";
                $updateStmt = $connDisable->prepare(($updateQ));
                $updateStmt->execute([":newIndex" => $newIndex, ":posID" => $posID, ":oldIndex" => $oldIndex]);
            }
        }

        $connDisable->commit();
        $msg["isSuccess"] = true;
        $msg["message"] = "Update Priority successfull";
    } else {
        $connDisable->rollBack();
    }
} catch (Exception $e) {
    $connDisable->rollBack();
    $msg["isSuccess"] = false;
    $msg['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);

#region Functions
function getMax($secid)
{
    global $connkdt;
    $max = 0;
    $maxQ = "SELECT MAX(fldPrio) FROM `kdtpositions` WHERE fldSectionID=:secid";
    $maxStmt = $connkdt->prepare($maxQ);
    $maxStmt->execute([":secid" => $secid]);
    if ($maxStmt->rowCount() > 0) {
        $max = (int)$maxStmt->fetchColumn();
    }
    return $max;
}
#endregion

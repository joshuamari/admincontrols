<?php
/**
 * Insert one Admin Controls activity row into kdtphdb.ac_audit_log.
 * Actor must already be the cookie employee number, not a posted empNum.
 */
function audit_log($actorEmpNum, $action, $entity, $entityId, $old = null, $new = null)
{
    global $connkdt;

    if (!isset($connkdt)) {
        error_log("audit_log missing database connection");
        return false;
    }

    $actorEmpNum = filter_var($actorEmpNum, FILTER_VALIDATE_INT);
    $entityId = filter_var($entityId, FILTER_VALIDATE_INT);
    if ($actorEmpNum === false || (int)$actorEmpNum <= 0 || $entityId === false || (int)$entityId <= 0) {
        error_log("audit_log invalid actor or entity_id");
        return false;
    }

    $action = is_string($action) ? trim($action) : '';
    $entity = is_string($entity) ? trim($entity) : '';
    if ($action === '' || strlen($action) > 32 || $entity === '' || strlen($entity) > 32) {
        error_log("audit_log invalid action or entity");
        return false;
    }

    $oldJson = audit_log_encode($old);
    $newJson = audit_log_encode($new);
    if ($oldJson === false || $newJson === false) {
        error_log("audit_log json encode failed");
        return false;
    }

    try {
        $insertQ = "INSERT INTO ac_audit_log (actor, action, entity, entity_id, old_json, new_json)
            VALUES (:actor, :action, :entity, :entity_id, :old_json, :new_json)";
        $insertStmt = $connkdt->prepare($insertQ);
        if ($insertStmt === false) {
            error_log("audit_log prepare failed");
            return false;
        }
        $ok = $insertStmt->execute([
            ":actor" => (int)$actorEmpNum,
            ":action" => $action,
            ":entity" => $entity,
            ":entity_id" => (int)$entityId,
            ":old_json" => $oldJson,
            ":new_json" => $newJson,
        ]);
        if (!$ok) {
            error_log("audit_log insert failed");
            return false;
        }
        return true;
    } catch (Exception $e) {
        error_log("audit_log insert failed");
        return false;
    }
}

function audit_log_encode($value)
{
    if ($value === null) {
        return null;
    }
    if (is_string($value)) {
        return $value === '' ? null : $value;
    }
    $encoded = json_encode($value, JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        return false;
    }
    return $encoded;
}

function audit_empty_date($value)
{
    if ($value === null || $value === false) {
        return null;
    }
    $value = trim((string)$value);
    if ($value === '' || $value === '0000-00-00' || $value === '0000-00-00 00:00:00') {
        return null;
    }
    return $value;
}

function audit_fetch_employee($empnum)
{
    global $connkdt;

    $empnum = filter_var($empnum, FILTER_VALIDATE_INT);
    if (!isset($connkdt) || $empnum === false || (int)$empnum <= 0) {
        return null;
    }

    try {
        $empQ = "SELECT ep.fldFirstname AS firstname,
                        ep.fldSurname AS surname,
                        ep.fldNick AS nickname,
                        ep.fldUser AS username,
                        ep.fldGroup AS `group`,
                        ep.fldDesig AS position,
                        ep.fldBirthDate AS birthdate,
                        ep.fldGender AS gender,
                        ep.fldStatus AS marital_status,
                        ep.fldDateHired AS date_hired,
                        ep.fldResignDate AS resignation_date,
                        ep.fldActive AS active,
                        kl.fldOutlook AS email
                 FROM emp_prof AS ep
                 LEFT JOIN kdtlogin AS kl ON ep.fldEmployeeNum = kl.fldEmployeeNum
                 WHERE ep.fldEmployeeNum = :empnum
                 LIMIT 1";
        $empStmt = $connkdt->prepare($empQ);
        if ($empStmt === false) {
            error_log("audit_fetch_employee prepare failed");
            return null;
        }
        $empStmt->execute([":empnum" => (int)$empnum]);
        $row = $empStmt->fetch();
        if ($row === false) {
            return null;
        }
        $active = isset($row['active']) ? (int)$row['active'] : 0;
        return [
            "firstname" => $row['firstname'],
            "surname" => $row['surname'],
            "nickname" => $row['nickname'],
            "username" => $row['username'],
            "group" => $row['group'],
            "position" => $row['position'],
            "birthdate" => audit_empty_date($row['birthdate']),
            "gender" => $row['gender'],
            "marital_status" => $row['marital_status'],
            "date_hired" => audit_empty_date($row['date_hired']),
            "email" => $row['email'],
            "status" => $active === 1 ? "Active" : "Resigned",
            "resignation_date" => audit_empty_date($row['resignation_date']),
        ];
    } catch (Exception $e) {
        error_log("audit_fetch_employee failed");
        return null;
    }
}

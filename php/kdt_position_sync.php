<?php

function kdtPositionSectionName($sectionID)
{
    global $connkdt;
    $sectionID = (int)$sectionID;
    if (!isset($connkdt) || $sectionID <= 0) {
        return null;
    }
    $stmt = $connkdt->prepare("SELECT fldSection FROM kdtpositions_sections WHERE fldSectionID=:sectionID LIMIT 1");
    if ($stmt === false || $stmt->execute([":sectionID" => $sectionID]) === false) {
        return null;
    }
    $name = $stmt->fetchColumn();
    if ($name === false || $name === null || $name === '') {
        return null;
    }
    return $name;
}

function syncKdtPosition($id, $acronym, $name, $sectionID, $priority, $show)
{
    global $connDisable;
    if (!isset($connDisable) || $acronym === null || $acronym === '' || $name === null || $name === '') {
        return false;
    }
    if ($acronym === 'hh') {
        return true;
    }
    $sectionName = kdtPositionSectionName($sectionID);
    if ($sectionName === null) {
        return false;
    }
    $id = (int)$id;
    $sectionID = (int)$sectionID;
    $priority = (int)$priority;
    $show = ((int)$show === 1) ? 1 : 0;
    if ($id <= 0) {
        return false;
    }

    $params = [
        ":id" => $id,
        ":acronym" => $acronym,
        ":name" => $name,
        ":sectionName" => $sectionName,
        ":sectionID" => $sectionID,
        ":priority" => $priority,
        ":show" => $show,
    ];
    $update = $connDisable->prepare("UPDATE kdtpositions SET fldAcro=:acronym, fldFull=:name, fldSection=:sectionName, fldSectionID=:sectionID, fldPrio=:priority, fldShowManSum=:show WHERE id=:id");
    if ($update === false || $update->execute($params) === false) {
        return false;
    }
    if ($update->rowCount() > 0) {
        return true;
    }

    $exists = $connDisable->prepare("SELECT id FROM kdtpositions WHERE id=:id LIMIT 1");
    if ($exists === false || $exists->execute([":id" => $id]) === false) {
        return false;
    }
    if ($exists->fetchColumn() !== false) {
        return true;
    }

    $insert = $connDisable->prepare("INSERT INTO kdtpositions (id, fldAcro, fldFull, fldSection, fldSectionID, fldPrio, fldShowManSum) VALUES (:id, :acronym, :name, :sectionName, :sectionID, :priority, :show)");
    return $insert !== false && $insert->execute($params) !== false;
}

function syncKdtPositionPriorities(PDO $newConn, $sectionID)
{
    global $connDisable;
    if (!isset($connDisable)) {
        return false;
    }
    $sectionID = (int)$sectionID;
    $list = $newConn->prepare("SELECT id, acronym, priority FROM `designation_list` WHERE `section`=:sectionID");
    if ($list === false || $list->execute([":sectionID" => $sectionID]) === false) {
        return false;
    }
    $rows = $list->fetchAll();
    $update = $connDisable->prepare("UPDATE kdtpositions SET fldPrio=:priority WHERE id=:id");
    $exists = $connDisable->prepare("SELECT id FROM kdtpositions WHERE id=:id LIMIT 1");
    if ($update === false || $exists === false) {
        return false;
    }
    foreach ($rows as $row) {
        if ($row["acronym"] === "hh") {
            continue;
        }
        $id = (int)$row["id"];
        if ($update->execute([":priority" => (int)$row["priority"], ":id" => $id]) === false) {
            return false;
        }
        if ($update->rowCount() > 0) {
            continue;
        }
        if ($exists->execute([":id" => $id]) === false || $exists->fetchColumn() === false) {
            return false;
        }
    }
    return true;
}

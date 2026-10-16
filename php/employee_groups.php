<?php

function employee_group_ids_from_post($raw)
{
    if (!is_array($raw) || count($raw) === 0) {
        return null;
    }
    $ids = [];
    foreach ($raw as $value) {
        $id = filter_var($value, FILTER_VALIDATE_INT);
        if ($id === false || (int)$id <= 0) {
            return null;
        }
        $ids[(int)$id] = (int)$id;
    }
    return array_values($ids);
}

function employee_groups_resolve($conn, array $ids, $mainId)
{
    $mainId = filter_var($mainId, FILTER_VALIDATE_INT);
    if ($mainId === false || !in_array((int)$mainId, $ids, true)) {
        return null;
    }
    $mainId = (int)$mainId;

    $holders = [];
    $params = [];
    foreach ($ids as $i => $id) {
        $key = ":g{$i}";
        $holders[] = $key;
        $params[$key] = $id;
    }
    $sql = "SELECT `id`, `abbreviation` FROM `group_list` WHERE `id` IN (" . implode(",", $holders) . ") ORDER BY `abbreviation`";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        return null;
    }
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    if (count($rows) !== count($ids)) {
        return null;
    }

    $orderedIds = [];
    $abbrs = [];
    $mainAbbr = null;
    foreach ($rows as $row) {
        $abbr = (string)$row['abbreviation'];
        if ($abbr === '' || strpos($abbr, '/') !== false) {
            return null;
        }
        $orderedIds[] = (int)$row['id'];
        $abbrs[] = $abbr;
        if ((int)$row['id'] === $mainId) {
            $mainAbbr = $abbr;
        }
    }
    $joined = implode('/', $abbrs);
    if ($mainAbbr === null) {
        return null;
    }
    if (strlen($mainAbbr) > 50 || strlen($joined) > 100) {
        return ['error' => 'Selected groups exceed the legacy group list limit.'];
    }
    return [
        'ids' => $orderedIds,
        'main_id' => $mainId,
        'main_abbr' => $mainAbbr,
        'fld_groups' => $joined,
    ];
}

function employee_groups_replace($conn, $empnum, array $ids)
{
    $delete = $conn->prepare("DELETE FROM `employee_group` WHERE `employee_number` = :empnum");
    $delete->execute([":empnum" => $empnum]);
    $insert = $conn->prepare("INSERT INTO `employee_group` (`employee_number`, `group_id`) VALUES (:empnum, :groupId)");
    foreach ($ids as $groupId) {
        $insert->execute([":empnum" => $empnum, ":groupId" => $groupId]);
    }
}

function employee_groups_load($conn, $empnum)
{
    $stmt = $conn->prepare(
        "SELECT eg.group_id, el.group_id AS main_id
         FROM `employee_list` AS el
         LEFT JOIN `employee_group` AS eg ON eg.employee_number = el.id
         WHERE el.id = :empnum"
    );
    $stmt->execute([":empnum" => $empnum]);
    $ids = [];
    $mainId = 0;
    foreach ($stmt->fetchAll() as $row) {
        $mainId = (int)$row['main_id'];
        if ($row['group_id'] !== null) {
            $ids[] = (int)$row['group_id'];
        }
    }
    if ($mainId > 0 && !in_array($mainId, $ids, true)) {
        $ids[] = $mainId;
    }
    return ['ids' => $ids, 'main_id' => $mainId];
}

function employee_groups_joined($conn, $empnum)
{
    $stmt = $conn->prepare(
        "SELECT gl.abbreviation
         FROM `employee_group` AS eg
         JOIN `group_list` AS gl ON gl.id = eg.group_id
         WHERE eg.employee_number = :empnum
         ORDER BY gl.abbreviation"
    );
    $stmt->execute([":empnum" => $empnum]);
    $abbrs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (!$abbrs) {
        return '';
    }
    return implode('/', $abbrs);
}

function employee_groups_display_map($conn, array $empNums)
{
    $empNums = array_values(array_unique(array_filter(array_map('intval', $empNums))));
    if (count($empNums) === 0) {
        return [];
    }
    $holders = [];
    $params = [];
    foreach ($empNums as $i => $num) {
        $key = ":e{$i}";
        $holders[] = $key;
        $params[$key] = $num;
    }
    $sql = "SELECT eg.employee_number,
                   gl.abbreviation,
                   CASE WHEN eg.group_id = el.group_id THEN 1 ELSE 0 END AS is_main
            FROM `employee_group` AS eg
            JOIN `group_list` AS gl ON gl.id = eg.group_id
            JOIN `employee_list` AS el ON el.id = eg.employee_number
            WHERE eg.employee_number IN (" . implode(",", $holders) . ")
            ORDER BY gl.abbreviation";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        return [];
    }
    $stmt->execute($params);
    $grouped = [];
    foreach ($stmt->fetchAll() as $row) {
        $num = (int)$row['employee_number'];
        if (!isset($grouped[$num])) {
            $grouped[$num] = ['main' => '', 'others' => []];
        }
        if ((int)$row['is_main'] === 1) {
            $grouped[$num]['main'] = (string)$row['abbreviation'];
        } else {
            $grouped[$num]['others'][] = (string)$row['abbreviation'];
        }
    }
    $labels = [];
    foreach ($grouped as $num => $parts) {
        if ($parts['main'] !== '') {
            $labels[$num] = $parts['others']
                ? $parts['main'] . ' · ' . implode(', ', $parts['others'])
                : $parts['main'];
        } else {
            $labels[$num] = implode(', ', $parts['others']);
        }
    }
    return $labels;
}

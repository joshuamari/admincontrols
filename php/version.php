<?php

header('Content-Type: application/json; charset=UTF-8');

$releases = ac_parse_changelog(__DIR__ . '/../CHANGELOG.md');
$version = '';
foreach ($releases as $release) {
    if (strcasecmp($release['version'], 'Unreleased') === 0) {
        continue;
    }
    $version = $release['version'];
    break;
}

foreach ($releases as &$release) {
    $release['current'] = $version !== '' && $release['version'] === $version;
}
unset($release);

echo json_encode([
    'success' => true,
    'data' => [
        'version' => $version,
        'releases' => $releases,
    ],
], JSON_UNESCAPED_UNICODE);

function ac_parse_changelog($path)
{
    if (!is_readable($path)) {
        return [];
    }

    $markdown = file_get_contents($path);
    if ($markdown === false) {
        return [];
    }

    $markdown = preg_replace('/<!--.*?-->/s', '', $markdown);
    $lines = preg_split('/\r\n|\n|\r/', (string) $markdown);
    $releases = [];
    $current = null;
    $section = null;

    foreach ($lines as $line) {
        if (preg_match('/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/', $line, $match)) {
            if ($current !== null) {
                $releases[] = $current;
            }
            $current = [
                'version' => $match[1],
                'date' => isset($match[2]) ? $match[2] : '',
                'highlights' => [],
            ];
            $section = null;
            continue;
        }

        if ($current === null) {
            continue;
        }

        if (preg_match('/^###\s+(Added|Changed|Fixed|Removed|Notes)\s*$/i', $line, $match)) {
            $section = strtolower($match[1]);
            continue;
        }

        if ($section !== null && preg_match('/^\s*-\s+(.+)$/', $line, $match)) {
            $text = trim($match[1]);
            if ($text !== '') {
                $current['highlights'][] = [
                    'type' => $section,
                    'text' => $text,
                ];
            }
        }
    }

    if ($current !== null) {
        $releases[] = $current;
    }

    return $releases;
}

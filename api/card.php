<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = $_GET['id'] ?? null;

if (!$id || !preg_match('/^[a-f0-9]{32}$/', $id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID invalide']);
    exit;
}

$metaFile = __DIR__ . '/../data/' . $id . '/meta.json';

if (!file_exists($metaFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Carte introuvable']);
    exit;
}

$meta = json_decode(file_get_contents($metaFile), true);

$imageUrls = [];
if (!empty($meta['images'])) {
    foreach ($meta['images'] as $path) {
        $fullPath = realpath(__DIR__ . '/../' . $path);
        $baseDir = realpath(__DIR__ . '/../data');
        if ($fullPath && $baseDir && strpos($fullPath, $baseDir) === 0 && file_exists($fullPath)) {
            $mime = mime_content_type($fullPath);
            if (!$mime) $mime = 'image/png';
            $b64 = base64_encode(file_get_contents($fullPath));
            $imageUrls[] = 'data:' . $mime . ';base64,' . $b64;
        }
    }
}

echo json_encode([
    'meta'      => [
        'nom'     => $meta['nom'] ?? '',
        'prenoms' => $meta['prenoms'] ?? '',
        'poste'   => $meta['poste'] ?? ''
    ],
    'imageUrls' => $imageUrls
]);

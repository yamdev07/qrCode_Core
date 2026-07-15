<?php
header('Content-Type: text/html; charset=utf-8');

$id = $_GET['id'] ?? null;

if (!$id || !preg_match('/^[a-f0-9]{32}$/', $id)) {
    http_response_code(400);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Erreur</title></head><body style="font-family:sans-serif;text-align:center;padding:3rem;color:#666"><h2>ID invalide</h2></body></html>';
    exit;
}

$metaFile = __DIR__ . '/../data/' . $id . '/meta.json';

if (!file_exists($metaFile)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Introuvable</title></head><body style="font-family:sans-serif;text-align:center;padding:3rem;color:#666"><h2>Carte introuvable</h2><p>Le fichier meta.json est introuvable pour cet ID.</p></body></html>';
    exit;
}

$meta = json_decode(file_get_contents($metaFile), true);
$nom = htmlspecialchars($meta['nom'] ?? '');
$prenoms = htmlspecialchars($meta['prenoms'] ?? '');
$poste = htmlspecialchars($meta['poste'] ?? '');

$imageTags = '';
if (!empty($meta['images'])) {
    foreach ($meta['images'] as $path) {
        $fullPath = realpath(__DIR__ . '/../' . $path);
        $baseDir = realpath(__DIR__ . '/../data');
        if ($fullPath && $baseDir && strpos($fullPath, $baseDir) === 0 && file_exists($fullPath)) {
            $mime = mime_content_type($fullPath);
            if (!$mime) $mime = 'image/png';
            $b64 = base64_encode(file_get_contents($fullPath));
            $dataUrl = 'data:' . $mime . ';base64,' . $b64;
            $imageTags .= '<a href="' . $dataUrl . '" target="_blank"><img src="' . $dataUrl . '" alt="Image" loading="lazy" /></a>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $nom ?> <?= $prenoms ?></title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 1.5rem 1rem; }
        .card { max-width: 600px; width: 100%; background: #fff; border-radius: 20px; padding: 2rem; box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
        .identity { text-align: center; margin-bottom: 1.5rem; }
        .identity h1 { font-size: 1.5rem; color: #0f172a; margin-bottom: 0.35rem; }
        .poste { color: #6366f1; font-weight: 600; font-size: 0.95rem; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        .gallery a { display: block; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .gallery img { width: 100%; height: auto; display: block; }
        .empty { text-align: center; color: #94a3b8; padding: 2rem; }
    </style>
</head>
<body>
    <div class="card">
        <header class="identity">
            <h1><?= $nom ?> <?= $prenoms ?></h1>
            <?php if ($poste): ?><p class="poste"><?= $poste ?></p><?php endif; ?>
        </header>
        <?php if ($imageTags): ?>
        <div class="gallery">
            <?= $imageTags ?>
        </div>
        <?php else: ?>
        <p class="empty">Aucune image disponible.</p>
        <?php endif; ?>
    </div>
</body>
</html>

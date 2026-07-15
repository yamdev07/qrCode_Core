<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['nom']) || !isset($input['images']) || empty($input['images'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes (nom et images requis)']);
    exit;
}

$cardId = bin2hex(random_bytes(16));

$cardDir = __DIR__ . '/../data/' . $cardId;
if (!is_dir(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}
if (!mkdir($cardDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible de créer le dossier: ' . $cardDir]);
    exit;
}

$imagePaths = [];
foreach ($input['images'] as $index => $dataUrl) {
    if (preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $typeMatch)) {
        $ext = strtolower($typeMatch[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
    } else {
        $ext = 'png';
    }
    $raw = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $dataUrl));
    if ($raw === false) {
        http_response_code(400);
        echo json_encode(['error' => "Image $index invalide (base64 decode failed)"]);
        exit;
    }
    $filename = sprintf('%02d.%s', $index + 1, $ext);
    file_put_contents($cardDir . '/' . $filename, $raw);
    $imagePaths[] = 'data/' . $cardId . '/' . $filename;
}

$meta = [
    'nom'       => $input['nom'],
    'prenoms'   => $input['prenoms'] ?? '',
    'poste'     => $input['poste'] ?? '',
    'images'    => $imagePaths,
    'createdAt' => date('c')
];

file_put_contents($cardDir . '/meta.json', json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

$serverIp = getHost();

echo json_encode([
    'id'       => $cardId,
    'viewUrl'  => '/carte/' . $cardId,
    'serverIp' => $serverIp
]);

function getHost() {
    if (isset($_SERVER['HTTP_HOST'])) {
        $host = parse_url('http://' . $_SERVER['HTTP_HOST'], PHP_URL_HOST);
        if ($host && $host !== 'localhost' && $host !== '127.0.0.1' && $host !== '::1') {
            return $host;
        }
    }

    if (PHP_OS_FAMILY === 'Windows') {
        $output = [];
        @exec('ipconfig 2>&1', $output, $ret);
        if ($ret === 0) {
            $best = null;
            foreach ($output as $line) {
                if (preg_match('/IPv4[^:]*:\s*(\d+\.\d+\.\d+\.\d+)/i', $line, $m)) {
                    $ip = $m[1];
                    if ($ip === '127.0.0.1' || $ip === '::1') continue;
                    if (strpos($ip, '169.254.') === 0) continue;
                    if (strpos($ip, '192.168.137.') === 0) continue;
                    $best = $ip;
                    break;
                }
            }
            if ($best) return $best;
        }
    }

    $ips = @dns_get_record(gethostname());
    if ($ips) {
        foreach ($ips as $dns) {
            if (isset($dns['ip']) && $dns['ip'] !== '127.0.0.1' && strpos($dns['ip'], '169.254.') !== 0) {
                return $dns['ip'];
            }
        }
    }

    return '127.0.0.1';
}

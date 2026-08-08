<?php
header('Content-Type: application/json');

// Terima data JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validasi input
if (!isset($data['name']) || !isset($data['email']) || !isset($data['subject']) || !isset($data['message'])) {
    echo json_encode(['success' => false, 'message' => 'Semua field harus diisi']);
    exit;
}

// Sanitasi input (kompatibel PHP 8.1+)
$name = isset($data['name']) ? htmlspecialchars(strip_tags(trim($data['name'])), ENT_QUOTES, 'UTF-8') : '';
$email = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$subject = isset($data['subject']) ? htmlspecialchars(strip_tags(trim($data['subject'])), ENT_QUOTES, 'UTF-8') : '';
$message = isset($data['message']) ? htmlspecialchars(strip_tags(trim($data['message'])), ENT_QUOTES, 'UTF-8') : '';

// Validasi email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email tidak valid']);
    exit;
}

// Email tujuan (ganti dengan email Anda)
$to = "deyusep01@gmail.com"; // Ganti dengan email Anda

// Persiapkan pesan email
$email_content = "Nama: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Pesan:\n$message";

// Header email
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Kirim email
if (mail($to, $subject, $email_content, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal mengirim email']);
}
?>
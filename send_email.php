<?php
/**
 * Contact Form Handler - WebForMe
 * Connects securely to Hostinger SMTP on port 465 (SSL)
 */

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

// Extract and sanitize input
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

// Validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email address."]);
    exit;
}

// Hostinger SMTP configuration
$smtp_server = "ssl://smtp.hostinger.com";
$port = 465;
$username = "hello@webforme.in";
$password = "Tanisha_$06";

$to = "hello@webforme.in";
$subject = "New Contact Form Submission from " . $name;

// Email Body
$email_message = "You have received a new message from your website contact form:\n\n";
$email_message .= "Name: " . $name . "\n";
$email_message .= "Email: " . $email . "\n\n";
$email_message .= "Message:\n" . $message . "\n";

/**
 * Sends email using direct socket SMTP over SSL
 */
function send_smtp_email($server, $port, $user, $pass, $from, $to, $subject, $body_text) {
    $timeout = 10;
    
    // Connect to server
    $socket = @fsockopen($server, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        throw new Exception("Connection to SMTP server failed: $errstr ($errno)");
    }
    
    // Set socket stream timeout
    stream_set_timeout($socket, $timeout);

    // Helper function to read SMTP responses
    $read_response = function($socket) {
        $data = "";
        while (($line = fgets($socket, 515)) !== false) {
            $data .= $line;
            if (substr($line, 3, 1) === " ") {
                break;
            }
        }
        return $data;
    };

    $read_response($socket); // Greeting response
    
    // Send EHLO
    fwrite($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?: 'localhost') . "\r\n");
    $read_response($socket);
    
    // AUTH LOGIN
    fwrite($socket, "AUTH LOGIN\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "334") {
        throw new Exception("AUTH LOGIN not supported/accepted: " . trim($response));
    }
    
    // Send Username
    fwrite($socket, base64_encode($user) . "\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "334") {
        throw new Exception("Username rejected: " . trim($response));
    }
    
    // Send Password
    fwrite($socket, base64_encode($pass) . "\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "235") {
        throw new Exception("Password authentication failed: " . trim($response));
    }
    
    // MAIL FROM
    fwrite($socket, "MAIL FROM: <$from>\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "250") {
        throw new Exception("MAIL FROM rejected: " . trim($response));
    }
    
    // RCPT TO
    fwrite($socket, "RCPT TO: <$to>\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "250" && substr($response, 0, 3) !== "251") {
        throw new Exception("RCPT TO rejected: " . trim($response));
    }
    
    // DATA
    fwrite($socket, "DATA\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "354") {
        throw new Exception("DATA command rejected: " . trim($response));
    }
    
    // Prepare message headers and body
    $headers = [
        "From: " . $from,
        "Reply-To: " . $from,
        "To: " . $to,
        "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "Date: " . date('r'),
        "Message-ID: <" . time() . "-" . uniqid() . "@" . ($_SERVER['SERVER_NAME'] ?: 'localhost') . ">"
    ];
    
    $msg_content = implode("\r\n", $headers) . "\r\n\r\n" . $body_text;
    
    // Normalize line endings to CRLF and escape leading dots
    $msg_content = str_replace("\r", "", $msg_content);
    $msg_content = str_replace("\n", "\r\n", $msg_content);
    $msg_content = preg_replace('/^\./m', '..', $msg_content);
    
    // Send data content
    fwrite($socket, $msg_content . "\r\n.\r\n");
    $response = $read_response($socket);
    if (substr($response, 0, 3) !== "250") {
        throw new Exception("Message content rejected: " . trim($response));
    }
    
    // QUIT
    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    
    return true;
}

$success = false;
$error_details = "";

try {
    // Attempt sending via SMTP
    $success = send_smtp_email($smtp_server, $port, $username, $password, $username, $to, $subject, $email_message);
} catch (Exception $e) {
    $error_details = $e->getMessage();
    
    // Fallback to PHP native mail()
    $headers = "From: " . $username . "\r\n" .
               "Reply-To: " . $email . "\r\n" .
               "MIME-Version: 1.0\r\n" .
               "Content-Type: text/plain; charset=UTF-8\r\n" .
               "X-Mailer: PHP/" . phpversion();
               
    if (@mail($to, $subject, $email_message, $headers)) {
        $success = true;
    }
}

if ($success) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Thank you! Your message has been sent successfully."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Could not send message. Please contact us directly at hello@webforme.in",
        "debug" => $error_details
    ]);
}
?>

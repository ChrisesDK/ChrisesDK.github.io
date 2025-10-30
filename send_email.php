<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName = htmlspecialchars($_POST['firstName']);
    $lastName = htmlspecialchars($_POST['lastName']);
  	$organization = htmlspecialchars($_POST['organization']); 
    $email = htmlspecialchars($_POST['email']); 
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    $to = "Christian0603@live.dk"; 
  
    $headers = "From: " . $to . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8";

    $email_subject = $subject;
  
    $email_body = "$firstName $lastName ";

    if (!empty($organization)) {
        $email_body .= "from $organization ";
    }

    $email_body .= "has sent you a message!\n\n".
      			   "$subject\n".
      			   "$message\n\n".
      			   "Send a reply to $email";

    if (mail($to, $email_subject, $email_body, $headers)) {
        echo "success";
    } else {
        echo "error";
    }
}
?>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName = htmlspecialchars($_POST['firstName']);
    $lastName = htmlspecialchars($_POST['lastName']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);
    
    $to = "kontakt@christianrasmussen.dk"; // Din modtager e-mail
    $headers = "From: " . $email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8";

    $email_subject = "Kontaktformular: " . $subject;
    $email_body = "Du har modtaget en ny besked fra din hjemmeside kontaktformular.\n\n".
                  "Detaljer:\n\n".
                  "Fornavn: $firstName\n".
                  "Efternavn: $lastName\n".
                  "Email: $email\n\n".
                  "Besked:\n$message\n";

    if (mail($to, $email_subject, $email_body, $headers)) {
        echo "Beskeden blev sendt!";
    } else {
        echo "Beskeden kunne ikke sendes. Prøv igen senere.";
    }
}
?>

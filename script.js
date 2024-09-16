// Character counter for the message textarea
const messageBox = document.getElementById("message");
const charCount = document.getElementById("charCount");

messageBox.addEventListener("input", function() {
    const currentLength = messageBox.value.length;
    charCount.textContent = `${currentLength}/250`;
});

document.querySelector("button").addEventListener("click", () => {
    let pw = document.getElementById("pw");
    if (pw.type === "password") {
        pw.type = "text";
    } else {
        pw.type = "password";
    }
});

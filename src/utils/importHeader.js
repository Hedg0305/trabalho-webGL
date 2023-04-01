const nav = document.querySelector("#nav__bar");
fetch("../components/navbar.html")
  .then((response) => response.text())
  .then((data) => {
    nav.innerHTML = data;
  });

// ADD THE FONT AWESOME LINK to the head
const fontAwesomeLink = document.createElement("link");
fontAwesomeLink.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css";
fontAwesomeLink.rel = "stylesheet";
fontAwesomeLink.integrity =
  "sha512-SzlrxWUlpfuzQ+pcUCosxcglQRNAq/DZjVsC0lE40xsADsfeQoEypE+enwcOiGjk/bSuGGKHEyjSoQ1zVisanQ==";
fontAwesomeLink.crossOrigin = "anonymous";
fontAwesomeLink.referrerPolicy = "no-referrer";
document.head.appendChild(fontAwesomeLink);

// Import the styles for the navbar
const styles = document.createElement("link");
styles.href = "../styles/navbar.css";
styles.rel = "stylesheet";
document.head.appendChild(styles);

/* formular_zadanie.js – živý náhľad a simulované odoslanie formulára */

const form = document.getElementById("registrationForm");
const layout = document.querySelector(".layout");
const formError = document.getElementById("formError");

// elementy vstupov
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const birthDate = document.getElementById("birthDate");
const course = document.getElementById("course");
const note = document.getElementById("note");
const terms = document.getElementById("terms");
const levelInputs = [
    document.getElementById("levelBeginner"),
    document.getElementById("levelIntermediate"),
    document.getElementById("levelAdvanced")
];

// elementy náhľadu
const pvName = document.getElementById("pvName");
const pvEmail = document.getElementById("pvEmail");
const pvPhone = document.getElementById("pvPhone");
const pvBirth = document.getElementById("pvBirth");
const pvCourse = document.getElementById("pvCourse");
const pvLevel = document.getElementById("pvLevel");
const pvNote = document.getElementById("pvNote");
const pvTerms = document.getElementById("pvTerms");

// zapíše text do náhľadu, prázdna hodnota zobrazí "—"
function setText(element, value, fallback) {
    const text = value.trim();
    element.textContent = text !== "" ? text : fallback;
    element.classList.toggle("empty", text === "");
}

function formatDate(value) {
    if (!value) return "";
    const parts = value.split("-"); // RRRR-MM-DD
    return parts[2] + ". " + parts[1] + ". " + parts[0];
}

function updatePreview() {
    setText(pvName, fullName.value, "—");
    setText(pvEmail, email.value, "—");
    setText(pvPhone, phone.value, "—");
    setText(pvBirth, formatDate(birthDate.value), "—");
    pvCourse.textContent = course.value;

    const selected = levelInputs.find(function (r) { return r.checked; });
    pvLevel.textContent = selected ? selected.value : "—";

    setText(pvNote, note.value, "—");
    pvTerms.textContent = terms.checked ? "Áno" : "Nie";
    pvTerms.classList.toggle("empty", !terms.checked);
}

// sledovanie zmien: input pre písanie, change pre select / radio / checkbox / date
[fullName, email, phone, note].forEach(function (el) {
    el.addEventListener("input", updatePreview);
});
[birthDate, course, terms].concat(levelInputs).forEach(function (el) {
    el.addEventListener("change", updatePreview);
    el.addEventListener("input", updatePreview);
});

updatePreview();

// simulované odoslanie formulára
form.addEventListener("submit", function (event) {
    event.preventDefault(); // žiadne skutočné odoslanie ani obnovenie stránky

    // jednoduchá kontrola povinných polí
    if (fullName.value.trim() === "" || email.value.trim() === "" || !email.checkValidity()) {
        formError.textContent = "Vyplň meno a priezvisko a platný e-mail.";
        formError.hidden = false;
        return;
    }
    if (!terms.checked) {
        formError.textContent = "Musíš súhlasiť s podmienkami.";
        formError.hidden = false;
        return;
    }
    formError.hidden = true;

    // skryje celý formulár
    form.hidden = true;
    form.style.display = "none";
    layout.classList.add("is-sent");

    // alert po prekreslení stránky, aby bol formulár už skrytý
    setTimeout(function () {
        alert("Formulár bol úspešne odoslaný.");
    }, 50);
});
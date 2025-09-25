// app.js — Clean & improved version
const qEl = document.getElementById("question");
const playersEl = document.getElementById("players");

let questions = [];
let people = [];
let lastPair = [];

// helper to get random integer
const randInt = (max) => Math.floor(Math.random() * max);

// pick two distinct random people avoiding last pair
function pickTwo() {
  if (people.length < 2) return [];
  let a = randInt(people.length);
  let b;
  do {
    b = randInt(people.length);
  } while (b === a);
  // avoid repeating same pair in any order
  if (
    lastPair.length &&
    ((lastPair[0] === a && lastPair[1] === b) ||
      (lastPair[0] === b && lastPair[1] === a))
  ) {
    return pickTwo();
  }
  lastPair = [a, b];
  return [people[a], people[b]];
}

// pick a random question
function pickQuestion() {
  if (!questions.length) return "...";
  return questions[randInt(questions.length)];
}

// render question and two cards
function render() {
  const q = pickQuestion();
  qEl.textContent = q;

  const pair = pickTwo();
  if (!pair || pair.length < 2) {
    qEl.textContent = "به اندازهٔ کافی شخص وجود ندارد.";
    return;
  }

  playersEl.innerHTML = "";
  pair.forEach((person, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.innerHTML = `
            <div class="badge">${idx === 0 ? "۱" : "۲"}</div>
            <div class="avatar" style="background-image:url('${
              person.image
            }')"></div>
            <div class="info">
                <div class="name">${person.name}</div>
                <div class="description">${person.description || ""}</div>
            </div>
        `;

    card.addEventListener("click", () => select(idx, card, person));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") select(idx, card, person);
    });

    playersEl.appendChild(card);
  });
}

// handle selection
function select(idx, card, person) {
  document
    .querySelectorAll(".card")
    .forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.left = "12px";
  overlay.style.bottom = "12px";
  overlay.style.padding = "8px 10px";
  overlay.style.borderRadius = "8px";
  overlay.style.background = "rgba(0,0,0,0.65)";
  overlay.style.fontWeight = "700";
  overlay.textContent = `انتخاب شما: ${person.name}`;
  card.appendChild(overlay);

  setTimeout(render, 700);
}

// load JSON files
async function loadData() {
  try {
    const qRes = await fetch("questions.json");
    const pRes = await fetch("people.json");
    if (!qRes.ok || !pRes.ok) throw new Error("Failed to load JSON");

    questions = await qRes.json();
    people = await pRes.json();
    render();
    document.getElementById(
      "count"
    ).innerHTML = `تعداد افراد: ${people.length} <br> تعداد سوال: ${questions.length}`;
  } catch (err) {
    qEl.textContent = "خطا در بارگذاری داده‌ها. با یک سرور HTTP اجرا کنید.";
    console.error(err);
  }
}

// keyboard selection 1/2
window.addEventListener("keydown", (e) => {
  if (e.key === "1" || e.key === "2") {
    const idx = e.key === "1" ? 0 : 1;
    const cards = document.querySelectorAll(".card");
    if (cards[idx]) cards[idx].click();
  }
});

loadData();

/* =========================
   CORE STATE
========================= */

let windows = [];
let windowId = 0;
let topZ = 10;

let currentUser = localStorage.getItem("currentUser");

let users = JSON.parse(localStorage.getItem("users") || `{
  "admin": { "password": "1234", "role": "admin" }
}`);

let disk = JSON.parse(localStorage.getItem("disk") || `{
  "root": { type:"folder", owner:"admin", children:{} }
}`);

let apps = {};

/* =========================
   BOOT SYSTEM
========================= */

let bootLines = [
"Booting Binary Core OS v3...",
"Loading kernel... OK",
"Mounting disk... OK",
"Checking users... OK",
"Starting UI... OK",
"Ready."
];

let i = 0;

function bootSequence() {
    let boot = document.getElementById("boot");
    if (!boot) return;

    if (i < bootLines.length) {
        boot.innerHTML += bootLines[i++] + "<br>";
        setTimeout(bootSequence, 300);
    } else {
        setTimeout(startOS, 400);
    }
}

window.onload = function () {
    setTimeout(bootSequence, 200);
};

/* =========================
   START OS
========================= */

function startOS() {
    let boot = document.getElementById("boot");
    let desktop = document.getElementById("desktop");

    if (!boot || !desktop) return;

    boot.style.display = "none";
    desktop.style.display = "block";

    if (!currentUser) login();
    loadDesktop();
}

/* =========================
   LOGIN SYSTEM
========================= */

function login() {
    let u = prompt("Username:");

    if (!users[u]) {
        let p = prompt("Create password:");
        users[u] = { password: p, role: "user" };
        localStorage.setItem("users", JSON.stringify(users));
    }

    let p = prompt("Password:");

    if (users[u].password !== p) return login();

    currentUser = u;
    localStorage.setItem("currentUser", u);
}

/* =========================
   WINDOW SYSTEM
========================= */

function createWindow(title, content) {
    let id = windowId++;

    let win = document.createElement("div");
    win.className = "window";
    win.style.zIndex = topZ++;

    win.innerHTML = `
        <div class="titlebar">
            ${title}
            <button onclick="closeWindow(${id})">X</button>
        </div>
        <div class="content">${content}</div>
    `;

    document.getElementById("desktop").appendChild(win);

    windows.push({ id, element: win });

    drag(win);
}

function closeWindow(id){
    let w = windows.find(x => x.id === id);
    if (!w) return;

    w.element.remove();
    windows = windows.filter(x => x.id !== id);
}

/* =========================
   DRAG SYSTEM
========================= */

function drag(el){
    let down = false, x, y;

    el.onmousedown = e => {
        down = true;
        x = e.offsetX;
        y = e.offsetY;
    };

    document.onmouseup = () => down = false;

    document.onmousemove = e => {
        if (down){
            el.style.left = (e.pageX - x) + "px";
            el.style.top = (e.pageY - y) + "px";
        }
    };
}

/* =========================
   FILE SYSTEM (BASIC)
========================= */

function saveDisk(){
    localStorage.setItem("disk", JSON.stringify(disk));
}

function renderFiles(){
    let html = "<ul>";

    for (let name in disk.root.children){
        html += `<li>${name}</li>`;
    }

    html += "</ul>";
    return html;
}

/* =========================
   APPS
========================= */

function openTerminal(){
    createWindow("Terminal", "System Ready");
}

function openFiles(){
    createWindow("Files", renderFiles());
}

function openMonitor(){
    createWindow("Monitor",
        "CPU: " + Math.floor(Math.random()*100) + "%<br>" +
        "RAM: " + Math.floor(Math.random()*100) + "%"
    );
}

function openTranslator(){
    createWindow("Translator", `
        <textarea id="t"></textarea>
        <button onclick="translate()">Convert</button>
        <div id="o"></div>
    `);
}

function translate(){
    let t = document.getElementById("t").value;
    document.getElementById("o").innerText = t.toUpperCase();
}

/* =========================
   DESKTOP
========================= */

function loadDesktop(){
    let desktop = document.getElementById("desktop");

    let bar = document.createElement("div");
    bar.id = "topbar";

    bar.innerHTML = `
        <button onclick="openTerminal()">Terminal</button>
        <button onclick="openFiles()">Files</button>
        <button onclick="openMonitor()">Monitor</button>
        <button onclick="openTranslator()">Translator</button>
    `;

    desktop.appendChild(bar);
}

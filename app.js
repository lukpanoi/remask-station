const workflowData = [
  {
    step: "01",
    eyebrow: "RETURN",
    title: "รับหน้ากากกลับเข้าสู่ระบบ",
    description: "ผู้ใช้นำ ReMask ที่ใช้แล้วกลับเข้าสู่สถานีผ่านช่องรับคืนที่แยกจากช่องจ่ายหน้ากากสะอาด",
    list: ["แยกเส้นทางชิ้นใช้แล้วกับชิ้นพร้อมใช้", "เริ่มบันทึกรอบการจัดการใหม่"],
    icon: "i-return",
    visual: "RETURN ZONE",
  },
  {
    step: "02",
    eyebrow: "IDENTIFY",
    title: "ระบุ Mask ID และเรียกประวัติ",
    description: "ระบบอ่าน QR หรือ RFID เพื่อระบุหน้ากากแต่ละชิ้น และเรียกข้อมูลจำนวนรอบ การทำความสะอาด และสถานะ Filter",
    list: ["QR / RFID", "Usage history", "Cleaning history", "Filter status"],
    icon: "i-scan",
    visual: "DIGITAL ID",
  },
  {
    step: "03",
    eyebrow: "PRE-CHECK",
    title: "ตรวจสภาพก่อนเข้ากระบวนการ",
    description: "ตรวจหารอยแตก การฉีกขาด การเสียรูป สายรัด จุดเชื่อมต่อ สถานะ Filter และจำนวนรอบการใช้",
    list: ["Crack / tear", "Shape", "Strap", "Connection", "Critical failure → Gate"],
    icon: "i-search",
    visual: "VISUAL CHECK",
  },
  {
    step: "04",
    eyebrow: "FILTER SEPARATION",
    title: "แยก Filter ออกจาก Facepiece",
    description: "ถอด Filter Cartridge ก่อนนำเฉพาะโครงหน้ากากเข้าสู่กระบวนการทำความสะอาดและลดการปนเปื้อน",
    list: ["ไม่ล้าง Filter โดยตรง", "แยกอายุการใช้งานแต่ละส่วน", "ตรวจชนิดชิ้นส่วน"],
    icon: "i-filter",
    visual: "SEPARATE",
  },
  {
    step: "05",
    eyebrow: "CLEANING & DISINFECTION",
    title: "ทำความสะอาด ลดการปนเปื้อน และทำให้แห้ง",
    description: "วิธี เวลา อุณหภูมิ หรือสารที่ใช้ต้องกำหนดให้เหมาะกับวัสดุ และยืนยันด้วยผลการทดลองจริง",
    list: ["Cleaning", "Disinfection", "Drying", "Process verification"],
    icon: "i-clean",
    visual: "CONTROLLED CYCLE",
  },
  {
    step: "06",
    eyebrow: "POST-CHECK + SCORE",
    title: "ตรวจซ้ำและคำนวณสถานะต้นแบบ",
    description: "ตรวจสภาพหลังจบกระบวนการ แล้วประมวลข้อมูล 4 ด้านเป็น ReMask Readiness Score โดย Safety Gate ยังมีลำดับสูงกว่า",
    list: ["Process 25%", "Physical 25%", "Filter 30%", "Reuse 20%"],
    icon: "i-verify",
    visual: "READINESS SCORE",
  },
  {
    step: "07",
    eyebrow: "DECISION",
    title: "ตัดสินใจแบบมีทางออก 3 สถานะ",
    description: "ระบบแยกหน้ากากเป็น PASS, CHECK หรือ REJECT เพื่อไม่ให้ชิ้นที่มีปัญหาถูกจ่ายกลับโดยอัตโนมัติ",
    list: ["PASS / READY", "CHECK / RE-EVALUATE", "REJECT / REMOVE"],
    icon: "i-decision",
    visual: "3-WAY DECISION",
  },
];

const phaseData = [
  {
    number: "01",
    label: "HARDWARE DESIGN",
    title: "ReMask Facepiece",
    description: "พัฒนาโครงหน้ากากแบบถอดประกอบได้ รองรับตัวกรองแบบเปลี่ยน และออกแบบตำแหน่งสำคัญให้ตรวจสภาพได้ง่าย",
    list: ["โครงหน้ากากถอดประกอบได้", "Filter Cartridge ถอดเปลี่ยนได้", "QR / RFID รายชิ้น", "ออกแบบให้ตรวจรอยเสียหายง่าย"],
    visual: `<div class="blueprint-mask"><span><i></i></span><b></b><b></b><em></em></div><small>CONCEPT / NOT TO SCALE</small>`,
  },
  {
    number: "02",
    label: "STATION PROTOTYPE",
    title: "ReMask Station",
    description: "ประกอบสถานีทดลองที่อ่านตัวตน ตรวจภาพ ควบคุมกลไก และแยกช่องผลลัพธ์ตามสถานะของระบบ",
    list: ["RFID Reader + QR Scanner", "Camera + Sensors", "ESP32 / Controller", "Servo, Display และ 3 Compartments"],
    visual: `<div class="station-blueprint"><span class="sb-screen"></span><span class="sb-slot"></span><span class="sb-scan"></span><i></i><b>RMK STATION</b></div><small>FUNCTIONAL PROTOTYPE</small>`,
  },
  {
    number: "03",
    label: "DATA & SOFTWARE",
    title: "Tracking Software",
    description: "สร้างฐานข้อมูลที่เชื่อม Mask ID กับประวัติการใช้ การทำความสะอาด สถานะตัวกรอง ผลตรวจ คะแนน และคำตัดสิน",
    list: ["Mask Identity", "Usage + Cleaning History", "Inspection Records", "Score + Decision Log"],
    visual: `<div class="data-blueprint"><span>MASK ID</span><i></i><span>HISTORY</span><i></i><span>SCORE</span><i></i><span>DECISION</span></div><small>TRACEABLE DATA FLOW</small>`,
  },
  {
    number: "04",
    label: "TEST & ITERATE",
    title: "Validation",
    description: "ทดสอบวัสดุ สมรรถนะการกรอง ความต้านทานการหายใจ การแนบสนิท และประสิทธิผลของกระบวนการ ก่อนกำหนดเกณฑ์จริง",
    list: ["Material durability", "Filtration + Breathing resistance", "Fit / Seal", "Disinfection effectiveness"],
    visual: `<div class="validation-blueprint"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="42"></circle><path d="m38 61 14 14 31-34"></path></svg><span>TEST</span><span>MEASURE</span><span>ITERATE</span></div><small>EVIDENCE BEFORE CLAIMS</small>`,
  },
];

const masks = [
  { id: "RMK-000101", usage: 5, cleaning: 4, filter: "Replace Soon", physical: "PASS", score: 84, status: "CHECK", updated: "20/05/2025 10:15" },
  { id: "RMK-000102", usage: 2, cleaning: 2, filter: "Good", physical: "PASS", score: 96, status: "PASS", updated: "20/05/2025 10:12" },
  { id: "RMK-000103", usage: 9, cleaning: 8, filter: "Replace", physical: "FAIL", score: null, status: "REJECT", updated: "20/05/2025 10:09" },
  { id: "RMK-000104", usage: 4, cleaning: 4, filter: "Good", physical: "PASS", score: 93, status: "PASS", updated: "20/05/2025 10:05" },
  { id: "RMK-000105", usage: 7, cleaning: 6, filter: "Check", physical: "PASS", score: 78, status: "CHECK", updated: "20/05/2025 10:02" },
];

const navToggle = document.querySelector(".nav-toggle");
const navLinksPanel = document.querySelector(".nav-links");
const navBackdrop = document.querySelector(".nav-backdrop");
const mobileNavQuery = window.matchMedia("(max-width: 1120px)");
const navToggleLabel = document.querySelector(".nav-toggle-label");
let menuOpen = false;

function setMenu(open) {
  menuOpen = Boolean(open && mobileNavQuery.matches);
  navLinksPanel?.classList.toggle("open", menuOpen);
  navBackdrop?.classList.toggle("open", menuOpen);
  document.body.classList.toggle("menu-open", menuOpen);
  document.documentElement.classList.toggle("menu-open", menuOpen);
  navToggle?.setAttribute("aria-expanded", String(menuOpen));
  navToggle?.setAttribute("aria-label", menuOpen ? "ปิดเมนู" : "เปิดเมนู");
  if (navToggleLabel) navToggleLabel.textContent = menuOpen ? "ปิด" : "เมนู";

  if (mobileNavQuery.matches) {
    navLinksPanel?.setAttribute("aria-hidden", String(!menuOpen));
    navLinksPanel?.toggleAttribute("inert", !menuOpen);
  } else {
    navLinksPanel?.removeAttribute("aria-hidden");
    navLinksPanel?.removeAttribute("inert");
  }
}

navToggle?.addEventListener("click", () => setMenu(!menuOpen));
navBackdrop?.addEventListener("click", () => setMenu(false));
navLinksPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuOpen) {
    setMenu(false);
    navToggle?.focus();
  }
});
setMenu(false);

const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress span");
const backTop = document.querySelector(".back-top");

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, percent)}%`;
  header.classList.toggle("scrolled", window.scrollY > 10);
  backTop.classList.toggle("show", window.scrollY > 700);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();
backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -35px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("main section[id]")];
const navAnchors = [...document.querySelectorAll(".nav-links a")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navAnchors.forEach((anchor) => {
      anchor.classList.toggle("active", anchor.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.2, 0.5] },
);
sections.forEach((section) => sectionObserver.observe(section));

const workflowSteps = [...document.querySelectorAll(".workflow-step")];
const detailStep = document.getElementById("detail-step");
const detailEyebrow = document.getElementById("detail-eyebrow");
const detailTitle = document.getElementById("detail-title");
const detailDescription = document.getElementById("detail-description");
const detailList = document.getElementById("detail-list");
const detailVisual = document.getElementById("detail-visual");

function setWorkflowStep(index) {
  const data = workflowData[index];
  workflowSteps.forEach((step, stepIndex) => {
    const active = stepIndex === index;
    step.classList.toggle("active", active);
    step.setAttribute("aria-selected", String(active));
  });
  detailStep.textContent = data.step;
  detailEyebrow.textContent = data.eyebrow;
  detailTitle.textContent = data.title;
  detailDescription.textContent = data.description;
  detailList.innerHTML = data.list.map((item) => `<li>${item}</li>`).join("");
  detailVisual.innerHTML = `<svg><use href="#${data.icon}"></use></svg><span>${data.visual}</span>`;
}

workflowSteps.forEach((step, index) => {
  step.addEventListener("click", () => setWorkflowStep(index));
  step.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
    const nextIndex = (index + direction + workflowSteps.length) % workflowSteps.length;
    workflowSteps[nextIndex].focus();
    setWorkflowStep(nextIndex);
  });
});

const rangeInputs = [...document.querySelectorAll('.score-control input[type="range"]')];
const criticalToggle = document.getElementById("critical-toggle");
const totalScore = document.getElementById("total-score");
const gaugeValue = document.getElementById("gauge-value");
const scoreStatus = document.getElementById("score-status");
const thresholds = [...document.querySelectorAll(".threshold")];
const circumference = 2 * Math.PI * 88;

function getScoreState(score) {
  if (score >= 90) return { key: "pass", label: "PASS / READY", note: "ผ่านเกณฑ์คะแนนของต้นแบบและรอ Safety Gate ขั้นสุดท้าย", color: "#2e9d62" };
  if (score >= 70) return { key: "check", label: "CHECK", note: "ควรตรวจเพิ่มหรือเปลี่ยนชิ้นส่วนที่กำหนด", color: "#e89517" };
  return { key: "reject", label: "REJECT", note: "นำชิ้นนี้ออกจากวงจรการใช้งาน", color: "#d94b4b" };
}

function updateScore() {
  let sum = 0;
  rangeInputs.forEach((input) => {
    const value = Number(input.value);
    const weight = Number(input.dataset.weight);
    sum += value * weight;
    input.style.setProperty("--range-progress", `${value}%`);
    const output = document.getElementById(input.id.replace("-score", "-output"));
    if (output) output.value = value;
  });

  const rounded = Math.round(sum);
  const isCritical = criticalToggle.checked;
  const state = getScoreState(rounded);
  const activeKey = isCritical ? null : state.key;

  totalScore.textContent = isCritical ? "—" : rounded;
  gaugeValue.style.strokeDasharray = String(circumference);
  gaugeValue.style.strokeDashoffset = String(isCritical ? circumference : circumference * (1 - rounded / 100));
  gaugeValue.style.stroke = isCritical ? "#d94b4b" : state.color;
  scoreStatus.className = `score-status ${isCritical ? "reject" : state.key}`;
  scoreStatus.innerHTML = isCritical
    ? `<i></i><span>Safety Gate ทำงาน</span><strong>CHECK / REJECT</strong><small>พบ Critical Failure จึงไม่นำคะแนนส่วนอื่นมาชดเชย</small>`
    : `<i></i><span>สถานะของต้นแบบ</span><strong>${state.label}</strong><small>${state.note}</small>`;
  thresholds.forEach((threshold) => threshold.classList.toggle("active", threshold.classList.contains(activeKey)));
}

rangeInputs.forEach((input) => input.addEventListener("input", updateScore));
criticalToggle.addEventListener("change", updateScore);
updateScore();

const tableBody = document.getElementById("mask-table-body");
const maskSearch = document.getElementById("mask-search");
const emptyTable = document.getElementById("empty-table");
let selectedMaskId = masks[0].id;

function renderMaskTable(filter = "") {
  const query = filter.trim().toLowerCase();
  const filtered = masks.filter((mask) => mask.id.toLowerCase().includes(query));
  tableBody.innerHTML = filtered
    .map(
      (mask) => `<tr data-mask-id="${mask.id}" class="${mask.id === selectedMaskId ? "selected" : ""}" tabindex="0">
        <td><strong>${mask.id}</strong></td>
        <td>${mask.usage}</td>
        <td>${mask.filter}</td>
        <td>${mask.score ?? "—"}</td>
        <td><span class="table-status ${mask.status.toLowerCase()}"><i></i>${mask.status}</span></td>
        <td>${mask.updated}</td>
      </tr>`,
    )
    .join("");
  emptyTable.classList.toggle("show", filtered.length === 0);

  tableBody.querySelectorAll("tr").forEach((row) => {
    const select = () => selectMask(row.dataset.maskId);
    row.addEventListener("click", select);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });
}

function selectMask(id) {
  const mask = masks.find((item) => item.id === id);
  if (!mask) return;
  selectedMaskId = id;
  document.getElementById("selected-id").textContent = mask.id;
  document.getElementById("selected-usage").textContent = mask.usage;
  document.getElementById("selected-cleaning").textContent = mask.cleaning;
  document.getElementById("selected-filter").textContent = mask.filter;
  document.getElementById("selected-physical").textContent = mask.physical;
  document.getElementById("selected-score").textContent = mask.score ?? "—";
  const selectedStatus = document.getElementById("selected-status");
  selectedStatus.className = `selected-status ${mask.status.toLowerCase()}`;
  selectedStatus.innerHTML = `<i></i><b>${mask.status}</b>`;
  renderMaskTable(maskSearch.value);
}

maskSearch.addEventListener("input", (event) => renderMaskTable(event.target.value));
renderMaskTable();
selectMask(masks[0].id);

const phaseTabs = [...document.querySelectorAll(".prototype-tab")];
const phaseNumber = document.querySelector(".phase-number span");
const phaseLabel = document.querySelector(".phase-copy .mini-label");
const phaseTitle = document.getElementById("phase-title");
const phaseDescription = document.getElementById("phase-description");
const phaseList = document.getElementById("phase-list");
const phaseVisual = document.getElementById("phase-visual");

function setPhase(index) {
  const phase = phaseData[index];
  phaseTabs.forEach((tab, tabIndex) => tab.classList.toggle("active", tabIndex === index));
  phaseNumber.textContent = phase.number;
  phaseLabel.textContent = phase.label;
  phaseTitle.textContent = phase.title;
  phaseDescription.textContent = phase.description;
  phaseList.innerHTML = phase.list.map((item) => `<li>${item}</li>`).join("");
  phaseVisual.innerHTML = phase.visual;
}

phaseTabs.forEach((tab, index) => tab.addEventListener("click", () => setPhase(index)));

const validationInputs = [...document.querySelectorAll('#validation-list input[type="checkbox"]')];
const validationBar = document.getElementById("validation-progress");
const validationCount = document.getElementById("validation-count");

function updateValidation() {
  const checked = validationInputs.filter((input) => input.checked).length;
  validationBar.style.width = `${(checked / validationInputs.length) * 100}%`;
  validationCount.textContent = `${checked} / ${validationInputs.length}`;
}

validationInputs.forEach((input) => input.addEventListener("change", updateValidation));
updateValidation();

mobileNavQuery.addEventListener("change", () => setMenu(false));

// =========================================================================
// 1. MOBILE DRAWER NAVIGATION
// =========================================================================
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const btn = document.getElementById('mobile-menu-btn');
  const openSvg = document.getElementById('menu-open-svg');
  const closeSvg = document.getElementById('menu-close-svg');
  const isOpen = drawer.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
  openSvg.style.display = isOpen ? 'none' : 'block';
  closeSvg.style.display = isOpen ? 'block' : 'none';
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const btn = document.getElementById('mobile-menu-btn');
  drawer.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  document.getElementById('menu-open-svg').style.display = 'block';
  document.getElementById('menu-close-svg').style.display = 'none';
}

// =========================================================================
// 2. CLEARANCE XP & RANK SYSTEM
// =========================================================================
let xpTotal = 0;
const unlockedBadges = new Set();

function awardXp(pts, key, message) {
  if (key && unlockedBadges.has(key)) return;
  if (key) unlockedBadges.add(key);

  xpTotal = Math.min(600, xpTotal + pts);
  let rank = 'RECON GUEST';
  if (xpTotal >= 400) rank = 'LEAD FORENSIC INVESTIGATOR';
  else if (xpTotal >= 220) rank = 'INCIDENT RESPONDER';
  else if (xpTotal >= 80) rank = 'JUNIOR ANALYST';

  document.getElementById('rank-title').textContent = 'RANK: ' + rank;
  document.getElementById('rank-xp').textContent = xpTotal + ' XP';
  document.getElementById('lab-xp-display').textContent = xpTotal + ' / 600 XP';

  if (message) showToast('+' + pts + ' XP — ' + message);
}

// =========================================================================
// 3. WEB AUDIO SYNTHESIZER (ENABLED BY DEFAULT)
// =========================================================================
let sfxOn = true;
let audioCtx = null;

function toggleSfx() {
  sfxOn = !sfxOn;
  const offIcon = document.getElementById('sfx-off-icon');
  const onIcon = document.getElementById('sfx-on-icon');
  const text = document.getElementById('sfx-text');
  const btn = document.getElementById('sfx-btn');

  if (sfxOn) {
    offIcon.style.display = 'none';
    onIcon.style.display = 'block';
    text.textContent = 'SFX: ON';
    btn.classList.add('active-cyan');
    playTone('success');
    showToast('Cyber Synth Audio enabled.');
  } else {
    offIcon.style.display = 'block';
    onIcon.style.display = 'none';
    text.textContent = 'SFX: OFF';
    btn.classList.remove('active-cyan');
  }
}

function playTone(kind) {
  if (!sfxOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;

    if (kind === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (kind === 'blip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1280, t + 0.08);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (kind === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, t);
      osc.frequency.setValueAtTime(659, t + 0.07);
      osc.frequency.setValueAtTime(784, t + 0.14);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.start(t);
      osc.stop(t + 0.24);
    } else if (kind === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.linearRampToValueAtTime(125, t + 0.16);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  } catch (err) {}
}

// =========================================================================
// 4. DEFCON SWITCHER & MATRIX RAIN
// =========================================================================
let defconState = 1;
let matrixInterval = null;

function cycleDefcon() {
  if (defconState === 5) setDefcon(3);
  else if (defconState === 3) setDefcon(1);
  else setDefcon(5);
}

function setDefcon(lvl) {
  defconState = lvl;
  document.body.classList.remove('defcon-3', 'defcon-1');
  const btn = document.getElementById('defcon-btn');

  if (lvl === 5) {
    clearInterval(matrixInterval);
    btn.textContent = 'DEFCON 5 (NORMAL)';
    btn.className = 'ctrl-pill defcon-btn-5';
    playTone('click');
  } else if (lvl === 3) {
    clearInterval(matrixInterval);
    document.body.classList.add('defcon-3');
    btn.textContent = 'DEFCON 3 (ELEVATED)';
    btn.className = 'ctrl-pill defcon-btn-3';
    playTone('blip');
    showToast('DEFCON 3: Elevated Forensic Watch engaged.');
  } else if (lvl === 1) {
    document.body.classList.add('defcon-1');
    btn.textContent = 'DEFCON 1 (RED ALERT)';
    btn.className = 'ctrl-pill defcon-btn-1';
    startMatrix();
    playTone('alert');
    showToast('DEFCON 1: Red Alert active — Matrix telemetry online!');
  }
}

function startMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const chars = '01KABIRAJUELDFIR9A8F#%&';
  const size = 14;
  const cols = Math.floor(canvas.width / size);
  const drops = Array(cols).fill(1);

  clearInterval(matrixInterval);
  matrixInterval = setInterval(() => {
    ctx.fillStyle = 'rgba(11, 6, 9, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#EF4444';
    ctx.font = size + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * size, drops[i] * size);
      if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 50);
}

// =========================================================================
// 5. HEX_MODE & HERO SCRAMBLE ANIMATION
// =========================================================================
function toggleHexMode() {
  const on = document.body.classList.toggle('hex-mode');
  const btn = document.getElementById('hex-btn');
  btn.classList.toggle('active-amber', on);
  playTone('blip');
  showToast(on ? 'HEX_MODE ON: Memory offsets revealed.' : 'HEX_MODE OFF');
}

function scrambleHeroName(el, silent) {
  if (!el || el.dataset.busy === '1') return;
  el.dataset.busy = '1';
  const orig = el.dataset.original;
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&';
  let iter = 0;
  if (!silent) playTone('blip');
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((ch, idx) => {
      if (ch === ' ') return ' ';
      if (idx < iter) return orig[idx];
      return pool[Math.floor(Math.random() * pool.length)];
    }).join('');
    if (iter >= orig.length) {
      clearInterval(iv);
      el.textContent = orig;
      el.dataset.busy = '0';
    }
    iter += 0.5;
  }, 28);
}

// =========================================================================
// 6. INTERACTIVE CLI TERMINAL
// =========================================================================
const historyList = [];
let historyPos = -1;

const commands = {
  help: () =>
    '<div style="color:var(--accent-cyan);font-weight:700;">Available Workstation Commands:</div>' +
    '<div style="color:var(--text-body);">' +
    '<div><span style="color:var(--accent-emerald);">whoami</span> &mdash; Candidate identity &amp; UEL MSc status</div>' +
    '<div><span style="color:var(--accent-emerald);">neofetch</span> &mdash; ASCII shield &amp; system specs</div>' +
    '<div><span style="color:var(--accent-emerald);">ls evidence/</span> &mdash; List cataloged case artifacts</div>' +
    '<div><span style="color:var(--accent-emerald);">cat education.log</span> &mdash; Academic progression log</div>' +
    '<div><span style="color:var(--accent-emerald);">verify --cert</span> &mdash; Verify Python 3 Credential ID</div>' +
    '<div><span style="color:var(--accent-emerald);">scan</span> &mdash; Run local port &amp; posture audit</div>' +
    '<div><span style="color:var(--accent-crimson);">hack</span> &mdash; Trigger DEFCON 1 Red Alert</div>' +
    '<div><span style="color:var(--accent-amber);">coffee</span> &mdash; Brew late-night DFIR espresso</div>' +
    '<div><span style="color:var(--accent-emerald);">sudo hire kabiraj</span> &mdash; Executive recruitment handshake</div>' +
    '</div>',
  whoami: () =>
    '<div style="color:#FFF;font-weight:700;">NAME: Kabiraj Sapkota</div>' +
    '<div>PROGRAM: MSc Information Security and Digital Forensics (2026/09 &ndash; Present)</div>' +
    '<div>INSTITUTION: University of East London (London, UK)</div>' +
    '<div>ORIGIN: Kathmandu, Nepal (BIT, Texas College of Management and IT)</div>' +
    '<div>CONTACT: <span style="color:var(--accent-cyan);">contact@kabiraj.dev</span></div>' +
    '<div style="color:var(--accent-emerald);">CORE STACK: Python, Django, React, JS, SQL, DFIR, Incident Response</div>',
  neofetch: () =>
    '<pre style="font-size:10px;line-height:1.25;color:var(--accent-cyan);">' +
    '   .--------.      kabiraj@fun-forensics\n' +
    '  / .------. \\     ---------------------\n' +
    ' | |  [KS]  | |    Host: UEL London, UK (MSc ISDF)\n' +
    '_| |________| |_   Origin: Kathmandu, Nepal\n' +
    '\'.__  | DFIR |  __.\' Stack: Python / Django / React / DFIR\n' +
    '    \'.____.\'       Cert ID: 1752129201709 (Verified)</pre>',
  'ls evidence/': () =>
    '<div style="color:var(--text-muted);">total 4 forensic case artifacts:</div>' +
    '<div style="color:var(--accent-cyan);">EVD-001  Placement_Management_System  [Python, Django, JS, SQL]</div>' +
    '<div style="color:var(--accent-cyan);">EVD-002  Portfolio_Security_Node      [www.kabiraj.dev, DNS/SSL]</div>' +
    '<div style="color:var(--accent-cyan);">EVD-003  Student_Management_System    [Python, Django, HTML/CSS]</div>' +
    '<div style="color:var(--accent-cyan);">EVD-004  Smart_Meter_IoT_Prototype    [Embedded IoT, Telemetry]</div>',
  'cat education.log': () =>
    '<div style="color:var(--accent-emerald);">[2026/09 - Present] MSc Information Security and Digital Forensics &mdash; University of East London (London, UK)</div>' +
    '<div>[2021 - 2024]       Bachelor\'s in Information Technology (BIT) &mdash; Texas College of Management and IT (Kathmandu)</div>',
  'verify --cert': () =>
    '<div style="color:var(--accent-emerald);">[VERIFIED] Python 3 Certificate &mdash; Programming Hub (2025/06 &ndash; 2025/07)</div>' +
    '<div>Credential ID: <strong style="color:var(--accent-cyan);">1752129201709</strong></div>' +
    '<div>[COMPLETED] Python with Django &mdash; Texas Imaginology (2022 &ndash; 2022/09)</div>',
  scan: () =>
    '<div style="color:var(--accent-amber);">[NMAP] Probing kabiraj@uel-forensics (London UK)...</div>' +
    '<div style="color:var(--accent-emerald);">22/tcp   open  ssh-ed25519      Key-Only Auth</div>' +
    '<div style="color:var(--accent-emerald);">443/tcp  open  https-portfolio  www.kabiraj.dev (TLS 1.3)</div>' +
    '<div style="color:var(--accent-emerald);">8080/tcp open  dfir-toolkit     Volatility / Autopsy / Wireshark</div>' +
    '<div style="color:var(--accent-cyan);">[OK] 0 vulnerabilities detected. Ready for SOC / DFIR deployment.</div>',
  hack: () => {
    setDefcon(1);
    return '<div style="color:var(--accent-crimson);font-weight:700;">[RED ALERT] DEFCON 1 ENGAGED &mdash; MATRIX TELEMETRY ACTIVE!</div>' +
      '<div>Run <span style="color:var(--accent-emerald);">defcon 5</span> or click the top DEFCON button to restore normal posture.</div>';
  },
  'defcon 5': () => {
    setDefcon(5);
    return '<div style="color:var(--accent-emerald);">[OK] Posture restored to DEFCON 5 (NORMAL).</div>';
  },
  coffee: () => {
    awardXp(30, 'cli_coffee', 'Brewed DFIR Espresso');
    return '<div style="color:var(--accent-amber);">[BREW COMPLETE] Double Espresso + PCAP Stream loaded.</div>';
  },
  'sudo hire kabiraj': () => {
    awardXp(100, 'cli_hire', 'Executive Recruitment Handshake');
    return '<div style="color:var(--accent-emerald);font-weight:700;">[sudo] authentication verified &mdash; ACCESS GRANTED!</div>' +
      '<div>Available in London, UK for Cybersecurity, SOC, DFIR, and Python Engineering roles.</div>' +
      '<div style="color:var(--accent-cyan);">Direct dispatch: contact@kabiraj.dev</div>';
  }
};

function runTerminalCmd(raw) {
  const out = document.getElementById('terminal-output');
  const trimmed = raw.trim();
  if (!trimmed) return;
  const lower = trimmed.toLowerCase();

  historyList.push(trimmed);
  historyPos = historyList.length;
  playTone('click');
  awardXp(40, 'cli_used', 'Executed Forensic Shell Command');

  if (lower === 'clear') {
    out.innerHTML = '<div style="color:var(--text-muted);">[BUFFER CLEARED] Type <span style="color:var(--accent-cyan);">help</span> to list commands.</div>';
    return;
  }

  const cmdDiv = document.createElement('div');
  cmdDiv.innerHTML = '<span style="color:var(--accent-emerald);font-weight:700;">kabiraj@uel:~#</span> <span style="color:#FFF;">' + escapeHtml(trimmed) + '</span>';
  out.appendChild(cmdDiv);

  const resDiv = document.createElement('div');
  resDiv.style.paddingLeft = '10px';
  resDiv.style.borderLeft = '2px solid rgba(56,189,248,0.35)';
  resDiv.innerHTML = commands[lower]
    ? commands[lower]()
    : '<div style="color:var(--accent-amber);">zsh: command not found: ' + escapeHtml(trimmed) + '. Type <span style="color:var(--accent-cyan);">help</span>.</div>';
  out.appendChild(resDiv);
  out.scrollTop = out.scrollHeight;
}

document.getElementById('terminal-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const inp = document.getElementById('terminal-input');
  runTerminalCmd(inp.value);
  inp.value = '';
});

document.getElementById('terminal-input').addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' && historyList.length > 0) {
    e.preventDefault();
    historyPos = Math.max(0, historyPos - 1);
    this.value = historyList[historyPos];
  } else if (e.key === 'ArrowDown' && historyList.length > 0) {
    e.preventDefault();
    historyPos = Math.min(historyList.length, historyPos + 1);
    this.value = historyPos === historyList.length ? '' : historyList[historyPos];
  }
});

// =========================================================================
// 7. EVIDENCE LOCKER
// =========================================================================
const evidenceItems = [
  {
    id: 'EVD-001',
    offset: '0x0110',
    title: 'Placement Management System',
    period: '2023/06 – 2023/08',
    cat: 'WEB',
    mitre: 'T1078 // RBAC & AUTH HARDENING',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    desc: 'Full-stack university placement portal built with Python, Django, JavaScript, HTML/CSS, and SQL to automate student-recruiter matching, job postings, and application tracking.',
    notes: [
      'Enforced Role-Based Access Control (RBAC) separating student, recruiter, and administrator endpoints.',
      'Utilized Django ORM parameterized queries to eliminate SQL Injection (SQLi) vulnerabilities.',
      'Applied CSRF tokens and hardened session cookie attributes across login and submission forms.'
    ],
    stack: ['Python', 'Django', 'JavaScript', 'HTML/CSS', 'SQL'],
    url: 'https://github.com/kulfinnit'
  },
  {
    id: 'EVD-002',
    offset: '0x0240',
    title: 'Personal Security & Dev Portfolio (www.kabiraj.dev)',
    period: '2025/06 – 2025/07',
    cat: 'WEB',
    mitre: 'T1590 // EDGE & TLS HARDENING',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    desc: 'Custom domain web deployment (www.kabiraj.dev) engineered with HTML5, CSS3, JavaScript, and Cloudflare DNS/SSL edge protection with interactive telemetry.',
    notes: [
      'Enforced HTTPS/TLS 1.3 via Cloudflare edge certificates and strict DNS integrity records.',
      'Zero external runtime script dependencies to minimize client-side supply-chain risk.',
      'Designed responsive dark-mode workstation telemetry and accessible UI components.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Cloudflare DNS/SSL'],
    url: 'https://www.kabiraj.dev'
  },
  {
    id: 'EVD-003',
    offset: '0x0380',
    title: 'Student Management System',
    period: '2022/04 – 2022/06',
    cat: 'SYSTEMS',
    mitre: 'T1565 // DATA INTEGRITY & AUDIT',
    sha256: '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451',
    desc: 'Academic lifecycle and relational record management system engineered with Python, Django, HTML, and CSS to track student enrollment, attendance, and administrative state transitions.',
    notes: [
      'Normalized relational database schema preventing orphan records and unauthorized privilege escalation.',
      'Server-side input validation and output escaping to mitigate Stored XSS payloads.',
      'Structured administrative audit trail for academic record updates.'
    ],
    stack: ['Python', 'Django', 'HTML', 'CSS', 'SQL'],
    url: 'https://github.com/kulfinnit'
  },
  {
    id: 'EVD-004',
    offset: '0x04C0',
    title: 'Smart Meter IoT Telemetry Prototype',
    period: '2022',
    cat: 'IOT',
    mitre: 'T0830 // ICS & TELEMETRY INTEGRITY',
    sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    desc: 'Embedded IoT smart energy metering prototype capturing real-time utility consumption metrics and transmitting sensor telemetry for automated monitoring.',
    notes: [
      'Evaluated hardware-to-cloud packet transmission integrity and anomaly threshold alerting.',
      'Analyzed sensor spoofing risks and firmware telemetry logging for ICS/IoT forensics.',
      'Bridged physical sensor instrumentation with structured digital telemetry pipelines.'
    ],
    stack: ['Embedded IoT', 'Sensors', 'Telemetry'],
    url: 'https://github.com/kulfinnit'
  }
];

function renderEvidence(cat) {
  const grid = document.getElementById('evidence-grid');
  const filtered = cat === 'ALL' ? evidenceItems : evidenceItems.filter(i => i.cat === cat);

  grid.innerHTML = filtered.map(evd => `
    <article class="card evd-card">
      <div>
        <div class="evd-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="evd-id-badge">${evd.id}</span>
            <span class="hex-meta">${evd.offset}</span>
            <span style="color:var(--text-muted);">${evd.period}</span>
          </div>
          <span class="tag-chip">${evd.mitre}</span>
        </div>

        <h3 class="evd-title">${evd.title}</h3>
        <p class="evd-desc">${evd.desc}</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="sha-strip">
          <div class="sha-text">
            <span>SHA-256: </span>
            <span id="sha-txt-${evd.id}">${evd.sha256.slice(0, 22)}...</span>
          </div>
          <button type="button" id="sha-btn-${evd.id}" class="sha-btn" onclick="verifySingleSha('${evd.id}', '${evd.sha256}')">
            VERIFY / COPY
          </button>
        </div>

        <div class="evd-footer">
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${evd.stack.map(s => `<span class="tag-chip">${s}</span>`).join('')}
          </div>
          <button type="button" class="btn-secondary" style="padding:7px 12px;font-size:11px;border-color:rgba(56,189,248,0.4);color:var(--accent-cyan);" onclick="openModal('${evd.id}')">
            Inspect Artifact &nearr;
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function filterEvidence(cat, btn) {
  playTone('click');
  btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderEvidence(cat);
}

function verifySingleSha(id, hash, silent) {
  const txt = document.getElementById('sha-txt-' + id);
  const btn = document.getElementById('sha-btn-' + id);
  if (txt) {
    txt.textContent = hash.slice(0, 22) + '... [VERIFIED]';
    txt.style.color = 'var(--accent-emerald)';
  }
  if (btn) btn.textContent = 'INTACT ✓';
  if (!silent) {
    playTone('blip');
    copyText(hash, id + ' SHA-256 verified & copied!');
  }
}

function verifyAllHashes() {
  evidenceItems.forEach(item => verifySingleSha(item.id, item.sha256, true));
  playTone('success');
  awardXp(50, 'sha_all', 'Verified All 4 Evidence SHA-256 Hashes');
  showToast('All 4 Evidence Locker SHA-256 hashes verified intact!');
}

function openModal(id) {
  const evd = evidenceItems.find(i => i.id === id);
  if (!evd) return;
  playTone('click');
  document.getElementById('modal-id').textContent = evd.id;
  document.getElementById('modal-mitre').textContent = evd.mitre;
  document.getElementById('modal-period').textContent = 'TIMELINE: ' + evd.period + ' // CATEGORY: ' + evd.cat;
  document.getElementById('modal-title').textContent = evd.title;
  document.getElementById('modal-desc').textContent = evd.desc;
  document.getElementById('modal-sha').textContent = evd.sha256;
  document.getElementById('modal-url').href = evd.url;
  document.getElementById('modal-notes').innerHTML = evd.notes.map(n => '<li>' + n + '</li>').join('');
  document.getElementById('modal-stack').innerHTML = evd.stack.map(s => '<span class="tag-chip">' + s + '</span>').join('');
  document.getElementById('artifact-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('artifact-modal').classList.remove('open');
}

// =========================================================================
// 8. CYBER LAB MODULE A: FIREWALL DEFENDER
// =========================================================================
let fwRunning = false;
let fwClock = null;
let fwSpawner = null;
let fwSeconds = 20;
let fwPts = 0;
let fwBest = 0;
let fwHp = 100;

function startFirewallBlitz() {
  if (fwRunning) return;
  fwRunning = true;
  fwSeconds = 20;
  fwPts = 0;
  fwHp = 100;

  document.getElementById('fw-timer').textContent = '20s';
  document.getElementById('fw-score').textContent = '0';
  document.getElementById('fw-integrity-text').textContent = '100%';
  const bar = document.getElementById('fw-integrity-bar');
  bar.style.width = '100%';
  bar.style.background = 'var(--accent-emerald)';
  document.getElementById('fw-overlay').classList.add('hidden');
  document.getElementById('fw-packets').innerHTML = '';
  const fwState = document.getElementById('fw-footer-state');
  const fwNote = document.getElementById('fw-footer-note');
  if (fwState) {
    fwState.textContent = 'ACTIVE_DEFENSE';
    fwState.style.color = 'var(--accent-emerald)';
  }
  if (fwNote) fwNote.textContent = 'Wave active! Click red SQLi/XSS/RANSOM packets before CORE_SRV impact.';
  playTone('success');

  fwClock = setInterval(() => {
    fwSeconds--;
    document.getElementById('fw-timer').textContent = fwSeconds + 's';
    if (fwSeconds <= 0) endFirewallBlitz(true);
  }, 1000);

  spawnPacket();
  fwSpawner = setInterval(spawnPacket, 780);
}

function spawnPacket() {
  if (!fwRunning) return;
  const stage = document.getElementById('fw-packets');
  const badList = ["SQLi ' OR 1=1", "XSS <script>", "RANSOM.EXE", "PHISH.PDF"];
  const goodList = ["HTTPS:443", "SSH:22", "PGP_KEY"];
  const isBad = Math.random() < 0.65;
  const label = isBad
    ? badList[Math.floor(Math.random() * badList.length)]
    : goodList[Math.floor(Math.random() * goodList.length)];

  const lanes = [12, 36, 60, 82];
  const laneTop = lanes[Math.floor(Math.random() * lanes.length)];

  const pkt = document.createElement('button');
  pkt.type = 'button';
  pkt.style.position = 'absolute';
  pkt.style.top = laneTop + '%';
  pkt.style.transform = 'translateY(-50%)';
  pkt.style.left = '6px';
  pkt.style.padding = '4px 9px';
  pkt.style.borderRadius = '6px';
  pkt.style.fontFamily = 'var(--font-mono)';
  pkt.style.fontSize = '10px';
  pkt.style.fontWeight = '700';
  pkt.style.whiteSpace = 'nowrap';
  pkt.style.cursor = 'pointer';
  pkt.style.background = isBad ? 'rgba(239,68,68,0.22)' : 'rgba(16,185,129,0.2)';
  pkt.style.border = isBad ? '1px solid #EF4444' : '1px solid #10B981';
  pkt.style.color = isBad ? '#FCA5A5' : '#6EE7B7';
  pkt.textContent = (isBad ? '⚠ ' : '✓ ') + label;

  let posX = 6;
  const limitX = (stage.offsetWidth || 300) - 46;
  const vel = 2.4 + Math.random() * 1.4;

  const mover = setInterval(() => {
    if (!fwRunning) {
      clearInterval(mover);
      return;
    }
    posX += vel;
    pkt.style.left = posX + 'px';

    if (posX >= limitX) {
      clearInterval(mover);
      pkt.remove();
      if (isBad) {
        fwHp = Math.max(0, fwHp - 25);
        document.getElementById('fw-integrity-text').textContent = fwHp + '%';
        const bar = document.getElementById('fw-integrity-bar');
        bar.style.width = fwHp + '%';
        if (fwHp <= 50) bar.style.background = 'var(--accent-amber)';
        if (fwHp <= 25) bar.style.background = 'var(--accent-crimson)';
        playTone('alert');
        if (fwHp <= 0) endFirewallBlitz(false);
      } else {
        fwPts += 25;
        document.getElementById('fw-score').textContent = fwPts;
      }
    }
  }, 22);

  pkt.onclick = function() {
    if (!fwRunning) return;
    clearInterval(mover);
    pkt.remove();
    if (isBad) {
      fwPts += 100;
      document.getElementById('fw-score').textContent = fwPts;
      playTone('blip');
    } else {
      fwPts = Math.max(0, fwPts - 25);
      document.getElementById('fw-score').textContent = fwPts;
      playTone('alert');
      showToast('Blocked safe traffic (-25 pts).');
    }
  };

  stage.appendChild(pkt);
}

function endFirewallBlitz(won) {
  fwRunning = false;
  clearInterval(fwClock);
  clearInterval(fwSpawner);
  document.getElementById('fw-packets').innerHTML = '';

  if (fwPts > fwBest) {
    fwBest = fwPts;
    document.getElementById('fw-highscore').textContent = fwBest;
  }

  const overlay = document.getElementById('fw-overlay');
  const msg = document.getElementById('fw-status-msg');
  const fwState = document.getElementById('fw-footer-state');
  const fwNote = document.getElementById('fw-footer-note');
  document.getElementById('fw-start-btn').textContent = 'Replay Wave';
  overlay.classList.remove('hidden');

  if (won) {
    msg.innerHTML = '<span style="color:var(--accent-emerald);font-weight:700;">UEL-CORE-SRV PROTECTED!</span> Score: <strong style="color:#FFF;">' + fwPts + '</strong>';
    if (fwState) {
      fwState.textContent = 'PERIMETER_INTACT';
      fwState.style.color = 'var(--accent-emerald)';
    }
    if (fwNote) fwNote.textContent = 'Wave neutralized with ' + fwHp + '% integrity remaining.';
    playTone('success');
    awardXp(150, 'fw_survived', 'Defended UEL-CORE-SRV Perimeter');
  } else {
    msg.innerHTML = '<span style="color:var(--accent-crimson);font-weight:700;">FIREWALL BREACHED!</span> Score: <strong style="color:#FFF;">' + fwPts + '</strong>';
    if (fwState) {
      fwState.textContent = 'BREACH_DETECTED';
      fwState.style.color = 'var(--accent-crimson)';
    }
    if (fwNote) fwNote.textContent = 'Hostile payloads penetrated CORE_SRV. Click Replay Wave to re-engage.';
    playTone('alert');
  }
}

// =========================================================================
// 9. CYBER LAB MODULE B: RAW DISK SECTOR CARVER
// =========================================================================
const sectorPayloads = {
  '0x04A0': '[0x04A0] MSc Information Security & Digital Forensics — University of East London (Enrolled Sept 2026, London, UK).',
  '0x1F2C': '[0x1F2C] Origin Log: Kathmandu, Nepal -> London, UK. Full-stack Python/Django developer & IT Officer transitioning to DFIR.',
  '0x4C80': '[0x4C80] Verified Credential Artifact: Python 3 Certificate (Programming Hub) — Credential ID: 1752129201709.',
  '0x88B1': '[0x88B1] SECRET CARVED FLAG: CTF{k4b1r4j_df1r_m4st3r_2026} — Unallocated cluster reconstructed intact!'
};
const carvedDone = new Set();

function buildSectorGrid() {
  const grid = document.getElementById('sector-grid');
  const offsets = Object.keys(sectorPayloads);
  let idx = 0;
  const html = [];
  for (let i = 0; i < 32; i++) {
    if (i === 5 || i === 11 || i === 18 || i === 27) {
      const off = offsets[idx++];
      html.push('<button type="button" class="sector-cell sector-anomaly" onclick="carveSector(\'' + off + '\', this)">' + off + '</button>');
    } else {
      const addr = '0x' + (i * 0x0420).toString(16).toUpperCase().padStart(4, '0');
      html.push('<div class="sector-cell">' + addr + '</div>');
    }
  }
  grid.innerHTML = html.join('');
}

function carveSector(offset, btn) {
  playTone('blip');
  document.getElementById('carved-sector-id').textContent = 'OFFSET ' + offset;
  const out = document.getElementById('carved-output-text');
  out.textContent = sectorPayloads[offset];
  out.style.color = 'var(--accent-emerald)';

  if (!carvedDone.has(offset)) {
    carvedDone.add(offset);
    document.getElementById('carver-progress').textContent = carvedDone.size + ' / 4 CARVED';
    btn.classList.remove('sector-anomaly');
    btn.classList.add('sector-carved');
    awardXp(55, 'carve_' + offset, 'Carved Disk Sector ' + offset);
  }
}

// =========================================================================
// 10. CYBER LAB MODULE C: PACKET CIPHER SANDBOX
// =========================================================================
const packetB64 = 'RkxBR3tVRUxfREZJUl9MT05ET05fMjAyNn0=';
let rot13Active = false;

function runBase64Helper() {
  const decoded = atob(packetB64);
  document.getElementById('flag-input').value = decoded;
  const preview = document.getElementById('cipher-preview-text');
  if (preview) {
    preview.textContent = decoded;
    preview.style.color = 'var(--accent-emerald)';
  }
  playTone('blip');
  showToast('Base64 Decoded: ' + decoded);
}

function runRot13Helper() {
  const el = document.getElementById('cipher-payload-display');
  const preview = document.getElementById('cipher-preview-text');
  rot13Active = !rot13Active;
  const shifted = packetB64.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
  el.textContent = rot13Active ? shifted : packetB64;
  if (preview) {
    preview.textContent = rot13Active ? '[ROT13_APPLIED] ' + shifted : '[BASE64_RAW_RESTORED]';
    preview.style.color = 'var(--accent-amber)';
  }
  playTone('click');
}

function resetCipherSandbox() {
  rot13Active = false;
  document.getElementById('cipher-payload-display').textContent = packetB64;
  document.getElementById('flag-input').value = '';
  const preview = document.getElementById('cipher-preview-text');
  if (preview) {
    preview.textContent = '[AWAITING_DECODE_OPERATION]';
    preview.style.color = 'var(--text-body)';
  }
  playTone('click');
}

function verifyCipherFlag() {
  const val = document.getElementById('flag-input').value.trim();
  const box = document.getElementById('cipher-result-box');
  const status = document.getElementById('cipher-status-pill');
  const footerState = document.getElementById('cipher-footer-state');
  if (val === 'FLAG{UEL_DFIR_LONDON_2026}') {
    status.textContent = 'VERIFIED ✓';
    status.style.color = 'var(--accent-emerald)';
    if (footerState) {
      footerState.textContent = 'FLAG_VERIFIED';
      footerState.style.color = 'var(--accent-emerald)';
    }
    box.style.color = 'var(--accent-emerald)';
    box.textContent = '[ANALYST BADGE UNLOCKED] Flag verified! Fast-track clearance granted.';
    playTone('success');
    awardXp(140, 'ctf_flag', 'Decoded Intercepted Packet Flag');
  } else {
    playTone('alert');
    if (footerState) {
      footerState.textContent = 'CHECKSUM_ERR';
      footerState.style.color = 'var(--accent-crimson)';
    }
    box.style.color = 'var(--accent-crimson)';
    box.textContent = 'Invalid flag checksum. Click "Decode Base64" to inspect payload.';
  }
}

// =========================================================================
// 11. CHAIN OF CUSTODY & TECHNICAL SKILLS CATEGORY FILTERS
// =========================================================================
function filterCustody(category, btn) {
  playTone('click');
  btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.custody-item').forEach(item => {
    const tags = (item.dataset.custody || '').split(' ');
    if (category === 'ALL' || tags.includes(category)) {
      item.classList.remove('hidden-item');
    } else {
      item.classList.add('hidden-item');
    }
  });

  const timeline = document.getElementById('custody-timeline');
  const visibleEntries = timeline.querySelectorAll('.timeline-entry:not(.hidden-item)').length;
  timeline.classList.toggle('no-rail', visibleEntries <= 1);
}

function filterSkills(domain, btn) {
  playTone('click');
  btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.skill-card').forEach(card => {
    if (domain === 'ALL' || card.dataset.domain === domain) {
      card.classList.remove('hidden-item');
    } else {
      card.classList.add('hidden-item');
    }
  });
}

// =========================================================================
// 12. ENCRYPTED CONTACT DISPATCH
// =========================================================================
async function handleDispatch(e) {
  e.preventDefault();
  const name = document.getElementById('tx-name').value.trim();
  const email = document.getElementById('tx-email').value.trim();
  const subject = document.getElementById('tx-subject').value.trim();
  const message = document.getElementById('tx-message').value.trim();

  let hexHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
  try {
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(name + '|' + email + '|' + subject + '|' + Date.now());
      const digest = await crypto.subtle.digest('SHA-256', data);
      hexHash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {}

  const box = document.getElementById('tx-receipt');
  document.getElementById('tx-receipt-hash').textContent = 'RECEIPT_SHA256: ' + hexHash + ' (Target: contact@kabiraj.dev)';
  box.style.display = 'block';
  playTone('success');
  showToast('Encrypted packet signed with SHA-256 receipt!');

  window.location.href = 'mailto:contact@kabiraj.dev?subject=' +
    encodeURIComponent('[KS-DFIR] ' + subject) +
    '&body=' + encodeURIComponent('Sender: ' + name + ' (' + email + ')\nReceipt SHA-256: ' + hexHash + '\n\n' + message);
}

// =========================================================================
// 13. CLIPBOARD, TOAST & INITIALIZATION
// =========================================================================
function copyText(value, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).catch(() => fallbackCopy(value));
  } else {
    fallbackCopy(value);
  }
  playTone('click');
  showToast(label || 'Copied to clipboard!');
}

function fallbackCopy(value) {
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  ta.remove();
}

let toastTimer = null;
function showToast(text) {
  const banner = document.getElementById('toast-banner');
  banner.textContent = text;
  banner.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => banner.classList.remove('show'), 2800);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// Initialize interactive modules immediately
renderEvidence('ALL');
buildSectorGrid();
setDefcon(1);

// Trigger hero name scramble on launch and every 7 seconds
const heroTitleEl = document.getElementById('hero-title');
if (heroTitleEl) {
  setTimeout(() => scrambleHeroName(heroTitleEl, true), 250);
  setInterval(() => scrambleHeroName(heroTitleEl, true), 7000);
}
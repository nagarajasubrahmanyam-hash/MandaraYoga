/**
 * APP ORCHESTRATOR - Full Mandāra Synthesis Edition
 * Features: Guna Synthesis, Dasha Year Mapping, Math Breakdown, and Remedial Logic.
 */
const app = {
    // --- 1. INITIALIZATION ---
    init: async function() {
        const now = new Date();
        
        // Format current date and time for input fields
        const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        
        // Set defaults
        ['m', 'f'].forEach(pfx => {
            document.getElementById(`${pfx}_dob`).value = dateStr;
            document.getElementById(`${pfx}_tob`).value = timeStr;
            document.getElementById(`${pfx}_tz`).value = 5.5; // Default to IST
        });

        // Auto-locate the primary user on load
        this.autoLocate('m');
    },

    /**
     * Browser Geolocation Helper
     */
    autoLocate: function(pfx) {
        const cityInput = document.getElementById(`${pfx}_city`);
        if (pfx === 'm') cityInput.placeholder = "Locating your current position...";

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                document.getElementById(`${pfx}_lat`).value = lat;
                document.getElementById(`${pfx}_lon`).value = lon;
                
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    const cityName = data.address.city || data.address.town || "My Location";
                    cityInput.value = `${cityName}, ${data.address.country}`;
                } catch(e) {
                    cityInput.value = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
                }
                
                // Recalculate once location is set
                this.calculate(pfx);
            }, () => {
                cityInput.placeholder = "Search city (e.g. London)";
                // Default to Delhi if blocked
                if (pfx === 'm') this.ui.pickCity('m', 28.61, 77.23, "New Delhi, India");
            });
        }
    },

    // --- 2. CALCULATION CORE ---
    calculate: function(pfx) {
        const dobRaw = document.getElementById(`${pfx}_dob`).value;
        const tobRaw = document.getElementById(`${pfx}_tob`).value;
        const tz = parseFloat(document.getElementById(`${pfx}_tz`).value);
        const lat = parseFloat(document.getElementById(`${pfx}_lat`).value);
        const lon = parseFloat(document.getElementById(`${pfx}_lon`).value);

        if (!dobRaw || !tobRaw || isNaN(lat)) return alert("Please set Location and Date/Time.");

        // Create precise UTC timestamp
        const [y, m, d] = dobRaw.split('-').map(Number);
        const [h, min] = tobRaw.split(':').map(Number);
        const actualUtcDate = new Date(Date.UTC(y, m - 1, d, h, min) - (tz * 3600000));
        
        // Run Vedic Engine
        const ayanamsa = VedicEngine.getAyanamsa(actualUtcDate);
        const lagnaDeg = VedicEngine.calculateLagna(actualUtcDate, lat, lon, ayanamsa);
        
        // 1. Calculate Standard Planets (Sidereal)
        const rawPositions = AstroWrapper.getPositions(actualUtcDate);
        const standardPlanets = rawPositions.map(p => 
            VedicEngine.formatData(p.name, p.lon, p.isRetro, ayanamsa, lagnaDeg)
        );

        // 2. Calculate Mandara Synthesis Points (Tamas, Rajas, Sattva)
        // These are calculated by adding planet longitudes and checking for triggers
        const mandaraPoints = VedicEngine.calculateMandaraPoints(standardPlanets, ayanamsa, lagnaDeg);
        
        // 3. Combine All Data (Lagna first, then Planets, then Yoga Points)
        const allData = [
            VedicEngine.formatData("Lagna", lagnaDeg, false, 0, lagnaDeg, true),
            ...standardPlanets,
            ...mandaraPoints
        ];

        // 4. Update UI
        this.renderTable(pfx, allData);
        this.renderAnalysis(pfx, allData);
    },

    // --- 3. UI RENDERING ---
    renderTable: function(pfx, data) {
        const tbody = document.getElementById(`${pfx}_table_body`);
        tbody.innerHTML = data.map(p => {
            const rowClass = p.isLagna ? 'lagna-row' : (p.isSpecial ? 'mandara-row' : '');
            
            return `
                <tr class="${rowClass}">
                    <td class="p-name">
                        ${p.icon || ''} ${p.name} ${p.isRetro ? '<small style="color:#ef4444">Ⓡ</small>' : ''}
                        ${p.description ? `<br><small style="color:#7c3aed; font-weight:400; font-size:0.65rem;">${p.description}</small>` : ''}
                    </td>
                    <td>${p.sign}</td>
                    <td class="deg-box">${p.degStr}</td>
                    <td>${p.nak}</td>
                    <td>
                        ${p.dignity || (p.isSpecial ? `<span class="tag" style="background:#f3e8ff; color:#6b21a8; border:1px solid #ddd6fe;">${p.managingPlanet}</span>` : '')}
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderAnalysis: function(pfx, allData) {
        const diagBox = document.getElementById(`${pfx}_analysis`);
        const report = MarriageAnalyzer.analyze(allData);
        const mandaraPoints = allData.filter(p => p.isSpecial);

        diagBox.style.display = "block";
        diagBox.innerHTML = `
            <!-- PART 1: DESTINY DIAGNOSIS -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:15px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-weight:800; color:#64748b; font-size:0.7rem; text-transform:uppercase;">Marriage Destiny</span>
                    <span style="background:${report.conclusion.color}; color:white; padding:3px 12px; border-radius:20px; font-size:0.7rem; font-weight:700;">${report.conclusion.status}</span>
                </div>
                <p style="font-size:0.9rem; color:#1e293b; margin-bottom:10px; font-weight:500;">${report.conclusion.description}</p>
                
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${report.steps.map(step => `
                        <div style="display:grid; grid-template-columns:110px 1fr 80px; gap:10px; font-size:0.75rem; background:white; padding:8px; border-radius:6px; border:1px solid #f1f5f9; align-items:center;">
                            <div style="font-weight:700;">${step.label}</div>
                            <div style="color:#64748b;">${step.impact}</div>
                            <div style="text-align:right; font-weight:800; color:${this.getStatusColor(step.result)}">${step.result}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- PART 2: MANDĀRA REMEDY (Conditional) -->
            ${report.remedy ? `
                <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:12px; padding:15px; margin-bottom:15px;">
                    <h4 style="color:#e11d48; margin:0 0 5px 0; font-size:0.8rem;">🕉️ NĪLAKAṆṬHA REMEDY</h4>
                    <p style="font-size:0.75rem; color:#881337; margin-bottom:10px; line-height:1.4;">${report.remedy.action}</p>
                    <div style="background:white; padding:12px; border-radius:6px; font-family:monospace; color:#be123c; font-weight:bold; text-align:center; border:1px dashed #fb7185; font-size:0.85rem;">
                        ${report.remedy.mantra}
                    </div>
                </div>
            ` : ''}

            <!-- PART 3: DETAILED CALCULATION LOG (The Math) -->
            <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:12px; padding:15px;">
                <span style="font-weight:800; color:#7c3aed; font-size:0.7rem; text-transform:uppercase; display:block; margin-bottom:10px;">Detailed Mandāra Math Breakdown</span>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    ${mandaraPoints.map(p => `
                        <div style="background:white; padding:10px; border-radius:8px; border:1px solid #ede9fe;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-weight:700; color:#5b21b6; font-size:0.8rem;">${p.icon} ${p.name}</span>
                                <span style="font-size:0.65rem; font-weight:700; background:#f3e8ff; color:#6b21a8; padding:2px 8px; border-radius:10px;">Manager: ${p.managingPlanet}</span>
                            </div>
                            <code style="display:block; background:#f8fafc; padding:8px; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:0.7rem; color:#4c1d95; border:1px solid #f1f5f9; overflow-x:auto; white-space:nowrap;">
                                ${p.mathLog}
                            </code>
                            <div style="display:flex; justify-content:space-between; margin-top:8px;">
                                <span style="font-size:0.65rem; color:#6b7280;">Nakshatra: <strong>${p.nak}</strong></span>
                                ${p.triggers.length > 0 ? 
                                    `<span style="font-size:0.65rem; color:#dc2626; font-weight:800;">⚠ Triggered by: ${p.triggers.join(", ")}</span>` : 
                                    `<span style="font-size:0.65rem; color:#10b981;">No direct triggers</span>`
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getStatusColor: function(res) {
        const r = res.toLowerCase();
        if (r.includes('clear') || r.includes('supportive') || r.includes('enjoyment') || r.includes('favorable')) return '#16a34a';
        if (r.includes('weakened') || r.includes('active') || r.includes('latent')) return '#d97706';
        return '#dc2626'; // Critical/Afflicted
    },

    // --- 4. SEARCH & GEODATA UI ---
    ui: {
        handleSearch: async function(pfx) {
            const q = document.getElementById(`${pfx}_city`).value;
            if (q.length < 3) return;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=5`);
            const data = await res.json();
            const box = document.getElementById(`${pfx}_city_results`);
            
            box.innerHTML = data.map(c => `
                <div class="search-item" onclick="app.ui.pickCity('${pfx}', ${c.lat}, ${c.lon}, '${c.display_name.replace(/'/g, "")}')">
                    ${c.display_name}
                </div>
            `).join('');
            box.style.display = 'block';
        },

        pickCity: function(pfx, lat, lon, name) {
            document.getElementById(`${pfx}_lat`).value = lat;
            document.getElementById(`${pfx}_lon`).value = lon;
            document.getElementById(`${pfx}_city`).value = name;
            document.getElementById(`${pfx}_city_results`).style.display = 'none';
            app.calculate(pfx);
        }
    }
};

// Start the engine
window.onload = () => app.init();
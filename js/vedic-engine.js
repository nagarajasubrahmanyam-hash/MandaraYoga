/**
 * VEDIC ENGINE - Professional Edition
 * Features: Ayanamsa, Sidereal Lagna, Mandāra Point Synthesis (Tamas, Rajas, Sattva),
 * Dasha Year Logic, and Trigged Yoga Detection.
 */

const VedicEngine = {
    // --- 1. CONFIGURATION & CONSTANTS ---
    DASHA_YEARS: {
        "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, 
        "Jupiter": 16, "Saturn": 19, "Mercury": 17, 
        "Ketu": 7, "Venus": 20
    },

    // --- 2. CORE ASTRONOMY ---
    getAyanamsa: function(date) {
        // Precise Lahiri Ayanamsa Calculation
        return 23.85 + (0.01396 * (date.getFullYear() - 2000));
    },

    calculateLagna: function(utcDate, lat, lon, ayanamsa) {
        const time = Astronomy.MakeTime(utcDate);
        const jd = (utcDate.getTime() / 86400000) + 2440587.5;
        const gast = Astronomy.SiderealTime(time);
        
        // Local Sidereal Time (Degrees)
        const lstDeg = (gast * 15 + lon + 360) % 360;
        const lstRad = lstDeg * (Math.PI / 180);
        
        const t = (jd - 2451545.0) / 36525;
        const eps = (23.4392911 - (46.8150 * t / 3600)) * (Math.PI / 180);
        const phi = lat * (Math.PI / 180);

        const y = Math.cos(lstRad);
        const x = - (Math.sin(lstRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
        
        let tropicalAsc = Math.atan2(y, x) * (180 / Math.PI);
        return (tropicalAsc - ayanamsa + 360) % 360;
    },

    // --- 3. DATA FORMATTING ---
    formatData: function(name, rawLon, isRetro, ayanamsa, lagnaDeg, isLagna = false) {
        // Correct for Ayanamsa (Special points are passed with ayanamsa=0 if already corrected)
        const siderealDeg = (rawLon - (isLagna ? 0 : ayanamsa) + 360) % 360;
        const signIdx = Math.floor(siderealDeg / 30);
        const signDeg = siderealDeg % 30;
        
        const navSegments = Math.floor(signDeg / (30/9));
        const navStartSign = [0, 9, 6, 3][signIdx % 4];
        const navSignIdx = (navStartSign + navSegments) % 12;

        const lagnaSignIdx = Math.floor(lagnaDeg / 30);
        const house = ((signIdx - lagnaSignIdx + 12) % 12) + 1;

        return {
            name, isLagna, signIdx, navSignIdx, house, isRetro, siderealDeg,
            sign: SIGNS[signIdx],
            degStr: this.toSigns(siderealDeg, true), // Returns "14° 56'" style
            nak: `${NAKSHATRAS[Math.floor(siderealDeg / (360/27))]} (${Math.floor((siderealDeg % (360/27)) / (360/108)) + 1})`,
            dignity: this.getDignity(name, signIdx + 1)
        };
    },

    // --- 4. MANDĀRA YOGA SYNTHESIS ---
    calculateMandaraPoints: function(planetData, ayanamsa, lagnaDeg) {
        return MANDARA_POINTS.map(spec => {
            const p1 = planetData.find(p => p.name === spec.p1);
            const p2 = planetData.find(p => p.name === spec.p2);
            
            // MATH: Addition of longitudes
            const rawSum = p1.siderealDeg + p2.siderealDeg;
            const normalizedSum = rawSum % 360;

            // HIGHER CALCULATION: Managing Planet (Dasha years sum)
            // Example: Sun (6) + Moon (10) = Jupiter (16)
            const sumYears = (this.DASHA_YEARS[spec.p1] || 0) + (this.DASHA_YEARS[spec.p2] || 0);
            const manager = Object.keys(this.DASHA_YEARS).find(k => this.DASHA_YEARS[k] === sumYears) || "N/A";

            // TRIGGER DETECTION: Is a natal planet pushing this point? (Orb: 5°)
            const triggers = planetData.filter(p => {
                const diff = Math.min(Math.abs(p.siderealDeg - normalizedSum), 360 - Math.abs(p.siderealDeg - normalizedSum));
                return diff < 5 && !p.isLagna; 
            }).map(p => p.name);

            // Detailed Math Breakdown (e.g., 9s 26° + 5s 13°)
            const mathLog = `${this.toSigns(p1.siderealDeg)} + ${this.toSigns(p2.siderealDeg)} = ${this.toSigns(rawSum)} ${rawSum >= 360 ? '(Sub 12s) → ' + this.toSigns(normalizedSum) : ''}`;

            const formatted = this.formatData(spec.name, normalizedSum, false, 0, lagnaDeg);
            formatted.isSpecial = true;
            formatted.description = spec.desc;
            formatted.icon = spec.icon;
            formatted.mathLog = mathLog;
            formatted.managingPlanet = manager;
            formatted.triggers = triggers;
            
            return formatted;
        });
    },

    // --- 5. HELPERS ---
    toSigns: function(totalDeg, degreesOnly = false) {
        const s = Math.floor(totalDeg / 30);
        const d = Math.floor(totalDeg % 30);
        const m = Math.floor(((totalDeg % 30) % 1) * 60);
        
        if (degreesOnly) return `${d}° ${m}'`;
        return `${s}s ${d}°${m}'`;
    },

    getDignity: function(name, sNum) {
        if (EXALT[name] === sNum) return '<span class="tag tag-ex">Exalted</span>';
        if (DEBIL[name] === sNum) return '<span class="tag tag-db">Debilitated</span>';
        if (OWNED[name]?.includes(sNum)) return '<span class="tag tag-own">Own Sign</span>';
        return "";
    }
};
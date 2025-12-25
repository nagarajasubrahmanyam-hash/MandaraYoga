/**
 * MARRIAGE ANALYZER - Advanced Mandāra Edition
 */
const MarriageAnalyzer = {
    analyze: function(allData) {
        const venus = allData.find(p => p.name === "Venus");
        const lagna = allData.find(p => p.isLagna);
        const yama = allData.find(p => p.name.includes("Yama"));
        const bhoga = allData.find(p => p.name.includes("Bhoga"));
        
        const dusthanas = [6, 8, 12];
        const report = { steps: [], conclusion: {}, remedy: null };
        let severity = 0;

        // 1. Venus Primary Placement
        const isDusthana = dusthanas.includes(venus.house);
        const pStep = { label: "Placement", check: `Venus in House ${venus.house}`, result: "Clear", impact: "Favorable" };
        if (isDusthana) {
            pStep.result = venus.isRetro ? "CRITICAL" : "Weakened";
            pStep.impact = venus.isRetro ? "Severe relationship debt (Retro in Dusthana)" : "Basic marital karma unstable";
            severity += venus.isRetro ? 10 : 3;
        }
        report.steps.push(pStep);

        // 2. Mandāra Yama (Tamas) Yoga - "Crime and Punishment"
        if (yama) {
            // Check if Venus is triggering the Yama Point (within 5 degrees)
            const diff = Math.min(Math.abs(venus.siderealDeg - yama.siderealDeg), 360 - Math.abs(venus.siderealDeg - yama.siderealDeg));
            const onVenus = diff < 5;
            
            if (onVenus) {
                severity += 15; // High severity for direct Yama affliction
                report.steps.push({ 
                    label: "Mandāra Yama", 
                    result: "CRITICAL", 
                    impact: "Yama point on Venus: Severe suffering/Punishment yoga active." 
                });
                
                // Set the Remedy as per Screenshot
                report.remedy = {
                    title: "Nīlakaṇṭha Remedy",
                    mantra: "Oṃ Namah Śivāya Namo Nīlakaṇṭhāya",
                    action: "The 'poison' of Saturn+Mars is affecting your Venus. Offer one Mandāra flower to Shiva to neutralize the suffering."
                };
            } else if (yama.triggers && yama.triggers.length > 0) {
                const triggerList = yama.triggers.filter(t => t !== "Venus").join(", ");
                report.steps.push({ 
                    label: "Yama Trigger", 
                    result: "Active", 
                    impact: `Debt point activated by ${triggerList}. Punishment through these energies.` 
                });
                severity += 5;
            } else {
                report.steps.push({ label: "Mandāra Debt", result: "Latent", impact: "No direct activation of Yama point found." });
            }
        }

        // 3. Bhoga (Rajas) Analysis - "The Party Point"
        if (bhoga && bhoga.triggers.length > 0) {
            report.steps.push({ 
                label: "Bhoga Yoga", 
                result: "Enjoyment", 
                impact: `Party point triggered by ${bhoga.triggers.join(", ")}. Happiness indicated here.` 
            });
        }

        // 4. Conclusion Logic
        if (severity >= 15) {
            report.conclusion = { status: "Karmic Debt", color: "#dc2626", description: "Severe 'Crime and Punishment' yoga detected. Venus is enduring high pressure." };
        } else if (severity >= 7) {
            report.conclusion = { status: "Challenged", color: "#d97706", description: "Obstructions in marital happiness; Venus requires strengthening or remedy." };
        } else {
            report.conclusion = { status: "Favorable", color: "#16a34a", description: "No major Mandāra afflictions. Natural flow of Vivāha Sukha (Marital Joy)." };
        }

        return report;
    }
};
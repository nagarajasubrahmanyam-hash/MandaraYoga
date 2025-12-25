const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

const EXALT = { "Sun": 1, "Moon": 2, "Mars": 10, "Mercury": 6, "Jupiter": 4, "Venus": 12, "Saturn": 7 };
const DEBIL = { "Sun": 7, "Moon": 8, "Mars": 4, "Mercury": 12, "Jupiter": 10, "Venus": 6, "Saturn": 1 };
const OWNED = { "Sun": [5], "Moon": [4], "Mars": [1, 8], "Mercury": [3, 6], "Jupiter": [9, 12], "Venus": [2, 7], "Saturn": [10, 11] };

const SIGN_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]; 
const PLANET_LIST = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

// NEW: Mandāra Point Definitions
const MANDARA_POINTS = [
    { name: "Mandāra (Tamas/Yama)", p1: "Saturn", p2: "Mars", desc: "Crime & Punishment (Debt)", icon: "⚖️" },
    { name: "Mandāra (Rajas/Bhoga)", p1: "Mercury", p2: "Venus", desc: "Worldly Enjoyment (Party)", icon: "🎉" },
    { name: "Mandāra (Sattva/Dharma)", p1: "Sun", p2: "Jupiter", desc: "Wisdom & Spiritual Light", icon: "🪔" }
];
import fs from 'fs';

const filePath = './src/lib/assets/quests/world-capitals/elements.json';

// MANUAL FIXES: e
const manualOverrides = {
    // Europe
    "Kiew":             ["Europe"], 
    "Chisinau":         ["Europe"],
    "Torshavn":         ["Europe"],
    "Saint Peter Port": ["Europe"],
    
    // North America (USA + Central America)
    "Washington, DC":   ["North America"],
    "San Jose":         ["North America"], // Costa Rica

    // Caribbean
    "Saint George's":   ["Caribbean"], 
    "Port-of-Spain":["Caribbean"],
    "Grand Turk":       ["Caribbean"],

    // South America
    "Brasilia":["South America"],
    "Asuncion":         ["South America"],
    "Bogota":["South America"],

    // Africa
    "Bujumbura":        ["Africa"],
    "Malabo":           ["Africa"],
    "Yaounde":          ["Africa"],
    "Sao Tome":["Africa"],
    "Lome":             ["Africa"],
    "Dar es Salaam":    ["Africa"],

    // Middle East (Western Asia)
    "T'bilisi":         ["Asia"], 
    "Sanaa":            ["Asia"],
    
    // Asia (Rest of Asia)
    "Hong Kong":        ["Asia"],
    "Rangoon":          ["Asia"],
    "Ulaanbaatar":["Asia"],
    "Male":             ["Asia"],
    "Colombo":          ["Asia"],

    // Oceania
    "Hagatna":          ["Oceania"],
    "Melekeok":["Oceania"],
    "Papeete":          ["Oceania"],
    "Port-Vila":["Oceania"],
    "Noumea":           ["Oceania"],
    "The Settlement":   ["Oceania"]
};

async function updateCapitals() {
    console.log(`\n📂 Reading local file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error("❌ ERROR: Could not find the file!");
        return;
    }

    console.log("🌍 Downloading country data...");
    
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,subregion');
        if (!response.ok) throw new Error(`API Failed: ${response.status}`);
        const countries = await response.json();
        
        let capitalsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let updatedCount = 0;

        for (let capitalName in capitalsData) {
            let newTags =[];

            // 1. Check Manual Overrides
            if (manualOverrides[capitalName]) {
                newTags = manualOverrides[capitalName];
                updatedCount++;
            } 
            // 2. Check API
            else {
                const countryInfo = countries.find(c => 
                    c.capital && c.capital.some(cap => cap.toLowerCase() === capitalName.toLowerCase())
                );

                if (countryInfo) {
                    const r = countryInfo.region;
                    const sr = countryInfo.subregion || "";

                    // AMERICAS 
                    if (r === "Americas") {
                        if (sr.includes("Caribbean")) {
                            newTags.push("Caribbean");
                        } else if (sr.includes("South")) {
                            newTags.push("South America");
                        } else {
                            // North + Central America go here
                            newTags.push("North America");
                        }
                    }
                    
                    // ASIA
                    else if (r === "Asia") {
                            newTags.push("Asia");
                   }

                    // AFRICA
                    else if (r === "Africa") {
                        newTags.push("Africa");
                    }

                    // EUROPE
                    else if (r === "Europe") {
                        newTags.push("Europe");
                    }

                    // OCEANIA
                    else if (r === "Oceania") {
                        newTags.push("Oceania");
                    }

                    updatedCount++;
                }
            }

            // Apply changes
            if (newTags.length > 0) {
                capitalsData[capitalName].tags = newTags;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(capitalsData, null, '\t'));
        console.log(`\n🎉 DONE! Updated ${updatedCount} capitals to your perfect list.`);

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
    }
}

updateCapitals();
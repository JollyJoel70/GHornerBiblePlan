// ESV API Configuration
const API_KEY = "80b9a168076e7b5898c124ab1a05e20841ded65c";
const API_URL = "https://api.esv.org/v3/passage/text/";

// Bible Sections and Chapter Counts
const bibleLists = {
  gospels: ["Matthew", "Mark", "Luke", "John"],
  pentateuch: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  paulineEpistles: ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Hebrews"],
  generalEpistles: ["1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
  wisdom: ["Job", "Ecclesiastes", "Song of Solomon"],
  psalms: ["Psalms"],
  proverbs: ["Proverbs"],
  otHistory: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"],
  prophets: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
  acts: ["Acts"],
};
const chapterCounts = {
  gospels: 89,
  pentateuch: 187,
  paulineEpistles: 78,
  generalEpistles: 65,
  wisdom: 62,
  psalms: 150,
  proverbs: 31,
  otHistory: 249,
  prophets: 250,
  acts: 28,
};

// Load Progress and Read State
const progress = JSON.parse(localStorage.getItem("progress")) || {
  gospels: 1,
  pentateuch: 1,
  paulineEpistles: 1,
  generalEpistles: 1,
  wisdom: 1,
  psalms: 1,
  proverbs: 1,
  otHistory: 1,
  prophets: 1,
  acts: 1,
};
const readChapters = JSON.parse(localStorage.getItem("readChapters")) || {};

// Generate Reading Buttons
function generateReadings() {
    const readingPlan = document.getElementById("reading-plan");
    readingPlan.innerHTML = ""; // Clear previous readings
  
    const sections = Object.keys(progress);
  
    sections.forEach((section) => {
      const bookIndex = findBookIndex(section, progress[section]);
      const bookName = bibleLists[section][bookIndex];
      const chapter = findChapterInBook(section, progress[section], bookIndex);
      const chapterKey = `${section}-${bookName}-${chapter}`;
  
      const button = document.createElement("button");
      button.textContent = `${bookName} ${chapter}`;
      button.className = "chapter-button";
  
      // Check if this chapter is marked as read
      if (readChapters[chapterKey]) {
        button.classList.add("read");
      }
  
      button.onclick = () => handleButtonClick(section, bookName, chapter, chapterKey, button);
  
      readingPlan.appendChild(button);
    });
  
    // Ensure the "Progress All Chapters" button is visible
    const progressAllButton = document.getElementById("progressAllChaptersButton");
    if (progressAllButton) {
      progressAllButton.style.display = "block"; // Always show the button
    }
  }
  

// Handle Button Clicks
function handleButtonClick(section, bookName, chapter, chapterKey, button) {
  if (!readChapters[chapterKey]) {
    // Mark as read
    readChapters[chapterKey] = true;
    button.classList.add("read");
    saveState();
    checkAllRead();
  } else {
    // Confirm progression
    const confirmProgress = confirm(`Would you like to progress "${bookName} ${chapter}" to the next chapter?`);
    if (confirmProgress) {
      progress[section] = (progress[section] % chapterCounts[section]) + 1;
      delete readChapters[chapterKey];
      saveState();
      generateReadings();
    }
  }
}

// Progress All Readings
function progressAllReadings() {
  const confirmProgressAll = confirm("Are you sure you want to progress to the next day's readings?");
  if (confirmProgressAll) {
    Object.keys(progress).forEach((section) => {
      progress[section] = (progress[section] % chapterCounts[section]) + 1;
    });

    Object.keys(readChapters).forEach((key) => delete readChapters[key]);
    saveState();
    generateReadings();
  }
}

// Save State to Local Storage
function saveState() {
  localStorage.setItem("progress", JSON.stringify(progress));
  localStorage.setItem("readChapters", JSON.stringify(readChapters));
}

// Utility Functions
function findBookIndex(section, currentChapter) {
  let chaptersSoFar = 0;
  const sectionList = bibleLists[section];

  for (let i = 0; i < sectionList.length; i++) {
    const bookChapters = getBookChapters(sectionList[i]);
    if (currentChapter <= chaptersSoFar + bookChapters) {
      return i;
    }
    chaptersSoFar += bookChapters;
  }
  return sectionList.length - 1;
}

function findChapterInBook(section, currentChapter, bookIndex) {
  const sectionList = bibleLists[section];
  let chaptersSoFar = 0;

  for (let i = 0; i < bookIndex; i++) {
    chaptersSoFar += getBookChapters(sectionList[i]);
  }

  return currentChapter - chaptersSoFar;
}

function getBookChapters(bookName) {
  const bookChapterCounts = {
    "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21,
    "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
    "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
    "Ephesians": 6, "Philippians": 4, "Colossians": 4, "Hebrews": 13,
    "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4,
    "Titus": 3, "Philemon": 1, "James": 5, "1 Peter": 5, "2 Peter": 3,
    "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22,
    "Job": 42, "Ecclesiastes": 12, "Song of Solomon": 8,
    "Psalms": 150, "Proverbs": 31,
    "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    "Ezra": 10, "Nehemiah": 13, "Esther": 10,
    "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12,
    "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
    "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
    "Zechariah": 14, "Malachi": 4, "Acts": 28,
  };
  return bookChapterCounts[bookName] || 1;
}

// Fetch and Display Scripture
async function fetchScripture(reference) {
    const url = `${API_URL}?q=${encodeURIComponent(reference)}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Token ${API_KEY}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch scripture: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Extract and display scripture text
      const scriptureText = data.passages ? data.passages[0] : "Scripture not found.";
      const scriptureDisplay = document.getElementById("scripture-text");
      scriptureDisplay.textContent = scriptureText;
    } catch (error) {
      console.error("Error fetching scripture:", error);
      const scriptureDisplay = document.getElementById("scripture-text");
      scriptureDisplay.textContent = "Failed to load scripture. Please try again later.";
    }
  }
  
  // Handle Button Clicks (Updated)
 // Handle Button Clicks
function handleButtonClick(section, bookName, chapter, chapterKey, button) {
    // If button is in the confirmation state, ignore further clicks
    if (button.classList.contains("confirming")) return;
  
    const reference = `${bookName} ${chapter}`; // E.g., "Matthew 1"
  
    // Fetch and display scripture for the selected chapter
    fetchScripture(reference);
  
    // Mark as read if not already read
    if (!readChapters[chapterKey]) {
      readChapters[chapterKey] = true;
      button.classList.add("read");
      saveState();
      checkAllRead();
      return;
    }
  
    // Change to confirmation state
    button.classList.add("confirming");
    button.innerHTML = `
      <span>Move Forward?</span>
      <span class="confirm-yes">Yes</span>
    `;
  
    // Add Yes functionality
    const yesText = button.querySelector(".confirm-yes");
    yesText.onclick = () => {
      progress[section] = (progress[section] % chapterCounts[section]) + 1;
      delete readChapters[chapterKey];
      saveState();
      generateReadings();
    };
  
    // Reset button after 10 seconds if no action is taken
    setTimeout(() => {
      if (button.classList.contains("confirming")) {
        button.classList.remove("confirming");
        button.textContent = `${bookName} ${chapter}`;
      }
    }, 10000);
  }
  
  // Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
});

// Load Dark Mode Preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

// Text Size Adjustment
const scriptureText = document.getElementById("scripture-text");
const increaseTextSize = document.getElementById("increaseTextSize");
const decreaseTextSize = document.getElementById("decreaseTextSize");

// Load Text Size Preference
let currentFontSize = parseInt(localStorage.getItem("scriptureFontSize")) || 16;
scriptureText.style.fontSize = `${currentFontSize}px`;

// Increase Font Size
increaseTextSize.addEventListener("click", () => {
  currentFontSize += 2;
  scriptureText.style.fontSize = `${currentFontSize}px`;
  localStorage.setItem("scriptureFontSize", currentFontSize);
});

// Decrease Font Size
decreaseTextSize.addEventListener("click", () => {
  if (currentFontSize > 10) { // Minimum font size
    currentFontSize -= 2;
    scriptureText.style.fontSize = `${currentFontSize}px`;
    localStorage.setItem("scriptureFontSize", currentFontSize);
  }
});

function progressAllChapters() {
    // Confirm the user's action
    const confirmProgressAll = confirm("Are you sure you want to progress all chapters by one?");
    if (confirmProgressAll) {
      Object.keys(progress).forEach((section) => {
        progress[section] = (progress[section] % chapterCounts[section]) + 1;
      });
  
      // Clear read chapters and save the updated state
      Object.keys(readChapters).forEach((key) => delete readChapters[key]);
      saveState();
  
      // Regenerate the reading buttons
      generateReadings();
    }
  }
  
// Initialize
generateReadings();

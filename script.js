// Food carbon footprint database (kg CO2e per kg of food)
const foodCarbonData = {
  beef: 27.0,
  lamb: 39.2,
  pork: 12.1,
  chicken: 6.9,
  fish: 6.1,
  eggs: 4.8,
  milk: 1.9,
  cheese: 13.5,
  rice: 4.0,
  potatoes: 0.3,
  wheat: 1.4,
  corn: 1.1,
  beans: 0.8,
  lentils: 0.9,
  tofu: 2.0,
  nuts: 0.3,
  vegetables: 0.4,
  fruits: 0.7,
};

// Food waste tips
const wasteTips = [
  "Plan your meals ahead and create a shopping list to avoid impulse purchases.",
  "Store food properly - fruits and vegetables last longer when stored correctly.",
  "Use leftovers creatively - transform them into new meals.",
  "Understand expiration dates - 'best before' doesn't mean unsafe after.",
  "Freeze excess food that you won't consume immediately.",
  "Compost food scraps instead of throwing them away.",
  "Buy loose produce instead of pre-packaged to control portions.",
  "Conduct a weekly fridge audit to identify what needs to be used soon.",
  "Serve smaller portions - you can always go back for seconds.",
  "Keep track of what you throw away to identify patterns.",
];

// Mock leaderboard data - in a real app, this would come from a server
const leaderboardData = [
  { name: "EcoWarrior", points: 1250 },
  { name: "GreenGuru", points: 1130 },
  { name: "SustainableSam", points: 950 },
  { name: "EarthProtector", points: 890 },
  { name: "RecycleRobin", points: 780 },
  { name: "ZeroWasteZoe", points: 720 },
  { name: "PlanetPaul", points: 650 },
  { name: "EcoEmma", points: 580 },
  { name: "LocalLouise", points: 510 },
  { name: "GreenThumb", points: 490 },
];

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initTabs();
  initDarkMode();
  initMealCalculator();
  initWasteTracker();
  initChallenges();
  initGroceryScanner();

  // Set current date as default for waste tracker
  document.getElementById("waste-date").valueAsDate = new Date();
});

// Tab navigation functionality
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// Dark mode toggle functionality
function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const icon = darkModeToggle.querySelector("i");

  // Check if dark mode preference is saved in localStorage
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      localStorage.setItem("darkMode", "disabled");
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  });
}

// Meal Carbon Calculator functionality
function initMealCalculator() {
  const mealForm = document.getElementById("meal-form");
  const foodItemSelect = document.getElementById("food-item");
  const carbonResult = document.getElementById("carbon-result");
  const alternativesList = document.getElementById("alternatives-list");
  let mealChart = null;

  // Populate food dropdown with all options
  Object.keys(foodCarbonData)
    .sort()
    .forEach((food) => {
      if (!foodItemSelect.querySelector(`option[value="${food}"]`)) {
        const option = document.createElement("option");
        option.value = food;
        option.textContent = food.charAt(0).toUpperCase() + food.slice(1);
        foodItemSelect.appendChild(option);
      }
    });

  mealForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const foodItem = foodItemSelect.value;
    const quantity = parseInt(document.getElementById("quantity").value);

    if (foodItem && quantity) {
      const carbonFootprint = calculateCarbonFootprint(foodItem, quantity);
      displayCarbonResult(foodItem, carbonFootprint);
      findAlternatives(foodItem, quantity);
      createComparisonChart(foodItem, quantity);
    }
  });

  function calculateCarbonFootprint(food, quantity) {
    // Convert quantity from grams to kg
    const quantityInKg = quantity / 1000;
    return foodCarbonData[food] * quantityInKg;
  }

  function displayCarbonResult(food, carbonFootprint) {
    carbonResult.innerHTML = `
            <p>Your ${food} (${
      document.getElementById("quantity").value
    }g) produces:</p>
            <p class="impact">${carbonFootprint.toFixed(2)} kg CO₂e</p>
        `;

    // Add color class based on carbon impact
    if (carbonFootprint < 0.5) {
      carbonResult.className = "low";
    } else if (carbonFootprint < 2) {
      carbonResult.className = "medium";
    } else {
      carbonResult.className = "high";
    }
  }

  function findAlternatives(food, quantity) {
    const currentFootprint = calculateCarbonFootprint(food, quantity);
    const alternatives = [];

    // Find alternatives with lower carbon footprint
    Object.keys(foodCarbonData).forEach((alternativeFood) => {
      if (alternativeFood !== food) {
        const altFootprint = calculateCarbonFootprint(
          alternativeFood,
          quantity
        );
        if (altFootprint < currentFootprint) {
          alternatives.push({
            food: alternativeFood,
            footprint: altFootprint,
            saved: currentFootprint - altFootprint,
          });
        }
      }
    });

    // Sort by carbon savings (highest first)
    alternatives.sort((a, b) => b.saved - a.saved);

    // Display top 5 alternatives
    alternativesList.innerHTML = "";
    const topAlternatives = alternatives.slice(0, 5);

    topAlternatives.forEach((alt) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <strong>${
                  alt.food.charAt(0).toUpperCase() + alt.food.slice(1)
                }</strong>: 
                ${alt.footprint.toFixed(2)} kg CO₂e 
                (saves ${alt.saved.toFixed(2)} kg CO₂e)
            `;
      alternativesList.appendChild(li);
    });

    if (alternatives.length === 0) {
      alternativesList.innerHTML =
        "<li>No lower-carbon alternatives found.</li>";
    }
  }

  function createComparisonChart(food, quantity) {
    const ctx = document
      .getElementById("meal-comparison-chart")
      .getContext("2d");

    // Get alternatives for chart
    const currentFootprint = calculateCarbonFootprint(food, quantity);
    const alternatives = [];

    Object.keys(foodCarbonData).forEach((alternativeFood) => {
      if (alternativeFood !== food && alternatives.length < 5) {
        const altFootprint = calculateCarbonFootprint(
          alternativeFood,
          quantity
        );
        alternatives.push({
          food: alternativeFood,
          footprint: altFootprint,
        });
      }
    });

    // Sort by carbon footprint (lowest first)
    alternatives.sort((a, b) => a.footprint - b.footprint);

    // Prepare data for chart
    const labels = [food, ...alternatives.map((alt) => alt.food)];
    const data = [
      currentFootprint,
      ...alternatives.map((alt) => alt.footprint),
    ];
    const backgroundColor = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(76, 175, 80, 0.7)",
    ];

    // Destroy previous chart if exists
    if (mealChart) {
      mealChart.destroy();
    }

    // Create new chart
    mealChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.map(
          (label) => label.charAt(0).toUpperCase() + label.slice(1)
        ),
        datasets: [
          {
            label: "Carbon Footprint (kg CO₂e)",
            data: data,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor.map((color) =>
              color.replace("0.7", "1")
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "kg CO₂e",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Carbon Footprint Comparison (${quantity}g)`,
          },
        },
      },
    });
  }
}

// Food Waste Tracker functionality
function initWasteTracker() {
  const wasteForm = document.getElementById("waste-form");
  const wasteList = document.getElementById("waste-list");
  const wasteTipsBox = document.getElementById("waste-tips");
  let wasteItems = JSON.parse(localStorage.getItem("wasteItems")) || [];
  let wasteChart = null;

  // Display existing waste items
  displayWasteItems();
  updateWasteChart();
  displayRandomTip();

  wasteForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const wasteItem = document.getElementById("waste-item").value;
    const wasteQuantity = parseInt(
      document.getElementById("waste-quantity").value
    );
    const wasteDate = document.getElementById("waste-date").value;

    if (wasteItem && wasteQuantity && wasteDate) {
      // Add new waste item
      wasteItems.push({
        id: Date.now(),
        item: wasteItem,
        quantity: wasteQuantity,
        date: wasteDate,
      });

      // Save to localStorage
      localStorage.setItem("wasteItems", JSON.stringify(wasteItems));

      // Update display
      displayWasteItems();
      updateWasteChart();
      displayRandomTip();

      // Reset form
      wasteForm.reset();
      document.getElementById("waste-date").valueAsDate = new Date();
    }
  });

  function displayWasteItems() {
    wasteList.innerHTML = "";

    if (wasteItems.length === 0) {
      wasteList.innerHTML =
        "<p>No waste logged yet. Start logging to track your waste.</p>";
      return;
    }

    // Sort by date (newest first)
    wasteItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    wasteItems.forEach((item) => {
      const wasteItem = document.createElement("div");
      wasteItem.className = "waste-item";
      wasteItem.innerHTML = `
                <div>
                    <strong>${item.item}</strong> (${item.quantity}g)
                    <div class="waste-date">${formatDate(item.date)}</div>
                </div>
                <button class="delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
      wasteList.appendChild(wasteItem);
    });

    // Add delete functionality
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        wasteItems = wasteItems.filter((item) => item.id !== id);
        localStorage.setItem("wasteItems", JSON.stringify(wasteItems));
        displayWasteItems();
        updateWasteChart();
      });
    });
  }

  function updateWasteChart() {
    const ctx = document.getElementById("waste-chart").getContext("2d");

    // Get waste by day of week
    const wasteByDay = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    // Calculate total waste for each day
    wasteItems.forEach((item) => {
      const day = new Date(item.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      wasteByDay[day] += item.quantity;
    });

    // Destroy previous chart if exists
    if (wasteChart) {
      wasteChart.destroy();
    }

    // Create new chart
    wasteChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(wasteByDay),
        datasets: [
          {
            label: "Food Waste (g)",
            data: Object.values(wasteByDay),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Waste (g)",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Weekly Food Waste",
          },
        },
      },
    });
  }

  function displayRandomTip() {
    const randomTip = wasteTips[Math.floor(Math.random() * wasteTips.length)];
    wasteTipsBox.innerHTML = `<h4>Tips to Reduce Waste</h4><p class="tip">${randomTip}</p>`;
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}

// Weekly Challenges functionality
function initChallenges() {
  const userPoints = document.getElementById("user-points");
  const levelProgress = document.getElementById("level-progress");
  const levelStatus = document.getElementById("level-status");
  const leaderboardList = document.getElementById("leaderboard-list");
  const completeButtons = document.querySelectorAll(".complete-btn");

  // Load points from localStorage
  let points = parseInt(localStorage.getItem("challengePoints")) || 0;

  // Update UI
  updatePointsDisplay();
  updateLevelProgress();
  displayLeaderboard();

  // Set up event listeners for challenge completion
  completeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const challengeCard = this.closest(".challenge-card");
      const challengeId = challengeCard.getAttribute("data-challenge");
      const pointsToAdd = parseInt(this.getAttribute("data-points"));

      // Check if challenge was already completed today
      const completedChallenges =
        JSON.parse(localStorage.getItem("completedChallenges")) || {};
      const today = new Date().toISOString().split("T")[0];

      if (completedChallenges[challengeId] === today) {
        alert("You've already completed this challenge today!");
        return;
      }

      // Add points
      points += pointsToAdd;
      localStorage.setItem("challengePoints", points);

      // Mark challenge as completed
      completedChallenges[challengeId] = today;
      localStorage.setItem(
        "completedChallenges",
        JSON.stringify(completedChallenges)
      );

      // Update UI
      updatePointsDisplay();
      updateLevelProgress();
      displayLeaderboard();

      // Disable button
      this.disabled = true;
      this.textContent = "Completed Today";

      // Show animation
      const animation = document.createElement("div");
      animation.className = "points-animation";
      animation.textContent = `+${pointsToAdd}`;
      challengeCard.appendChild(animation);

      setTimeout(() => {
        animation.remove();
      }, 1500);
    });
  });

  function updatePointsDisplay() {
    userPoints.textContent = points;
  }

  function updateLevelProgress() {
    // Define levels
    const levels = [
      { name: "Eco Rookie", threshold: 0 },
      { name: "Green Beginner", threshold: 100 },
      { name: "Sustainability Enthusiast", threshold: 250 },
      { name: "Eco Warrior", threshold: 500 },
      { name: "Sustainability Champion", threshold: 1000 },
      { name: "Planet Protector", threshold: 2000 },
    ];

    // Find current level
    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = 1; i < levels.length; i++) {
      if (points >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
      } else {
        nextLevel = levels[i];
        break;
      }
    }

    // Update progress bar
    const progress =
      nextLevel === currentLevel
        ? 100
        : ((points - currentLevel.threshold) /
            (nextLevel.threshold - currentLevel.threshold)) *
          100;

    levelProgress.style.width = `${progress}%`;
    levelStatus.textContent = `Level ${levels.indexOf(currentLevel) + 1}: ${
      currentLevel.name
    }`;

    // Check if challenges are already completed today
    const completedChallenges =
      JSON.parse(localStorage.getItem("completedChallenges")) || {};
    const today = new Date().toISOString().split("T")[0];

    // Update challenge buttons
    completeButtons.forEach((button) => {
      const challengeId = button
        .closest(".challenge-card")
        .getAttribute("data-challenge");

      if (completedChallenges[challengeId] === today) {
        button.disabled = true;
        button.textContent = "Completed Today";
      } else {
        button.disabled = false;
        button.textContent = "Mark Complete";
      }
    });
  }

  function displayLeaderboard() {
    leaderboardList.innerHTML = "";

    // Combine user with mock leaderboard data
    const leaderboard = [{ name: "You", points: points }, ...leaderboardData];

    // Sort by points (highest first)
    leaderboard.sort((a, b) => b.points - a.points);

    // Display top 10
    leaderboard.slice(0, 10).forEach((user, index) => {
      const leaderboardItem = document.createElement("div");
      leaderboardItem.className = "leaderboard-item";
      leaderboardItem.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${user.name}</div>
                <div class="leaderboard-points">${user.points}</div>
            `;

      // Highlight user's position
      if (user.name === "You") {
        leaderboardItem.classList.add("highlight");
      }

      leaderboardList.appendChild(leaderboardItem);
    });
  }
}

// Grocery Scanner functionality
function initGroceryScanner() {
  const barcodeForm = document.getElementById("barcode-form");
  const productResult = document.getElementById("product-result");
  const productAlternatives = document.getElementById("product-alternatives");
  const sampleBarcodes = document.querySelectorAll(".sample-barcode");

  barcodeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const barcode = document.getElementById("barcode-input").value;

    if (barcode) {
      // Show loading state
      productResult.innerHTML = "<p>Scanning product...</p>";
      productResult.classList.remove("hidden");
      productAlternatives.classList.add("hidden");

      // Fetch product data from Open Food Facts API
      fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 1) {
            displayProductResult(data.product);
          } else {
            productResult.innerHTML =
              "<p>Product not found. Please try another barcode.</p>";
          }
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
          productResult.innerHTML =
            "<p>Error fetching product data. Please try again later.</p>";
        });
    }
  });

  // Sample barcode buttons
  sampleBarcodes.forEach((button) => {
    button.addEventListener("click", function () {
      const barcode = this.getAttribute("data-barcode");
      document.getElementById("barcode-input").value = barcode;
      barcodeForm.dispatchEvent(new Event("submit"));
    });
  });

  function displayProductResult(product) {
    // Extract relevant information
    const name = product.product_name || "Unknown Product";
    const brand = product.brands || "Unknown Brand";
    const imageUrl = product.image_url || "/api/placeholder/160/160";
    const ecoScore = product.ecoscore_grade || "unknown";
    const nutritionGrade = product.nutrition_grade_fr || "unknown";

    // Determine sustainability factors
    const packaging = product.packaging || "No packaging information";
    const ingredients =
      product.ingredients_n || "Unknown number of ingredients";
    const origin = product.origins || "Unknown origin";

    // Create HTML
    productResult.innerHTML = `
            <div class="product-header">
                <img src="${imageUrl}" alt="${name}" class="product-image">
                <div class="product-details">
                    <h3>${name}</h3>
                    <p>${brand}</p>
                    <div>
                        Eco Score: 
                        <span class="eco-score ${
                          ecoScore !== "unknown" ? ecoScore.toLowerCase() : ""
                        }">${ecoScore.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            <div class="product-info">
                <div class="info-item">
                    <strong>Packaging:</strong> ${packaging}
                </div>
                <div class="info-item">
                    <strong>Ingredients:</strong> ${ingredients}
                </div>
                <div class="info-item">
                    <strong>Origin:</strong> ${origin}
                </div>
                <div class="info-item">
                    <strong>Nutrition Grade:</strong> ${nutritionGrade.toUpperCase()}
                </div>
            </div>
            <div class="sustainability-tips">
                <h4>Sustainability Assessment</h4>
                <p>${getSustainabilityAssessment(ecoScore)}</p>
            </div>
        `;

    // Show result and alternatives
    productResult.classList.remove("hidden");

    // Get product alternatives
    if (product.categories) {
      getProductAlternatives(product.categories);
    }
  }

  function getProductAlternatives(categories) {
    // In a real app, you would fetch alternatives from API
    // For this demo, we'll simulate it
    productAlternatives.innerHTML = "<h3>Sustainable Alternatives</h3>";
    const alternativesContainer = document.getElementById(
      "alternatives-container"
    );

    // Simulate loading alternatives
    alternativesContainer.innerHTML =
      "<p>Finding sustainable alternatives...</p>";

    setTimeout(() => {
      // Create mock alternatives
      const mockAlternatives = [
        {
          name: "Eco-friendly Alternative 1",
          brand: "Green Brand",
          ecoScore: "a",
          description: "Organic ingredients, recyclable packaging",
        },
        {
          name: "Sustainable Choice",
          brand: "Eco Products",
          ecoScore: "b",
          description: "Locally sourced, minimal packaging",
        },
        {
          name: "Planet-friendly Option",
          brand: "Earth First",
          ecoScore: "a",
          description: "Carbon neutral, biodegradable packaging",
        },
      ];

      // Display alternatives
      alternativesContainer.innerHTML = "";
      mockAlternatives.forEach((alt) => {
        const altItem = document.createElement("div");
        altItem.className = "alternative-item";
        altItem.innerHTML = `
                    <div class="alt-header">
                        <h4>${alt.name}</h4>
                        <span class="eco-score ${
                          alt.ecoScore
                        }">${alt.ecoScore.toUpperCase()}</span>
                    </div>
                    <p><strong>${alt.brand}</strong></p>
                    <p>${alt.description}</p>
                `;
        alternativesContainer.appendChild(altItem);
      });

      productAlternatives.classList.remove("hidden");
    }, 1500);
  }

  function getSustainabilityAssessment(ecoScore) {
    switch (ecoScore.toLowerCase()) {
      case "a":
        return "Excellent environmental impact. This product is produced sustainably with minimal environmental impact.";
      case "b":
        return "Good environmental impact. This product has a relatively low environmental footprint.";
      case "c":
        return "Moderate environmental impact. Consider alternatives with better eco-scores when possible.";
      case "d":
        return "High environmental impact. Look for more sustainable alternatives.";
      case "e":
        return "Very high environmental impact. We strongly recommend choosing more sustainable alternatives.";
      default:
        return "Environmental impact unknown. Limited sustainability information available for this product.";
    }
  }
}

// Helper functions
function getCarbonImpactMessage(carbonFootprint) {
  if (carbonFootprint < 0.5) {
    return "Low impact! Great choice for the planet.";
  } else if (carbonFootprint < 2) {
    return "Moderate impact. Consider lower-carbon alternatives occasionally.";
  } else if (carbonFootprint < 5) {
    return "High impact. Try to consume this food less frequently.";
  } else {
    return "Very high impact! This food has a significant carbon footprint.";
  }
}

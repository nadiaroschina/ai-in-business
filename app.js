// app.js (ES module version using transformers.js for local sentiment classification)

import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js";

// Global variables
let reviews = [];
let apiToken = ""; // kept for UI compatibility, but not used with local inference
let sentimentPipeline = null; // transformers.js text-classification pipeline

// DOM elements
const analyzeBtn = document.getElementById("analyze-btn");
const reviewText = document.getElementById("review-text");
const sentimentResult = document.getElementById("sentiment-result");
const loadingElement = document.querySelector(".loading");
const errorElement = document.getElementById("error-message");
const apiTokenInput = document.getElementById("api-token");
const statusElement = document.getElementById("status"); // optional status label for model loading
const actionResult = document.getElementById("action-result");

// logic for event logging
const LOGGING_ENDPOINT = "https://script.google.com/macros/s/AKfycbz9GzSPhbJKa8jRQq7NCLFKHDyi0hyrgIyMYJq9B62uZ0h5qDkXL0dMObZuyrDgDK4s/exec";

async function logAnalysisEvent({ review, sentimentLabel, confidence }) {
  const payload = {
    review,
    sentiment: {
      label: sentimentLabel,
      confidence
    },
    meta: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timestamp_client: new Date().toISOString(),
      model: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      app: "sentiment-analysis-github-pages"
    }
  };

  // Fire-and-forget logging
  fetch(LOGGING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(payload)
  }).catch((err) => {
    console.warn("Logging failed:", err);
  });
}


// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Load the TSV file (Papa Parse)
  loadReviews();

  // Set up event listeners
  analyzeBtn.addEventListener("click", analyzeRandomReview);
  apiTokenInput.addEventListener("change", saveApiToken);

  // Load saved API token if exists (not used with local inference but kept for UI)
  const savedToken = localStorage.getItem("hfApiToken");
  if (savedToken) {
    apiTokenInput.value = savedToken;
    apiToken = savedToken;
  }

  // Initialize transformers.js sentiment model
  initSentimentModel();
});

// Initialize transformers.js text-classification pipeline with a supported model
async function initSentimentModel() {
  try {
    if (statusElement) {
      statusElement.textContent = "Loading sentiment model...";
    }

    // Use a transformers.js-supported text-classification model.
    // Xenova/distilbert-base-uncased-finetuned-sst-2-english is a common choice.
    sentimentPipeline = await pipeline(
      "text-classification",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );

    if (statusElement) {
      statusElement.textContent = "Sentiment model ready";
    }
  } catch (error) {
    console.error("Failed to load sentiment model:", error);
    showError(
      "Failed to load sentiment model. Please check your network connection and try again."
    );
    if (statusElement) {
      statusElement.textContent = "Model load failed";
    }
  }
}

// Load and parse the TSV file using Papa Parse
function loadReviews() {
  fetch("reviews_test.tsv")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load TSV file");
      }
      return response.text();
    })
    .then((tsvData) => {
      Papa.parse(tsvData, {
        header: true,
        delimiter: "\t",
        complete: (results) => {
          reviews = results.data
            .map((row) => row.text)
            .filter((text) => typeof text === "string" && text.trim() !== "");
          console.log("Loaded", reviews.length, "reviews");
        },
        error: (error) => {
          console.error("TSV parse error:", error);
          showError("Failed to parse TSV file: " + error.message);
        },
      });
    })
    .catch((error) => {
      console.error("TSV load error:", error);
      showError("Failed to load TSV file: " + error.message);
    });
}

// Save API token to localStorage (UI compatibility; not used with local inference)
function saveApiToken() {
  apiToken = apiTokenInput.value.trim();
  if (apiToken) {
    localStorage.setItem("hfApiToken", apiToken);
  } else {
    localStorage.removeItem("hfApiToken");
  }
}

// Analyze a random review
function analyzeRandomReview() {
  hideError();

  if (!Array.isArray(reviews) || reviews.length === 0) {
    showError("No reviews available. Please try again later.");
    return;
  }

  if (!sentimentPipeline) {
    showError("Sentiment model is not ready yet. Please wait a moment.");
    return;
  }

  const selectedReview =
    reviews[Math.floor(Math.random() * reviews.length)];

  // Display the review
  reviewText.textContent = selectedReview;

  // Show loading state
  loadingElement.style.display = "block";
  analyzeBtn.disabled = true;
  sentimentResult.innerHTML = ""; // Reset previous result
  sentimentResult.className = "sentiment-result"; // Reset classes

  // Call local sentiment model (transformers.js)
  analyzeSentiment(selectedReview)
    .then((result) => displaySentiment(result))
    .catch((error) => {
      console.error("Error:", error);
      showError(error.message || "Failed to analyze sentiment.");
    })
    .finally(() => {
      loadingElement.style.display = "none";
      analyzeBtn.disabled = false;
    });
}

// Call local transformers.js pipeline for sentiment classification
async function analyzeSentiment(text) {
  if (!sentimentPipeline) {
    throw new Error("Sentiment model is not initialized.");
  }

  // transformers.js text-classification pipeline returns:
  // [{ label: 'POSITIVE', score: 0.99 }, ...]
  const output = await sentimentPipeline(text);

  if (!Array.isArray(output) || output.length === 0) {
    throw new Error("Invalid sentiment output from local model.");
  }

  // Wrap to match [[{ label, score }]] shape expected by displaySentiment
  return [output];
}

// Display sentiment result
function displaySentiment(result) {
  // Default to neutral if we can't parse the result
  let sentiment = "neutral";
  let score = 0.5;
  let label = "NEUTRAL";

  // Expected format: [[{label: 'POSITIVE', score: 0.99}]]
  if (
    Array.isArray(result) &&
    result.length > 0 &&
    Array.isArray(result[0]) &&
    result[0].length > 0
  ) {
    const sentimentData = result[0][0];

    if (sentimentData && typeof sentimentData === "object") {
      label =
        typeof sentimentData.label === "string"
          ? sentimentData.label.toUpperCase()
          : "NEUTRAL";
      score =
        typeof sentimentData.score === "number"
          ? sentimentData.score
          : 0.5;

      // Determine sentiment bucket
      if (label === "POSITIVE" && score > 0.5) {
        sentiment = "positive";
      } else if (label === "NEGATIVE" && score > 0.5) {
        sentiment = "negative";
      } else {
        sentiment = "neutral";
      }
    }
  }

  // Update UI
  sentimentResult.classList.add(sentiment);
  sentimentResult.innerHTML = `
        <i class="fas ${getSentimentIcon(sentiment)} icon"></i>
        <span>${label} (${(score * 100).toFixed(1)}% confidence)</span>
    `;

  // ===============================
  // BUSINESS DECISION TRIGGER
  // ===============================
  const decision = determineBusinessAction(score, label);

  // Update UI: Show action section
  if (actionResult) {
      actionResult.style.display = "block";
      actionResult.style.border = `2px solid ${decision.color}`;
      actionResult.style.padding = "15px";
      actionResult.style.marginTop = "15px";
      actionResult.style.borderRadius = "8px";

      actionResult.innerHTML = `
        <div style="color:${decision.color}; font-weight:bold; font-size:18px;">
          ${decision.emoji} ${decision.uiMessage}
        </div>
        <button 
          style="
            margin-top:10px;
            padding:8px 16px;
            background:${decision.color};
            color:white;
            border:none;
            border-radius:5px;
            cursor:pointer;
          "
        >
          ${decision.actionCode}
        </button>
      `;
    }

  // log to google sheets
  logAnalysisEvent({
    review: reviewText.textContent,
    sentimentLabel: label,
    confidence: score
  });
}

// Get appropriate icon for sentiment bucket
function getSentimentIcon(sentiment) {
  switch (sentiment) {
    case "positive":
      return "fa-thumbs-up";
    case "negative":
      return "fa-thumbs-down";
    default:
      return "fa-question-circle";
  }
}

// Determine business action based on sentiment score and label
function determineBusinessAction(score, label) {
  let actionCode = "";
  let uiMessage = "";
  let color = "";
  let emoji = "";

  if (score >= 0.7 && score <= 1.0 && label === "NEGATIVE") {
    actionCode = "OFFER_COUPON";
    uiMessage = "We're really sorry about your experience. Please accept a 50% discount for your next purchase as an apology.";
    color = "#e74c3c"; // red
    emoji = "🚨";
  }

  else if (score >= 0.7 && score <= 1.0 && label === "POSITIVE") {
    actionCode = "ASK_REFERRAL";
    uiMessage = "We're thrilled you enjoyed it! Refer a friend and earn rewards.";
    color = "#27ae60"; // green
    emoji = "⭐";
  }

  else if (score < 0.4) {
    actionCode = "REQUEST_FEEDBACK";
    uiMessage = "We’d love to understand your experience better. Please complete our short survey.";
    color = "#f39c12"; // orange
    emoji = "📝";
  }

  else {
    // fallback safety (important for production stability)
    actionCode = "NO_ACTION";
    uiMessage = "Thank you for your feedback.";
    color = "#7f8c8d"; // gray
    emoji = "ℹ️";
  }

  return {
    actionCode,
    uiMessage,
    color,
    emoji
  };
}

// Show error message
function showError(message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Hide error message
function hideError() {
  errorElement.style.display = "none";
}

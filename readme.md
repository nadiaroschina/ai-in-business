# logging sheet

https://docs.google.com/spreadsheets/d/1Xaqm5eNIFRZVNP7EdBmw3V1o_ZpfO7kImVcXvFItnjA/edit?usp=sharing

backend: sheet & script https://docs.google.com/spreadsheets/d/1Xaqm5eNIFRZVNP7EdBmw3V1o_ZpfO7kImVcXvFItnjA/edit?usp=sharing

# prompt
```
# context 
i have built a browser-based sentiment analysis app that: 
    * Selects a review (e.g., random sample) 
    * Classifies it as POSITIVE or NEGATIVE 
    * Displays confidence score
    * Logs every inference event for analysis
each click produces a logged, analyzable event stored in Google Sheets
    
Architecture: Static Frontend (GitHub Pages) + Client-side ML model (runs in browser) + Google Apps Script Web App (logging endpoint) + Google Sheets (event storage)

Execution Flow:
    1. User clicks button 
    2. Review is selected 
    3. ML model runs inference in browser 
    4. Sentiment + confidence displayed 
    5. App sends **simple POST (text/plain)** to Apps Script 
    6. doPost() parses JSON 
    7. Row appended to Google Sheet. each row contains: * Server timestamp * Review text * Sentiment JSON * Meta JSON (device, model info, etc.) 
    
Your task is to implement an Automated Decision Logic that triggers specific business actions based on the AI's analysis.

business logic:

confidently negative review -- OFFER_COUPON (apology)
neutral review or low confidence -- REQUEST_FEEDBACK (ask for more feedback)
confidently positive review -- ASK_REFERRAL (offer to make a referral)

# instructions steps:
    * Step A: Logic Function Write a function determineBusinessAction(score, label) that returns the Action Code, UI Message, and Color.
    * Step B: UI Update Modify your HTML/JS so that after the API responds, a new section (e.g., <div id="action-result">) appears displaying the correct message and style defined in your logic. 
    * Step C: Enhanced Logging Update your Google Sheets App Script and Frontend code to send an extra column: Old Columns: timestamp, review, sentiment, confidence New Column: action_taken (e.g., "OFFER_COUPON")

# format:
we will go step by step, starting from step a. i will send you the existing code and you will tell what to update and how to re-run my code.
```

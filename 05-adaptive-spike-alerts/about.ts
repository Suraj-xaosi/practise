// # Exercise 5: Detect traffic spikes and notify users
// 
// ## Interviewer brief
// 
// “Build a scheduled job that detects when a site's recent visitor count is unusually high, adapts its expected baseline over time, and sends an alert. Quiet sites should drift down gradually, while a real spike should not cause one notification per event.”
// 
// ## Clarify before coding
// 
// - What is the observation window and unit (events, sessions, or unique visitors)?
// - When is a count unusual enough to alert?
// - How quickly should the baseline adapt up or down?
// - How do you prevent duplicate alerts when jobs overlap or retry?
// - What happens if notification delivery fails after the baseline is updated?
// 
// ## Acceptance criteria
// 
// - Count unique visitors within a well-defined time window.
// - Keep baseline changes bounded and non-negative.
// - Separate detection from notification delivery.
// - Make scheduled execution and notification processing retry-safe.
// - Limit work to active domains and expose enough metrics to debug missed/duplicate alerts.
// 
// ## Follow-up questions
// 
// - Why can a simple multiplicative baseline be noisy?
// - How would you reduce false positives for weekly seasonality?
// - How would you guarantee an alert is not lost between DB update and queue publish?
// 
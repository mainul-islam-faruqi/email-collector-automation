# Email Automation System

A comprehensive automation system that handles both email collection and outreach campaigns. The system first scrapes emails from business websites, then manages the complete email campaign lifecycle from initial contact to follow-up sequences.

## Key Features

### 1. Automated Email Collection
- Scrapes emails from business websites automatically
- Supports bulk website processing
- Intelligent email extraction from various website structures
- Saves enriched business data with collected emails

### 2. Smart Email Validation
- Validates extracted and existing emails
- Filters out:
  - System-generated emails (e.g., @sentry.io)
  - Numeric-prefix emails (e.g., 123@domain.com)
  - Invalid format emails
  - Generic/placeholder emails
- Ensures high-quality business contacts

### 3. Campaign Management
- Manages multiple campaigns simultaneously
- Tracks campaign progress and statistics
- Maintains campaign history and state
- Supports city-specific customization

### 4. Follow-up System
- Automated follow-up sequences
  - First follow-up: 2 days after initial
  - Second follow-up: 4 days after initial
  - Final follow-up: 7 days after initial
- Different templates for each stage
- Prevents duplicate emails

## Setup

1. Install dependencies:
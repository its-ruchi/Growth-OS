---
description: Generate LinkedIn posts using the ghostwriter system
---

# LinkedIn Ghostwriter Workflow

This workflow helps you generate high-performing LinkedIn content using the advanced ghostwriting system.

## Usage

### Step 1: Choose Your Mode

**With Writing Samples** (Recommended for best voice matching):
- Run: `python test_ghostwriter.py`
- Modify the `samples` list with your actual writing samples
- The system will analyze your voice and generate content in your style

**Without Writing Samples** (Quick start):
- Choose from 6 content styles: storyteller, educator, contrarian, data_driven, tactical, transparent
- The system builds a voice profile from scratch based on your style preference

### Step 2: Customize Your Context

Edit these parameters in the test script:

```python
who_they_are = "Your role and expertise"  # e.g., "SaaS founder and growth expert"
target_audience = "Who you're targeting"  # e.g., "B2B founders" 
goal = "Your #1 objective"  # e.g., "Generate leads", "Build authority", "Attract partnerships"
content_style = "Your preferred style"  # Only for no-samples mode
experience = "Your real story or insight"  # Must include specific numbers/named examples
```

### Step 3: Run the Generator

```bash
cd "c:/Users/RUCHI BHILARE/Downloads/linkedin-growth-os"
python test_ghostwriter.py
```

### Step 4: Review and Deploy

The system outputs:
- **Voice Analysis** (samples mode only): Your unique writing fingerprint
- **Generated Post**: Algorithm-optimized LinkedIn content
- **Performance Prediction**: Why the post will perform
- **Posting Tips**: 2026 algorithm best practices
- **Engagement Strategy**: How to maximize reach

## Content Guidelines

### Must-Have Elements
- **Specific Numbers**: At least one concrete metric ($50k, 340%, 3 weeks, etc.)
- **Real Experience**: Use actual stories, not hypothetical scenarios
- **Niche Focus**: Target specific audience, not broad advice
- **Strong Hook**: First line must stop the scroll

### Forbidden Elements
- External links in post body (put in first comment only)
- Generic phrases: "game-changer", "passionate about", "excited to share"
- Engagement bait: "comment YES if you agree"
- More than 3 hashtags
- Long paragraphs (max 2 lines each)

## Algorithm Optimization

The system automatically applies 2026 LinkedIn rules:
- Document/carousel format for educational content
- Strong opinions for contrarian content  
- Specific details for authenticity
- Genuine questions for engagement
- Strategic hashtag usage (max 3, highly relevant)

## Performance Tracking

After posting:
1. Monitor first 60 minutes for comments
2. Reply to every comment quickly
3. Pin the most engaging comment
4. Track saves and shares
5. Document results for next post optimization

## Integration with Web App

To integrate with the React frontend:
1. Import the ghostwriter module
2. Create API endpoints for post generation
3. Add UI for sample input and style selection
4. Include performance analytics dashboard

## Troubleshooting

**Low Word Count**: Add more specific details to your experience
**Generic Output**: Include more personal stories and named examples
**Wrong Format**: Check content style matches your goal
**Poor Hook**: Ensure first line is surprising or contrarian

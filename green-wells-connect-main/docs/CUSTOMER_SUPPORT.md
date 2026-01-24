# Customer Support System Documentation

## Overview

The Green Wells LPG platform now includes a comprehensive customer support system designed to simplify how customers reach out for help, provide feedback, and get assistance in their preferred language.

## Features

### 1. Support Hub (`/support`)

The Support Hub is the central location for all customer support needs, organized into four main tabs:

#### Overview Tab
- Quick access to all support features
- Statistics on active tickets
- One-click access to create tickets, start chat, or browse help articles

#### My Tickets Tab
- View all support tickets you've created
- Create new support tickets with:
  - Subject and detailed description
  - Category (Order Issue, Payment, Delivery, Technical, Safety, General)
  - Priority (Low, Medium, High, Urgent)
  - Automatic ticket number generation (format: TKT-YYYYMMDD-0001)
- Track ticket status:
  - Open (newly created)
  - In Progress (being worked on)
  - Waiting Customer (needs your input)
  - Resolved (solution provided)
  - Closed (ticket completed)
- View conversation threads within each ticket

#### Live Chat Tab
- 24/7 AI-powered chat support
- Instant responses to common questions
- Bilingual support (English and Swahili)
- Smart responses based on:
  - Order inquiries
  - Payment questions
  - Delivery tracking
  - General support
- Chat history saved per session
- Easy escalation to human agents

#### Help Center Tab
- Searchable FAQ database
- Pre-populated with 10+ articles in each language
- Categories include:
  - Ordering process
  - Payment methods
  - Delivery information
  - Safety guidelines
  - Technical support
  - General inquiries
- Vote on article helpfulness
- View count tracking

### 2. Feedback Dashboard (`/feedback`)

A comprehensive feedback collection and analytics system:

#### Submit Feedback
- 5-star rating system
- Category selection:
  - Customer Service
  - Delivery Experience
  - Product Quality
  - Support
  - App Experience
  - Overall
- Optional detailed comments
- Automatic sentiment analysis

#### Analytics Dashboard
- Total feedback count
- Average rating calculation
- Satisfaction rate percentage
- Sentiment breakdown (Positive, Neutral, Negative)
- Rating distribution (1-5 stars)
- Visual progress bars and charts
- Filter by sentiment type

#### Feedback History
- View all your submitted feedback
- See rating, category, and sentiment
- Track when feedback was submitted
- Filter by sentiment (all, positive, neutral, negative)

### 3. Multilingual Support

The entire platform supports multiple languages with easy switching:

#### Supported Languages
- **English (en)**: Default language
- **Swahili (sw)**: Full translation support

#### Translation Features
- UI element translations
- FAQ articles in both languages
- Support ticket language preference
- Chat responses in user's language
- Date, time, and currency formatting based on locale
- Language preference saved in browser

#### Using Multilingual Features
1. Click the language selector (English/Kiswahili)
2. Choose your preferred language
3. All content updates automatically
4. Preference is saved for future visits

## Database Schema

### Support Tickets
```sql
support_tickets
├── id (UUID, Primary Key)
├── user_id (Foreign Key to users)
├── ticket_number (Auto-generated, Unique)
├── subject (VARCHAR 255)
├── description (TEXT)
├── category (ENUM: order_issue, payment, delivery, technical, general, safety, feedback)
├── priority (ENUM: low, medium, high, urgent)
├── status (ENUM: open, in_progress, waiting_customer, resolved, closed)
├── assigned_to (Foreign Key to users, nullable)
├── order_id (Foreign Key to orders, nullable)
├── language (VARCHAR 10)
├── created_at (Timestamp)
├── updated_at (Timestamp)
├── resolved_at (Timestamp, nullable)
└── closed_at (Timestamp, nullable)
```

### Support Ticket Messages
```sql
support_ticket_messages
├── id (UUID, Primary Key)
├── ticket_id (Foreign Key to support_tickets)
├── user_id (Foreign Key to users)
├── message (TEXT)
├── is_staff_response (BOOLEAN)
├── attachments (JSONB)
└── created_at (Timestamp)
```

### Customer Feedback
```sql
customer_feedback
├── id (UUID, Primary Key)
├── user_id (Foreign Key to users)
├── order_id (Foreign Key to orders, nullable)
├── rating (INTEGER 1-5)
├── category (ENUM: service, delivery, product, support, app_experience, overall)
├── comment (TEXT, nullable)
├── sentiment (ENUM: positive, neutral, negative)
├── is_public (BOOLEAN)
└── created_at (Timestamp)
```

### Chat Sessions
```sql
chat_sessions
├── id (UUID, Primary Key)
├── user_id (Foreign Key to users)
├── session_type (ENUM: ai, human, escalated)
├── status (ENUM: active, waiting, closed)
├── assigned_agent_id (Foreign Key to users, nullable)
├── language (VARCHAR 10)
├── started_at (Timestamp)
├── ended_at (Timestamp, nullable)
└── satisfaction_rating (INTEGER 1-5, nullable)
```

### Chat Messages
```sql
chat_messages
├── id (UUID, Primary Key)
├── session_id (Foreign Key to chat_sessions)
├── sender_type (ENUM: customer, ai, agent)
├── message (TEXT)
├── metadata (JSONB)
└── created_at (Timestamp)
```

### FAQ Articles
```sql
faq_articles
├── id (UUID, Primary Key)
├── category (VARCHAR 50)
├── question (TEXT)
├── answer (TEXT)
├── language (VARCHAR 10)
├── tags (TEXT ARRAY)
├── view_count (INTEGER)
├── helpful_count (INTEGER)
├── not_helpful_count (INTEGER)
├── is_published (BOOLEAN)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

### Content Translations
```sql
content_translations
├── id (UUID, Primary Key)
├── content_type (VARCHAR 50)
├── content_key (VARCHAR 255)
├── language (VARCHAR 10)
├── translated_text (TEXT)
├── created_at (Timestamp)
└── updated_at (Timestamp)
└── UNIQUE(content_type, content_key, language)
```

## Security Features

### Row-Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only view their own tickets and feedback
- Users can only create content associated with their account
- FAQ articles are publicly readable
- Chat messages are only visible to session participants

### Data Validation
- Rating values are constrained to 1-5
- Category and priority fields use ENUM constraints
- Required fields enforced at database level
- Proper foreign key relationships

### Audit Trail
- All records have timestamps
- Ticket status changes tracked
- Updated_at automatically maintained via triggers

## API Usage Examples

### Creating a Support Ticket

```typescript
const { data, error } = await supabase
  .from("support_tickets")
  .insert({
    user_id: user.id,
    subject: "Cannot place order",
    description: "I get an error when trying to place an order",
    category: "order_issue",
    priority: "high",
    language: "en"
  });
```

### Submitting Feedback

```typescript
const { data, error } = await supabase
  .from("customer_feedback")
  .insert({
    user_id: user.id,
    rating: 5,
    category: "delivery",
    comment: "Fast delivery, great service!",
    sentiment: "positive"
  });
```

### Starting a Chat Session

```typescript
const { data, error } = await supabase
  .from("chat_sessions")
  .insert({
    user_id: user.id,
    session_type: "ai",
    language: "sw"
  })
  .select()
  .single();
```

### Searching FAQs

```typescript
const { data, error } = await supabase
  .from("faq_articles")
  .select("*")
  .eq("language", "en")
  .eq("is_published", true)
  .ilike("question", "%order%")
  .order("view_count", { ascending: false });
```

## User Guide

### How to Get Support

1. **Via Support Hub**
   - Navigate to `/support`
   - Choose your preferred method:
     - Create a ticket for tracked support
     - Use live chat for immediate help
     - Browse FAQs for self-service

2. **Creating a Support Ticket**
   - Click "Create New Support Ticket"
   - Fill in:
     - Subject (brief description)
     - Category (what type of issue)
     - Priority (how urgent)
     - Detailed description
   - Submit and receive ticket number
   - Track progress in "My Tickets" tab

3. **Using Live Chat**
   - Click "Start Live Chat"
   - Type your question
   - Receive instant AI responses
   - Request human agent if needed

4. **Finding Help Articles**
   - Go to "Help Center" tab
   - Use search box to find topics
   - Browse by category
   - Vote if article was helpful

### How to Give Feedback

1. Navigate to `/feedback`
2. Click "Give Feedback"
3. Rate your experience (1-5 stars)
4. Select category
5. Add comments (optional)
6. Submit

View your feedback history and analytics on the same page.

### Changing Language

1. Click the language selector in the top-right
2. Choose between English and Kiswahili
3. All content updates automatically
4. Your preference is saved

## Best Practices

### For Users
- Provide detailed descriptions in tickets
- Select appropriate categories and priorities
- Use search before creating tickets
- Give feedback after orders
- Vote on helpful FAQ articles

### For Support Agents
- Respond to tickets promptly
- Update ticket status regularly
- Escalate high-priority issues
- Keep FAQ articles up to date
- Monitor feedback trends

## Troubleshooting

### Cannot Create Ticket
- Ensure you're logged in
- Check all required fields are filled
- Verify network connection

### Chat Not Responding
- Check your internet connection
- Refresh the page
- Clear browser cache

### Language Not Changing
- Clear browser cache
- Try different browser
- Check localStorage permissions

## Future Enhancements

1. **Email Notifications**
   - Ticket status updates
   - New messages on tickets
   - Feedback responses

2. **File Attachments**
   - Upload screenshots with tickets
   - Attach documents to feedback

3. **Video Chat**
   - Live video support for complex issues
   - Screen sharing capabilities

4. **Advanced Analytics**
   - Sentiment trends over time
   - Response time metrics
   - Customer satisfaction scores

5. **Knowledge Base**
   - Video tutorials
   - Step-by-step guides
   - Interactive walkthroughs

6. **Community Forum**
   - Peer-to-peer support
   - Discussion threads
   - Solved solutions database

## Support

For technical issues with the support system itself, please contact:
- Email: support@greenwells.co.ke
- Phone: 0700 000 000
- Available: 24/7

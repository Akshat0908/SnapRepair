# Snap Repair - Complete MVP

A complete no-code style web application that helps users fix household and device issues through photo/video submissions, AI diagnosis, and expert consultations.


<img width="1470" height="836" alt="Screenshot 2025-11-28 at 11 57 46 PM" src="https://github.com/user-attachments/assets/22087562-5145-49da-a40f-c8e17d9f94ce" />


## Features Implemented

### User Features
- **Landing Page**: Beautiful hero section with features, testimonials, pricing, and footer
- **Authentication**: Email/password signup and login system
- **Issue Submission**: Upload photos or videos of problems with device selection
- **AI Diagnosis**: Instant AI-generated troubleshooting and safety warnings
- **Real-time Chat**: Message experts about your issues
- **Payment Integration**: Demo payment system for remote consultations (₹199)
- **Issue Tracking**: View all your submitted issues and their status
- **Feedback System**: Rate your experience after issue resolution (1-5 stars)

### Expert Features
- **Expert Dashboard**: View and manage all user issues
- **Filter by Status**: Filter issues by open, expert_reply, closed, etc.
- **Message Users**: Send expert advice and guidance
- **Close Issues**: Mark issues as resolved

### Technical Features
- **Database**: Complete Supabase schema with RLS policies
- **Storage**: Media upload with secure storage bucket
- **Real-time Updates**: Live message updates using Supabase subscriptions
- **Responsive Design**: Mobile-friendly interface
- **Type Safety**: Full TypeScript implementation



<img width="1464" height="645" alt="Screenshot 2025-11-28 at 11 58 47 PM" src="https://github.com/user-attachments/assets/acc5d363-a21c-46c2-be31-6b3fe8dd7679" />




## Database Schema

### Tables
1. **profiles** - User information linked to auth
2. **issues** - Core issue tracking with status workflow
3. **messages** - Chat messages between users and experts
4. **payments** - Payment transaction records
5. **feedback** - User ratings and comments

### Issue Status Workflow
- `pending` → Issue being processed
- `open` → AI diagnosis complete, awaiting user action
- `expert_reply` → Expert has responded
- `consultation_paid` → User paid for consultation
- `closed` → Issue resolved

## Getting Started

### Environment Setup
Your `.env` file should contain:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Application
```bash
npm install
npm run dev
```

### Testing Expert Features
To test the expert dashboard, you need to manually set a user as an expert in the database:

```sql
UPDATE profiles
SET is_expert = true
WHERE email = 'your-expert-email@example.com';
```

## User Flow

1. **User visits landing page** → Views features and pricing
2. **User signs up/logs in** → Creates account
3. **User submits issue** → Uploads photo/video with description
4. **AI processes issue** → Generates diagnosis instantly
5. **User views status page** → Sees AI diagnosis and can chat
6. **Expert reviews issue** → Sends custom advice via chat
7. **User books consultation** → Pays ₹199 for video call
8. **Issue resolved** → User leaves feedback

## Features Breakdown

### Landing Page
- Hero section with clear value proposition
- How It Works section (3 steps)
- Why It Works section (4 benefits)
- Testimonials with 5-star ratings
- Pricing table (Free, ₹199, ₹399+)
- Footer with navigation

### Authentication
- Email/password signup with name and phone
- Login for returning users
- Secure session management
- Profile creation on signup

### Submit Issue
- Photo or video upload (max 50MB)
- Device type dropdown selection
- Description textarea
- Instant AI diagnosis generation
- Automatic status tracking

### Issue Status Page
- Issue details with media preview
- AI diagnosis display
- Real-time chat interface
- Status timeline
- Upgrade to consultation CTA
- Feedback option when closed

### Expert Dashboard
- List of all issues with filters
- Detailed issue view
- Send expert advice
- Mark issues as closed
- Real-time message updates

### Payment Page
- Consultation details
- Price breakdown
- Demo payment processing
- Success confirmation

### Feedback Form
- 5-star rating system
- Optional comment field
- Thank you confirmation

## AI Diagnosis Format

The AI diagnosis includes:
- Device type identification
- Top 3 likely causes
- Safety warnings
- DIY troubleshooting steps (3-5)
- Recommended action (self-fix/consult/on-site)
- Estimated cost range

## Payment Integration Note

This demo uses simulated payments. For production:
1. Integrate Stripe or Razorpay
2. Set up webhook handlers
3. Implement secure payment processing
4. See: https://bolt.new/setup/stripe

## Security Features

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Experts have elevated permissions
- Secure media storage with access policies
- Authentication required for all actions

## Technologies Used

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **Real-time**: Supabase Subscriptions

## Production Checklist

- [ ] Set up real AI integration (OpenAI GPT-4 Vision, etc.)
- [ ] Integrate real payment processor (Stripe/Razorpay)
- [ ] Set up email notifications
- [ ] Add video call integration (Zoom/Google Meet)
- [ ] Implement file compression for uploads
- [ ] Add image optimization
- [ ] Set up error logging (Sentry)
- [ ] Configure domain and SSL
- [ ] Add analytics tracking
- [ ] Create admin panel
- [ ] Add multi-language support
- [ ] Implement push notifications

## Deployment

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## License

This is a demo project for hackathon submission.

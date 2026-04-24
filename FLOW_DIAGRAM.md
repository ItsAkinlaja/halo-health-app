# Halo Health App - Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HALO HEALTH APP - COMPLETE FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  App Preloader   │  (3 seconds)
│   (Splash)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Welcome Screen   │  ← Premium green gradient design
│                  │  ← 4 feature cards
│  [Continue]      │  ← Language selection flow
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Language Select  │  ← 5 languages (EN, ES, FR, NL, PT)
│                  │  ← Instant language switching
│  [Done]          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Onboarding       │  ← 5-step preview
│ Preview          │  ← Animated cards
│  [Get Started]   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Onboarding       │  ← 8 steps total
│ Steps 1-8        │  ← Health goals, dietary prefs, etc.
│                  │  ← Data saved to AsyncStorage
│  [Continue]      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Register         │  ← Email, password, Halo Health ID
│                  │  ← Onboarding data included in metadata
│  [Create Account]│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify Email     │  ← 6-digit OTP
│ (OTP)            │  ← Email verification
│  [Verify]        │  ← Sets user state after success
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Medical          │  ← Important disclaimer
│ Disclaimer       │  ← Checkbox to accept
│  [Accept]        │  ← Navigate to ProfileSetup
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Profile Setup    │  ← ✨ NEW FEATURE ✨
│ (4 Steps)        │  ← CRITICAL FIX
│                  │
│ Step 1: Basic    │  ← Name, age, gender
│ Step 2: Goals    │  ← 6 health goals
│ Step 3: Diet     │  ← 12 dietary restrictions
│ Step 4: Allergy  │  ← 10 common allergies
│                  │
│ [Complete Setup] │  ← Creates profile in DB
└────────┬─────────┘  ← Sets as active profile
         │            ← Saves to AsyncStorage
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          HOME DASHBOARD                                       │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Good morning, John                              🔔  ⚙️              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ProfileSelector (NEW)                                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│  │  │ John Doe │  │ Jane Doe │  │  Child   │  │   Add    │           │    │
│  │  │    ●     │  │    ○     │  │    ○     │  │ Profile  │           │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Health Score                                    ┌─────────┐         │    │
│  │  Based on 5 recent scans                        │   85    │         │    │
│  │  ↗ +3 points this week                          │  ╱   ╲  │         │    │
│  │                                                  │ │     │ │         │    │
│  │  ─────────────────────────────────────────────  │  ╲   ╱  │         │    │
│  │  Food: 82  │  Beverages: 88  │  Personal: 85   └─────────┘         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🔍  Scan Product                                          →         │    │
│  │      Instant ingredient analysis                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  Recent Scans                                                  See all       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  85  │  Organic Almond Milk                              Excellent   │    │
│  │      │  Silk · Beverages                                 2h ago      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  72  │  Whole Wheat Bread                                Good        │    │
│  │      │  Dave's Killer Bread · Food                       5h ago      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  [Bottom Navigation]                                                          │
│  Home  │  Meals  │  🔍 Scan  │  Community  │  Profile                       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
         │
         │ Tap "Scan Product"
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SCANNER                                          │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ←  Scan Barcode                                              💡    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │                      [Camera View]                                   │    │
│  │                                                                       │    │
│  │                  ┌─────────────────┐                                 │    │
│  │                  │                 │                                 │    │
│  │                  │   Scan Frame    │  ← Uses activeProfile.id       │    │
│  │                  │                 │  ← NO MORE ERROR! ✅           │    │
│  │                  └─────────────────┘                                 │    │
│  │                                                                       │    │
│  │              Point at any product barcode                            │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Barcode │ Photo │ Search │ Menu                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
         │
         │ Barcode detected
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT DETAILS                                       │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ←  Product Analysis                                          ⋮      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  [Product Image]                                                     │    │
│  │                                                                       │    │
│  │  Organic Almond Milk                                                 │    │
│  │  Silk                                                                │    │
│  │                                                                       │    │
│  │  Health Score: 85                                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ ████████████████████████████████████████░░░░░░░░░░░░░░░░░░ │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                       │    │
│  │  ✅ No harmful ingredients                                           │    │
│  │  ✅ Matches your dietary preferences                                 │    │
│  │  ⚠️  Contains tree nuts (almond)                                     │    │
│  │                                                                       │    │
│  │  Ingredients: Almondmilk (Filtered Water, Almonds), ...             │    │
│  │                                                                       │    │
│  │  Nutrition Facts                                                     │    │
│  │  Calories: 30  │  Protein: 1g  │  Fat: 2.5g  │  Carbs: 1g          │    │
│  │                                                                       │    │
│  │  [Save to Clean Choices]  [Find Alternatives]                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Key Flow Points

### ✅ What's Working:
1. **Complete Registration Flow** - All steps functional
2. **Profile Creation** - 4-step wizard saves to database
3. **Profile Loading** - Loads from backend on dashboard
4. **Profile Selection** - Switch between profiles
5. **Scanner Integration** - Uses active profile for scans
6. **Scan History** - Profile-specific scan data

### 🔧 What's Next:
1. **Product Database** - Integrate Open Food Facts API
2. **Health Score** - Calculate based on ingredients
3. **Ingredient Analysis** - Detect harmful additives
4. **Alternative Suggestions** - Find better products
5. **Meal Planning** - AI-generated meal plans
6. **Social Features** - Community and sharing

### 🎯 Critical Success:
**The "No Profile Selected" bug is FIXED!**

Users can now:
- ✅ Create profiles after registration
- ✅ Select active profile
- ✅ Scan products successfully
- ✅ View scan history per profile
- ✅ Switch between family profiles

---

## Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  auth.users                                                      │
│  ├── id (UUID)                                                   │
│  ├── email                                                       │
│  ├── user_metadata (onboarding data)                            │
│  └── created_at                                                  │
│                                                                  │
│  health_profiles                                                 │
│  ├── id (UUID)                                                   │
│  ├── user_id → auth.users(id)                                   │
│  ├── name                                                        │
│  ├── age                                                         │
│  ├── gender                                                      │
│  ├── is_primary (boolean)                                       │
│  ├── health_goals (array)                                       │
│  └── created_at                                                  │
│                                                                  │
│  dietary_restrictions                                            │
│  ├── id (UUID)                                                   │
│  ├── profile_id → health_profiles(id)                           │
│  ├── restriction_type                                            │
│  └── severity                                                    │
│                                                                  │
│  allergies_intolerances                                          │
│  ├── id (UUID)                                                   │
│  ├── profile_id → health_profiles(id)                           │
│  ├── allergy_type                                                │
│  └── severity                                                    │
│                                                                  │
│  products                                                        │
│  ├── id (UUID)                                                   │
│  ├── barcode                                                     │
│  ├── name                                                        │
│  ├── brand                                                       │
│  ├── ingredients (array)                                         │
│  ├── nutrition_info (jsonb)                                      │
│  └── health_score (0-100)                                        │
│                                                                  │
│  product_scans                                                   │
│  ├── id (UUID)                                                   │
│  ├── user_id → auth.users(id)                                   │
│  ├── profile_id → health_profiles(id)  ← CRITICAL LINK         │
│  ├── product_id → products(id)                                  │
│  ├── score_given                                                 │
│  └── created_at                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Flow

```
Frontend                    Backend                     Database
   │                           │                            │
   │  POST /api/profiles       │                            │
   ├──────────────────────────>│                            │
   │  {                         │  INSERT INTO              │
   │    name: "John",           │  health_profiles          │
   │    age: 30,                ├───────────────────────────>│
   │    gender: "male",         │                            │
   │    health_goals: [...]     │  <─────────────────────────┤
   │  }                         │  Profile created           │
   │  <──────────────────────────┤                            │
   │  { status: "success",      │                            │
   │    data: { id, ... } }     │                            │
   │                           │                            │
   │  GET /api/profiles        │                            │
   ├──────────────────────────>│                            │
   │  ?userId={uuid}            │  SELECT * FROM            │
   │                           │  health_profiles           │
   │                           ├───────────────────────────>│
   │                           │  <─────────────────────────┤
   │  <──────────────────────────┤  Profiles array           │
   │  { status: "success",      │                            │
   │    data: [...] }           │                            │
   │                           │                            │
   │  POST /api/scans/barcode  │                            │
   ├──────────────────────────>│                            │
   │  {                         │  INSERT INTO              │
   │    barcode: "123456",      │  product_scans            │
   │    profileId: "uuid"       ├───────────────────────────>│
   │  }                         │  WITH profile_id          │
   │                           │  <─────────────────────────┤
   │  <──────────────────────────┤  Scan saved               │
   │  { status: "success",      │                            │
   │    data: { scan, product } }│                            │
   │                           │                            │
```

---

**This flow diagram shows the complete user journey from app launch to successful product scanning, with the critical profile system integration that fixes the "No Profile Selected" bug.**

# Quick Start Guide - Testing New Features

## Prerequisites
- Backend server running on `http://localhost:3001`
- Frontend app running via Expo
- Database migrations applied
- Supabase configured

---

## Step 1: Run Database Migrations

```bash
# Navigate to project root
cd "Halo Health App"

# Apply migrations (using Supabase CLI or direct SQL)
# Option A: Supabase CLI
supabase db push

# Option B: Direct SQL execution
# Copy contents of these files and run in Supabase SQL Editor:
# - migrations/012_restaurants_water_supplements.sql
# - migrations/013_seed_restaurants_water_supplements.sql
```

---

## Step 2: Start Backend Server

```bash
cd backend
npm install  # if not already done
npm run dev
```

Verify backend is running:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

## Step 3: Start Frontend App

```bash
cd frontend
npm install  # if not already done
npm start
```

---

## Step 4: Test Restaurant Finder

### Via Home Dashboard
1. Open app and login
2. Tap "Restaurants" tile in Explore section
3. Should navigate to Restaurant Finder Map

### Features to Test
- ✅ Map loads with markers
- ✅ Search bar works
- ✅ Filter button visible
- ✅ "Search This Area" button works
- ✅ Tap marker to see restaurant details
- ✅ Restaurant card shows:
  - Name, address, rating
  - Seed Oil Free badge
  - Call, Directions, Details buttons

### API Test
```bash
# Search restaurants
curl "http://localhost:3001/api/restaurant/search?seedOilFree=true&latitude=37.7749&longitude=-122.4194&radius=10"

# Expected: Array of restaurants with seed_oil_free=true
```

---

## Step 5: Test Water Analysis

### Via Home Dashboard
1. Tap "Water & Filters" tile in Explore section
2. Should navigate to Water Analysis screen

### Features to Test
- ✅ Category tabs (Bottled, Filters, Purifiers)
- ✅ Search bar works
- ✅ Top rated products display
- ✅ Product cards show:
  - Name, brand, score
  - Contaminants, microplastics, PFAS data
  - Lab verified badge
  - "View Full Analysis" button
- ✅ Scan button in header

### API Test
```bash
# Get top rated bottled water
curl "http://localhost:3001/api/water/top-rated?category=bottled&limit=10"

# Search water products
curl "http://localhost:3001/api/water/search?category=filters&query=pure"

# Expected: Array of water products
```

---

## Step 6: Test Supplement Tracker

### Via Home Dashboard
1. Tap "Supplements" tile in Explore section
2. Should navigate to Supplement Tracker screen

### Features to Test
- ✅ Main tabs (My Supplements, Top Rated)
- ✅ Category chips (All, Protein, Vitamins, etc.)
- ✅ Search bar works
- ✅ Supplement cards show:
  - Name, brand, score
  - Purity score, heavy metals, fillers
  - Third-party tested badge
  - Last scanned date
  - "View Details" button
- ✅ Empty state with "Scan Now" button
- ✅ Scan button in header

### API Test
```bash
# Get top rated supplements
curl "http://localhost:3001/api/supplements/top-rated?category=protein&limit=10"

# Search supplements
curl "http://localhost:3001/api/supplements/search?category=vitamins&query=d3"

# Get user supplements (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/supplements/my-supplements"

# Expected: Array of supplements
```

---

## Step 7: Test Barcode Scanning Integration

### Water Product Scan
1. Navigate to Scanner screen
2. Scan barcode: `012345678901` (Mountain Spring Natural)
3. Should recognize as water product
4. Display water analysis results

### Supplement Scan
1. Navigate to Scanner screen
2. Scan barcode: `123456789001` (Whey Protein Isolate)
3. Should recognize as supplement
4. Display supplement analysis results
5. Automatically add to "My Supplements"

### API Test
```bash
# Scan water product (requires auth)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"barcode":"012345678901"}' \
  "http://localhost:3001/api/water/scan"

# Scan supplement (requires auth)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"barcode":"123456789001"}' \
  "http://localhost:3001/api/supplements/scan"
```

---

## Step 8: Verify Navigation Flow

### From Home Dashboard
```
Home → Restaurants → RestaurantFinder
Home → Water & Filters → WaterAnalysis
Home → Supplements → SupplementTracker
```

### From Scanner
```
Scanner → (scan water barcode) → WaterAnalysis
Scanner → (scan supplement barcode) → SupplementTracker
Scanner → RestaurantMenuScanner
```

---

## Common Issues & Solutions

### Issue: "Restaurant not found" or empty results
**Solution**: Ensure migrations ran successfully and seed data was inserted
```sql
-- Check if data exists
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM water_products;
SELECT COUNT(*) FROM supplements;
```

### Issue: API returns 401 Unauthorized
**Solution**: Ensure you're logged in and token is valid
```javascript
// Check AsyncStorage for token
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('supabase.auth.token');
console.log('Token:', token);
```

### Issue: Map not loading
**Solution**: 
1. Check Google Maps API key in app.json
2. Verify react-native-maps is installed
3. Check console for errors

### Issue: Search returns no results
**Solution**: 
1. Check network tab for API calls
2. Verify backend is running
3. Check database connection
4. Review query parameters

---

## Seed Data Reference

### Restaurants (5 total)
- The Clean Kitchen (seed oil free, organic)
- Pure Plate Bistro (seed oil free)
- Organic Harvest (seed oil free, organic)
- Vital Eats (seed oil free)
- Nourish Cafe (seed oil free, organic)

### Water Products (6 total)
- Mountain Spring Natural (bottled, score: 95)
- Alpine Pure Water (bottled, score: 92)
- Glacier Fresh (bottled, score: 88)
- ProFilter Max (filter, score: 92)
- UltraClean Filter (filter, score: 90)
- HomePure Purifier (purifier, score: 96)

### Supplements (6 total)
- Whey Protein Isolate (protein, score: 92)
- Vitamin D3 5000 IU (vitamins, score: 88)
- Omega-3 Fish Oil (omega3, score: 94)
- Magnesium Glycinate (minerals, score: 90)
- Pre-Workout Elite (preworkout, score: 85)
- Multivitamin Complete (vitamins, score: 87)

---

## Testing Checklist

### Restaurant Finder
- [ ] Map displays correctly
- [ ] Markers show on map
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Restaurant details display
- [ ] Navigation to restaurant works
- [ ] Reviews can be added (if implemented)

### Water Analysis
- [ ] Category tabs switch correctly
- [ ] Products display in each category
- [ ] Search returns relevant results
- [ ] Product details are accurate
- [ ] Scan button navigates to scanner
- [ ] Top rated products show correctly

### Supplement Tracker
- [ ] My Supplements tab works
- [ ] Top Rated tab works
- [ ] Category filtering works
- [ ] Search returns relevant results
- [ ] Empty state displays correctly
- [ ] Supplement cards show all data
- [ ] Scan button navigates to scanner

### Integration
- [ ] Home dashboard tiles navigate correctly
- [ ] Back navigation works
- [ ] Data persists across navigation
- [ ] Loading states display
- [ ] Error states display
- [ ] Refresh functionality works

---

## Performance Benchmarks

### Expected Response Times
- Restaurant search: < 500ms
- Water product search: < 300ms
- Supplement search: < 300ms
- Barcode scan: < 1000ms (including AI analysis)
- Top rated queries: < 200ms

### Database Query Optimization
All tables have proper indexes:
- Location-based queries (restaurants)
- Category filtering (water, supplements)
- Barcode lookups (all tables)
- User-specific queries (scans, user_supplements)

---

## Next Steps

After successful testing:
1. ✅ Verify all features work as expected
2. ✅ Test on both iOS and Android
3. ✅ Perform load testing with multiple users
4. ✅ Review and optimize slow queries
5. ✅ Add analytics tracking
6. ✅ Prepare for production deployment

---

## Support

For issues or questions:
1. Check console logs (frontend and backend)
2. Review API responses in network tab
3. Verify database state
4. Check documentation in `/docs` folder
5. Review implementation details in `RESTAURANT_WATER_SUPPLEMENT_IMPLEMENTATION.md`

---

**Implementation Status**: ✅ Complete
**Last Updated**: 2024
**Version**: 1.0.0

# Database Migration Guide for Travel Journal App

## Overview
This guide outlines the database changes needed to transform the existing social media app into a travel journal application.

## New Fields Added to Posts Collection

The following fields have been added to support travel journal functionality:

### Travel-Specific Fields

1. **journalTitle** (String, Optional)
   - Purpose: Catchy title for the travel journal entry
   - Example: "Amazing Adventure in Tokyo"
   - Index: Yes (for search functionality)

2. **source** (String, Optional)
   - Purpose: Starting location of the travel
   - Example: "New York"
   - Index: Yes (for location-based search)

3. **destination** (String, Optional)
   - Purpose: Destination location of the travel
   - Example: "Tokyo, Japan"
   - Index: Yes (for location-based search)

4. **dayNumber** (Integer, Optional)
   - Purpose: Track which day of the trip this entry represents
   - Example: 3 (for Day 3)
   - Default: 1

5. **duration** (String, Optional)
   - Purpose: Overall duration of the trip
   - Example: "5 days", "2 weeks"

### Journal Relationship Fields (Added for Flowchart Functionality)

6. **journalId** (String, Optional)
   - Purpose: Links activity posts to their parent journal
   - Example: "647f1234567890abcdef1234"
   - Index: Yes (for efficient journal-activity queries)

7. **activityDate** (String, Optional)
   - Purpose: Specific date when this activity occurred
   - Example: "2024-03-15"
   - Format: ISO date string (YYYY-MM-DD)
   - Index: Yes (for chronological sorting)

8. **isJournal** (Boolean, Required)
   - Purpose: Distinguishes journal headers from activity posts
   - Example: true for journal entries, false for activity posts
   - Default: false
   - Index: Yes (for efficient filtering)

### Additional Journal-Specific Fields

9. **startDate** (String, Optional)
   - Purpose: Trip start date for journal entries
   - Example: "2024-03-10"
   - Format: ISO date string (YYYY-MM-DD)

10. **endDate** (String, Optional)
    - Purpose: Trip end date for journal entries
    - Example: "2024-03-20"
    - Format: ISO date string (YYYY-MM-DD)

## Appwrite Database Configuration

### 1. Update Posts Collection

If using Appwrite, add these attributes to your existing posts collection:

```javascript
// Add these attributes to your posts collection
{
  key: 'journalTitle',
  type: 'string',
  size: 255,
  required: false,
  array: false
}

{
  key: 'source',
  type: 'string',
  size: 100,
  required: false,
  array: false
}

{
  key: 'destination',
  type: 'string',
  size: 100,
  required: false,
  array: false
}

{
  key: 'dayNumber',
  type: 'integer',
  required: false,
  array: false,
  min: 1,
  max: 365
}

{
  key: 'duration',
  type: 'string',
  size: 50,
  required: false,
  array: false
}

{
  key: 'journalId',
  type: 'string',
  size: 255,
  required: false,
  array: false
}

{
  key: 'activityDate',
  type: 'string',
  size: 20,
  required: false,
  array: false
}

{
  key: 'isJournal',
  type: 'boolean',
  required: true,
  array: false,
  default: false
}

{
  key: 'startDate',
  type: 'string',
  size: 20,
  required: false,
  array: false
}

{
  key: 'endDate',
  type: 'string',
  size: 20,
  required: false,
  array: false
}
```

### 2. Create Indexes for Search Performance

Create the following indexes for better search performance:

```javascript
// Index for journal title search
{
  key: 'journalTitle_index',
  type: 'key',
  attributes: ['journalTitle'],
  orders: ['ASC']
}

// Index for source location search
{
  key: 'source_index',
  type: 'key',
  attributes: ['source'],
  orders: ['ASC']
}

// Index for destination location search
{
  key: 'destination_index',
  type: 'key',
  attributes: ['destination'],
  orders: ['ASC']
}

// Compound index for route search
{
  key: 'route_index',
  type: 'key',
  attributes: ['source', 'destination'],
  orders: ['ASC', 'ASC']
}

// Index for journal relationship queries
{
  key: 'journalId_index',
  type: 'key',
  attributes: ['journalId'],
  orders: ['ASC']
}

// Index for activity date sorting
{
  key: 'activityDate_index',
  type: 'key',
  attributes: ['activityDate'],
  orders: ['ASC']
}

// Index for journal type filtering
{
  key: 'isJournal_index',
  type: 'key',
  attributes: ['isJournal'],
  orders: ['ASC']
}

// Compound index for journal activities (efficient flowchart queries)
{
  key: 'journal_activities_index',
  type: 'key',
  attributes: ['journalId', 'isJournal', 'dayNumber'],
  orders: ['ASC', 'ASC', 'ASC']
}

// Compound index for user journals
{
  key: 'user_journals_index',
  type: 'key',
  attributes: ['creator', 'isJournal'],
  orders: ['ASC', 'ASC']
}
```

## Migration Steps

### Journal Flowchart Feature Requirements

The Journal Flowchart functionality introduces a new data model where:

1. **Journals** are special posts with `isJournal: true`
   - Act as containers for related activities
   - Have cover images, title, source/destination, dates
   - Store trip-level metadata

2. **Activities** are regular posts linked to journals
   - Have `journalId` pointing to their parent journal
   - Include `activityDate` for chronological ordering
   - Use `dayNumber` for grouping in flowchart
   - `isJournal: false` to distinguish from journal headers

3. **Flowchart Queries** require efficient lookups:
   - Get all activities for a journal: `journalId = X AND isJournal = false`
   - Sort activities by day: `ORDER BY dayNumber ASC, activityDate ASC`
   - Get user's journals: `creator = userId AND isJournal = true`

### Database Schema Changes for Flowchart

```sql
-- Conceptual SQL representation of the changes
ALTER TABLE posts ADD COLUMN journalId VARCHAR(255);
ALTER TABLE posts ADD COLUMN activityDate DATE;
ALTER TABLE posts ADD COLUMN isJournal BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN startDate DATE;
ALTER TABLE posts ADD COLUMN endDate DATE;

-- Indexes for efficient queries
CREATE INDEX idx_journal_activities ON posts (journalId, isJournal, dayNumber);
CREATE INDEX idx_user_journals ON posts (creator, isJournal);
CREATE INDEX idx_activity_date ON posts (activityDate);
```

## Migration Steps

### For Existing Data

1. **Backup Current Data**
   - Export all existing posts before making changes
   - Store backup in secure location

2. **Add New Attributes**
   - Add the new attributes to your posts collection
   - All new fields are optional, so existing data remains valid

3. **Update Search Functionality**
   - Modify search queries to include new fields
   - Update indexes for better performance

4. **Test Data Migration**
   - Verify existing posts still display correctly
   - Test new journal creation functionality
   - Ensure search works with new fields

### For New Installations

1. **Create Posts Collection with All Fields**
   - Include both original and new travel-specific fields
   - Set up proper indexes from the start

2. **Configure Permissions**
   - Ensure proper read/write permissions for authenticated users
   - Set up any role-based access if needed

## Validation Rules

### Frontend Validation (Zod Schema)

```typescript
export const JournalValidation = z.object({
  journalTitle: z.string().min(5).max(100).optional(),
  source: z.string().min(1).max(100).optional(),
  destination: z.string().min(1).max(100).optional(),
  dayNumber: z.number().min(1).max(365).optional(),
  duration: z.string().min(1).max(50).optional(),
  // New journal relationship fields
  journalId: z.string().optional(),
  activityDate: z.string().optional(),
  isJournal: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // ... other existing fields
});

export const ActivityValidation = z.object({
  caption: z.string().min(5).max(2200),
  file: z.custom<File[]>(),
  location: z.string().min(1).max(1000),
  tags: z.string(),
  journalId: z.string().min(1, "Journal ID is required"),
  activityDate: z.string().min(1, "Activity date is required"),
  dayNumber: z.number().min(1).max(365),
});
```

### Backend Validation

Ensure your backend validates these fields appropriately:
- journalTitle: 5-100 characters
- source: 1-100 characters  
- destination: 1-100 characters
- dayNumber: 1-365 (reasonable trip length)
- duration: 1-50 characters
- journalId: Valid document ID when provided
- activityDate: Valid ISO date string (YYYY-MM-DD)
- isJournal: Boolean value (required)
- startDate: Valid ISO date string (YYYY-MM-DD)
- endDate: Valid ISO date string (YYYY-MM-DD)

### Data Integrity Rules

1. **Journal Activities**: Posts with `journalId` must have `isJournal: false`
2. **Journal Headers**: Posts with `isJournal: true` should not have `journalId`
3. **Date Consistency**: `activityDate` should be between journal's `startDate` and `endDate`
4. **Day Number Logic**: `dayNumber` should correspond to the position of `activityDate` within the trip

## Search Enhancement

### Updated Search Logic

The search functionality has been enhanced to search across multiple fields:

```typescript
// Example search query expansion
const searchTerms = [
  caption,           // Original content
  journalTitle,      // Journal title
  source,           // Source location
  destination,      // Destination location
  location,         // Specific location
  tags             // Tags
];
```

### Search Performance Tips

1. **Use Indexes**: Ensure all searchable fields are indexed
2. **Limit Results**: Implement pagination for large result sets
3. **Cache Popular Searches**: Cache frequently searched routes
4. **Fuzzy Search**: Consider implementing fuzzy search for location names

### Journal Flowchart Queries

The flowchart functionality requires several specific database queries:

```typescript
// Get all journals for a user
const getUserJournals = () => {
  return databases.listDocuments(
    databaseId,
    postCollectionId,
    [
      Query.equal("creator", userId),
      Query.equal("isJournal", true),
      Query.orderDesc("$createdAt")
    ]
  );
};

// Get all activities for a specific journal
const getJournalActivities = (journalId: string) => {
  return databases.listDocuments(
    databaseId,
    postCollectionId,
    [
      Query.equal("journalId", journalId),
      Query.notEqual("isJournal", true),
      Query.orderAsc("dayNumber"),
      Query.orderAsc("activityDate")
    ]
  );
};

// Get recent journals for home feed
const getRecentJournals = () => {
  return databases.listDocuments(
    databaseId,
    postCollectionId,
    [
      Query.equal("isJournal", true),
      Query.orderDesc("$createdAt"),
      Query.limit(20)
    ]
  );
};
```

### Query Optimization Tips

1. **Compound Indexes**: Use the `journal_activities_index` for efficient activity retrieval
2. **Selective Queries**: Always filter by `isJournal` to separate journals from activities
3. **Sorting**: Use multiple sort criteria for consistent activity ordering
4. **Limits**: Apply reasonable limits to prevent large data transfers

## Testing Checklist

### Basic Functionality
- [ ] Existing posts display correctly without new fields
- [ ] New journal creation works with all fields
- [ ] Search functionality works with location filters
- [ ] Edit/update functionality preserves all fields
- [ ] Data validation works on frontend and backend
- [ ] Performance is acceptable with new indexes
- [ ] Mobile responsiveness maintained

### Journal Flowchart Functionality
- [ ] Journal creation with cover image and metadata
- [ ] Activity creation linked to specific journals
- [ ] Flowchart displays activities grouped by day
- [ ] Activities sorted chronologically within each day
- [ ] Empty state shown for journals without activities
- [ ] Navigation between journal details and activities
- [ ] Activity images display correctly in flowchart
- [ ] Responsive design for flowchart on mobile devices

### Data Relationships
- [ ] Activities properly linked to journals via `journalId`
- [ ] Journal queries exclude activities (`isJournal: true`)
- [ ] Activity queries properly filter by journal
- [ ] Day grouping works correctly in flowchart
- [ ] Date validation prevents invalid activity dates

### Performance Testing
- [ ] Journal list loads quickly with activity counts
- [ ] Flowchart renders efficiently with many activities
- [ ] Search works across journals and activities
- [ ] Pagination works for large journal collections

## Rollback Plan

If issues arise:

1. **Remove New Indexes**: Drop the new search indexes
2. **Hide New UI Elements**: Conditionally hide travel-specific UI
3. **Revert Search Logic**: Return to original search implementation
4. **Preserve Data**: Keep new fields but don't display them

The new fields are optional, so the app can function with or without them, making rollback safe.

---

This migration maintains backward compatibility while adding powerful travel journal features!

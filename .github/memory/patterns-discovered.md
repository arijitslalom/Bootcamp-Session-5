# Patterns Discovered

This file documents recurring code patterns, solutions, and conventions discovered during development. These patterns help maintain consistency and guide future implementation.

**Purpose**: Accumulate reusable knowledge that applies across the project.

---

## Pattern Template

```markdown
## Pattern: [Pattern Name]

**Context**: When/where this pattern applies

**Problem**: What problem this pattern solves

**Solution**: How to implement the pattern

**Example**:
```language
// Code example showing the pattern
```

**Related files**: 
- List of files using this pattern
- Documentation references

**Notes**: Additional considerations, variants, or warnings
```

---

## Discovered Patterns

### Pattern: Service Data Initialization

**Context**: When initializing data structures in service modules (backend)

**Problem**: Need consistent approach for initializing empty collections - should we use empty arrays or null values?

**Solution**: Use **empty arrays** for collection initialization, not null

**Rationale**:
- Avoids null checks in consumer code
- Array methods (map, filter, find) work immediately
- Consistent with JavaScript best practices
- Reduces potential for null reference errors

**Example**:
```javascript
// ✅ GOOD - Use empty array
let todos = [];

// ❌ AVOID - Using null requires checks
let todos = null;
// Later: if (todos) { todos.map(...) } // Extra null check needed
```

**Related files**:
- `packages/backend/src/app.js` - todos array initialization
- Future service modules should follow same pattern

**Notes**: 
- This applies to in-memory data structures and API responses
- Database results may still return null - handle at the data layer

---

<!-- Add new patterns below this line as they are discovered -->

<!--
Examples of future patterns to document:

## Pattern: API Error Response Format
## Pattern: Request Validation Middleware
## Pattern: React Component State Management
## Pattern: Test Fixture Creation
## Pattern: API Route Organization
-->

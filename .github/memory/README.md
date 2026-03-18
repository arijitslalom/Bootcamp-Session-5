# Development Memory System

## Purpose

This memory system tracks **patterns, decisions, and lessons learned** during development. It helps both you and AI assistants provide context-aware suggestions by preserving historical knowledge across sessions.

## The Two Types of Memory

### Persistent Memory (Foundational)
**Location**: `.github/copilot-instructions.md`
- Contains foundational principles and workflows
- Stable, long-term guidelines
- Committed to git
- Changes infrequently

### Working Memory (Discovery-Based)
**Location**: `.github/memory/` directory
- Contains discoveries, patterns, and session-specific learnings
- Dynamic, evolving knowledge base
- Most files committed to git (except `scratch/`)
- Updated frequently during active development

## Directory Structure

```
.github/memory/
├── README.md                    # This file - explains the system
├── session-notes.md             # Historical session summaries (COMMITTED)
├── patterns-discovered.md       # Accumulated code patterns (COMMITTED)
└── scratch/                     # Active session workspace
    ├── .gitignore              # Ignores all files in scratch/
    └── working-notes.md         # Current session notes (NOT COMMITTED)
```

## File Purposes

### 1. `session-notes.md` (Committed)
**Purpose**: Historical record of completed sessions

**What goes here**:
- Session summaries after work is complete
- What was accomplished and why
- Key findings and decisions
- Outcomes and results

**Update frequency**: At end of each session

**Example use case**: "What did I learn when implementing the DELETE endpoint last week?"

### 2. `patterns-discovered.md` (Committed)
**Purpose**: Accumulated code patterns and best practices

**What goes here**:
- Recurring code patterns you've discovered
- Solutions to common problems
- Project-specific conventions
- Anti-patterns to avoid

**Update frequency**: When you identify a reusable pattern

**Example use case**: "How should I initialize service data structures in this project?"

### 3. `scratch/working-notes.md` (NOT Committed)
**Purpose**: Active session workspace for current tasks

**What goes here**:
- Current task details
- Approach and hypotheses
- Real-time findings
- Decisions being made
- Blockers and questions
- Next steps

**Update frequency**: Throughout active development session

**Example use case**: "What was I working on before I got interrupted?"

**Important**: This file is ephemeral - it's not committed. At session end, distill key findings into `session-notes.md` or `patterns-discovered.md`.

## When to Use Each File

### During TDD (Test-Driven Development)

**While working** → `scratch/working-notes.md`:
```markdown
## Current Task
Implementing POST /api/todos endpoint

## Approach
1. Write test for 201 status response
2. Implement minimal endpoint
3. Add validation for required fields

## Key Findings
- Test expects createdAt timestamp
- Body parser middleware already configured

## Next Steps
- [ ] Add validation test for missing title
- [ ] Implement error handling
```

**After session** → `session-notes.md`:
```markdown
### Session: Implemented POST /api/todos
**Date**: 2026-03-18

**What was accomplished**:
Implemented POST endpoint with validation and proper status codes

**Key findings**:
- Validation middleware pattern works well
- Tests guide implementation effectively

**Outcomes**:
All POST endpoint tests passing
```

**If pattern emerges** → `patterns-discovered.md`:
```markdown
## Pattern: Request Validation
**Context**: Express API endpoints
**Problem**: Need consistent validation across endpoints
**Solution**: Middleware function that checks required fields
**Example**: See `src/middleware/validation.js`
```

### During Linting/Code Quality

**While fixing** → `scratch/working-notes.md`:
```markdown
## Current Task
Fixing ESLint errors in app.js

## Key Findings
- 15 unused variable errors (cleanup needed)
- 3 console.log statements (replace with logger)

## Decisions Made
- Keep console.error for now (helpful during dev)
- Remove debug console.logs

## Blockers
- Logger module not implemented yet
```

**After session** → `patterns-discovered.md`:
```markdown
## Pattern: Logging Best Practices
**Context**: Development vs Production
**Solution**: Use console.error for errors, avoid console.log
**Related**: Future logger implementation needed
```

### During Debugging

**While debugging** → `scratch/working-notes.md`:
```markdown
## Current Task
Fix: Toggle functionality always sets completed=true

## Approach
1. Review toggle handler code
2. Check state update logic
3. Verify API response

## Key Findings
- Bug in line 45: `todo.completed = true`
- Should be: `todo.completed = !todo.completed`
- Test coverage gap - need toggle state test

## Decisions Made
- Fix the toggle logic
- Add regression test
```

**After fix** → `session-notes.md`:
```markdown
### Session: Fixed Toggle Bug
**Date**: 2026-03-18

**What was accomplished**:
Fixed toggle functionality and added test coverage

**Key findings**:
- Missing negation operator caused always-true behavior
- Test coverage helps prevent regressions

**Outcomes**:
Toggle works correctly both directions, test added
```

## How AI Reads and Applies These Patterns

### Context Loading Sequence

1. **Foundational Context**: AI reads `.github/copilot-instructions.md`
   - Understands project structure, tech stack, principles

2. **Historical Context**: AI can reference `session-notes.md`
   - Learns what's been tried before
   - Avoids repeating past mistakes
   - Builds on previous decisions

3. **Pattern Context**: AI can reference `patterns-discovered.md`
   - Applies project-specific conventions
   - Suggests solutions matching established patterns
   - Maintains consistency

4. **Active Context**: You can share from `scratch/working-notes.md`
   - Provides immediate task context
   - Helps AI understand current state
   - Enables more relevant suggestions

### Example AI Interaction

**Without memory**:
```
You: "Implement DELETE endpoint"
AI: [Suggests generic implementation]
```

**With memory**:
```
You: "Implement DELETE endpoint"
AI: [Reads patterns-discovered.md, sees POST pattern]
AI: [Suggests implementation matching established validation pattern]
AI: [References session where POST was implemented]
AI: "Based on the POST endpoint pattern in session-notes.md, 
     here's a consistent DELETE implementation..."
```

## Best Practices

### ✅ DO

- **Update `scratch/working-notes.md` throughout active work**
  - Capture findings in real-time
  - Document decisions and reasoning
  - Track blockers as they arise

- **Summarize to `session-notes.md` at session end**
  - Distill key learnings
  - Document outcomes
  - Note important decisions

- **Extract patterns to `patterns-discovered.md` when identified**
  - When you solve something twice the same way
  - When you establish a convention
  - When you discover a best practice

- **Reference memory files when asking AI for help**
  - "Based on the POST pattern in patterns-discovered.md..."
  - "As noted in session-notes.md, we decided to..."

### ❌ DON'T

- **Don't commit `scratch/working-notes.md`**
  - It's ephemeral, for active work only
  - Historical value goes in session-notes.md

- **Don't duplicate content across files**
  - Active work → scratch
  - Completed summaries → session-notes
  - Reusable patterns → patterns-discovered

- **Don't let memory files grow unbounded**
  - Archive old session notes if needed
  - Keep patterns-discovered organized by category
  - Clean up obsolete information

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Active Development                       │
│  • Take notes in scratch/working-notes.md                   │
│  • Document findings, decisions, blockers                    │
│  • Update throughout the session                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      End of Session                          │
│  • Distill key findings → session-notes.md                  │
│  • Extract patterns → patterns-discovered.md                │
│  • Clear or archive scratch/working-notes.md                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Future Sessions                         │
│  • AI references historical context                         │
│  • You review past decisions                                │
│  • Patterns guide new implementations                       │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

1. **Start your session**: Open `scratch/working-notes.md` and note your current task
2. **Work iteratively**: Update working notes as you discover things
3. **End your session**: Summarize key findings to `session-notes.md`
4. **Extract patterns**: Move reusable patterns to `patterns-discovered.md`
5. **Next session**: Review memory files for context before starting new work

This system grows with your project, creating a valuable knowledge base that makes both you and AI more effective over time. 🚀

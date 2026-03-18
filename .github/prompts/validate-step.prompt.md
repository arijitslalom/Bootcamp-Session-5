---
description: "Validate that all success criteria for the current step are met"
agent: 'code-reviewer'
tools: ['search', 'read', 'execute', 'web', 'todo']
---

# Validate Step Success Criteria

Systematically verify that all success criteria for a specific step are met.

## Input Parameters

Step Number: ${input:step-number:Step number to validate (e.g., 5-0, 5-1) - REQUIRED}

## Workflow

### 1. Validate Step Number

If step number is not provided or empty:
- **STOP** and ask the user to provide a step number
- Expected format: `X-Y` (e.g., `5-0`, `5-1`, `6-2`)
- Explain that the step number should match the step they just completed

### 2. Locate the Exercise Issue

Use gh CLI to find the main exercise issue:
```bash
gh issue list --state open
```

Look for the issue with "Exercise:" in the title and extract its issue number.

### 3. Retrieve Issue with All Comments

Get the full issue content including all step comments:
```bash
gh issue view <issue-number> --comments
```

### 4. Find the Specific Step

Parse the issue output to locate the step:
- Search for the heading: `# Step ${step-number}:`
- Extract all content for that specific step
- Locate the "Success Criteria" or "## Success" section within that step

**Example step format in issue:**
```markdown
# Step 5-1: Implement Todo Filtering

:keyboard: Activity: Add filter functionality
...

## Success Criteria
- [ ] Filter component renders correctly
- [ ] Tests pass for filter logic
- [ ] Manual browser test shows filters working
```

### 5. Extract Success Criteria

From the step content, extract each success criterion:
- Usually formatted as checkboxes: `- [ ] Criterion description`
- May be numbered or bulleted
- Could be under "Success Criteria", "Validation", or "Verify" section

Create a checklist of all criteria to validate.

### 6. Validate Each Criterion Systematically

For each success criterion, perform appropriate checks:

**For test-related criteria:**
```bash
# Run backend tests
cd packages/backend && npm test

# Run frontend tests
cd packages/frontend && npm test
```

**For linting criteria:**
```bash
# Check backend linting
cd packages/backend && npm run lint

# Check frontend linting
cd packages/frontend && npm run lint
```

**For compilation criteria:**
```bash
# Verify backend compiles
cd packages/backend && npm run build || node src/index.js --help

# Verify frontend compiles
cd packages/frontend && npm run build
```

**For code existence criteria:**
- Use search to verify files/functions exist
- Read files to confirm implementation
- Check that tests cover the functionality

**For manual testing criteria:**
- If criterion requires browser testing, remind user to verify manually
- Provide specific steps for manual verification
- Note that automated browser testing is out of scope (no e2e frameworks)

### 7. Report Validation Results

Present results in clear format:

```markdown
## Validation Results for Step ${step-number}

✅ **PASSED** - [Criterion description]
   Details: [What was verified and how]

❌ **FAILED** - [Criterion description]
   Issue: [What's missing or broken]
   Fix: [Specific guidance on how to address]

⚠️  **MANUAL** - [Criterion requiring manual verification]
   Instructions: [Steps to verify manually in browser]
```

### 8. Overall Assessment

Provide summary:
- **All Passed**: Ready to commit and push (use `/commit-and-push`)
- **Some Failed**: List specific items to address before proceeding
- **Manual Verification Needed**: Remind user to test in browser

## Validation Categories

### Code Quality Checks
- All tests passing (no failures)
- No linting errors
- Code compiles without errors
- No console errors/warnings

### Implementation Checks
- Required files exist
- Required functions/components implemented
- Tests cover new functionality
- Code follows project patterns

### Functional Checks
- Features work as specified
- Edge cases handled
- Error handling present
- No regressions introduced

## References

This prompt inherits gh CLI workflow knowledge from:
- [Copilot Instructions](../.github/copilot-instructions.md) - Workflow Utilities section

## Next Steps

After validation:
- **If all criteria pass**: Run `/commit-and-push <branch-name>` to save progress
- **If criteria fail**: Address failures, then re-run `/validate-step`
- **After successful push**: Proceed to next step with `/execute-step`

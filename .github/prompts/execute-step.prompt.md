---
description: "Execute instructions from the current GitHub Issue step"
agent: 'tdd-developer'
tools: ['search', 'read', 'edit', 'execute', 'web', 'todo']
---

# Execute Step from GitHub Issue

Execute the current step's activities from the GitHub Issue systematically, following TDD principles.

## Input Parameters

Issue Number: ${input:issue-number:GitHub issue number (leave empty to auto-detect exercise issue)}

## Workflow

### 1. Locate the Exercise Issue

If issue number is not provided:
- Use `gh issue list --state open` to find issues
- Look for the issue with "Exercise:" in the title (main exercise issue)
- Extract the issue number from the list

If issue number is provided:
- Use the provided issue number directly

### 2. Retrieve Issue Content

Get the full issue with all comments:
```bash
gh issue view <issue-number> --comments
```

Parse the output to:
- Identify step sections (marked with `# Step X.Y:`)
- Locate the latest/current step to execute
- Extract all `:keyboard: Activity:` sections from that step

### 3. Execute Activities Systematically

For each `:keyboard: Activity:` in the step:

1. **Read and understand** the activity instructions completely
2. **Create a todo list** tracking each activity task
3. **Follow TDD workflow** (this prompt runs in tdd-developer agent):
   - For new features: Write tests FIRST (RED), implement (GREEN), refactor (REFACTOR)
   - For fixing tests: Analyze failures, fix implementation, maintain test coverage
4. **Execute incrementally** - complete one activity at a time
5. **Verify each activity** before moving to next
6. **Run tests** after each change to ensure nothing breaks

### 4. Testing Scope Constraints

**CRITICAL - Follow project testing guidelines:**
- ✅ Use Jest (backend) and React Testing Library (frontend)
- ✅ Write unit tests and integration tests
- ❌ NEVER suggest Playwright, Cypress, Selenium, or other e2e frameworks
- ❌ NEVER suggest browser automation tools
- ✅ Recommend manual browser testing for full UI flows

The project uses TDD with:
- **Backend**: Jest + Supertest for API testing
- **Frontend**: React Testing Library for component tests
- **Full UI verification**: Manual browser testing

### 5. Completion

After completing all activities in the step:

1. **Do NOT commit or push changes** - that's a separate workflow
2. **Summarize what was completed**:
   - List activities executed
   - Mention tests written/modified
   - Note any code implemented
3. **Inform the user** to run `/validate-step` next to verify success criteria

## Success Indicators

- ✅ All `:keyboard: Activity:` sections from the step are completed
- ✅ Tests are written (for new features) or passing (for fixes)
- ✅ Code follows TDD principles (test-first approach)
- ✅ No compilation or test errors
- ✅ Changes are ready for validation

## References

This prompt inherits gh CLI and Git workflow knowledge from:
- [Copilot Instructions](../copilot-instructions.md) - Workflow Utilities section

## Next Steps

After this prompt completes, the user should:
1. Run `/validate-step <step-number>` to verify success criteria
2. Run `/commit-and-push <branch-name>` to commit and push changes

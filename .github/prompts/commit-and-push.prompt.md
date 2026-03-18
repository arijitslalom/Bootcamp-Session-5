---
description: "Analyze changes, generate commit message, and push to feature branch"
tools: ['read', 'execute', 'todo']
---

# Commit and Push to Feature Branch

Analyze staged/unstaged changes, generate a conventional commit message, and push to a feature branch.

## Input Parameters

Branch Name: ${input:branch-name:Feature branch name (e.g., feature/add-todo-filter) - REQUIRED}

## Workflow

### 1. Validate Branch Name

If branch name is not provided or empty:
- **STOP** and ask the user to provide a branch name
- Suggest format: `feature/<descriptive-name>`
- Example: `feature/add-priority-field`, `feature/implement-filters`

### 2. Analyze Changes

Review what has changed:
```bash
git status
git diff
```

Understand:
- Which files were added, modified, or deleted
- What functionality was added or changed
- What tests were added or modified
- Overall scope of the changes

### 3. Generate Conventional Commit Message

Based on the changes, create a commit message following **Conventional Commits** format:

**Format:**
```
<type>: <short description>

<optional longer description>
<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding or modifying tests
- `refactor:` - Code refactoring without changing functionality
- `chore:` - Maintenance tasks (dependencies, config, etc.)
- `docs:` - Documentation changes
- `style:` - Code style/formatting changes

**Examples:**
```
feat: add priority field to todo items

- Add priority field to todo model
- Implement priority validation
- Add tests for priority functionality
```

```
fix: resolve DELETE endpoint test failure

- Correct todo deletion logic in controller
- Update error handling for non-existent todos
```

```
test: add integration tests for todo filters

- Test filtering by completed status
- Test filtering by priority
- Verify filter combinations work correctly
```

### 4. Branch Operations

Create or switch to the feature branch:

**If branch doesn't exist:**
```bash
git checkout -b ${branch-name}
```

**If branch exists:**
```bash
git checkout ${branch-name}
```

### 5. Stage, Commit, and Push

Execute the git workflow:

```bash
# Stage all changes
git add .

# Commit with generated message
git commit -m "<generated-commit-message>"

# Push to the feature branch
git push origin ${branch-name}
```

**CRITICAL CONSTRAINTS:**
- ❌ NEVER commit to `main` branch
- ❌ NEVER push to any branch except the user-provided branch name
- ✅ ONLY use the branch name provided by the user
- ✅ Always verify you're on the correct branch before pushing

### 6. Confirmation

After successful push, inform the user:
- Branch name used
- Commit message generated
- Files changed/added
- Next steps (e.g., create PR, continue with next step)

## Safety Checks

Before executing any git operations:
1. ✅ Verify branch name is provided
2. ✅ Confirm not on `main` branch before committing
3. ✅ Show commit message to user before proceeding
4. ✅ Ensure all changes are intentional

## References

This prompt inherits Git workflow knowledge from:
- [Copilot Instructions](../.github/copilot-instructions.md) - Git Workflow section

## Common Use Cases

- After completing a step with `/execute-step`
- After validation passes with `/validate-step`
- When ready to checkpoint implemented features
- Before creating a pull request

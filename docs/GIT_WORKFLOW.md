# Git Workflow for Jarvis Prime

## Branch Strategy

### Main Branch (`main`)
- **Protected**: Cannot push directly, requires Pull Request
- Always contains production-ready code
- All commits must pass CI checks

### Feature Branches
- Create a new branch for each feature/fix
- Naming convention: `feature/description` or `fix/description`
- Example: `feature/chat-ui`, `fix/auth-redirect`

## Daily Workflow

### 1. Start New Work
```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your code changes
# Test locally: pnpm dev

# Check for issues
pnpm biome ci
pnpm build

# Stage and commit
git add .
git commit -m "feat: descriptive commit message"
```

### 3. Push and Create PR
```bash
# Push your feature branch
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
# Or use GitHub CLI:
gh pr create --title "Add your feature" --body "Description of changes"
```

### 4. Review and Merge
- GitHub Actions will run CI checks automatically
- Review your own changes (good practice even solo!)
- Once checks pass, merge the PR via GitHub
- Delete the feature branch after merge

### 5. Clean Up Locally
```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Delete local feature branch
git branch -d feature/your-feature-name
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add user profile dropdown"
git commit -m "fix: resolve hover dropdown bug"
git commit -m "docs: update README with setup instructions"
```

## Quick Commands

```bash
# Create and switch to new branch
git checkout -b feature/branch-name

# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: your message"

# Push to remote
git push origin feature/branch-name

# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# View commit history
git log --oneline --graph --all
```

## GitHub CLI Commands (Optional)

Install: `brew install gh`

```bash
# Login
gh auth login

# Create PR
gh pr create

# List PRs
gh pr list

# View PR
gh pr view

# Merge PR
gh pr merge

# Check CI status
gh pr checks
```

## Benefits of This Workflow (Even Solo)

1. **Code Review**: Review your own changes with fresh eyes
2. **CI/CD**: Automated checks catch issues before merge
3. **History**: Clean, organized commit history
4. **Rollback**: Easy to revert changes if needed
5. **Professional**: Industry-standard practices
6. **Portfolio**: Shows good Git practices to employers
7. **Experimentation**: Test ideas without breaking main
8. **Documentation**: PR descriptions document why changes were made

## Emergency Bypass

If you really need to push directly to main (not recommended):
1. Temporarily disable branch protection on GitHub
2. Make your changes
3. Re-enable branch protection

Or add yourself as an exception in branch protection rules.

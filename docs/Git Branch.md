## Branches
`main`: final, stable, production-ready code<br>
`develop`: for integrating multiple features and testing them together<br>
`feature/...`: branches merged into `develop`, then later into `main`<br>

Create a new branch for each new feature, like `feature/login`, `feature/matching`. After implement  and test the new feature, then merge it to `develop` branch, after doing the intergration test, then meger `develop` branch to `main` branch. At the end, delete `feature/login` branch from local and remote.<br>

## Full Git Workflow for a New Feature

### 1.Start from the latest develop branch
```bash
git checkout develop
git pull origin develop  # get the latest changes from remote
```

### 2. Create and switch to a new feature branch
```bash
git checkout -b feature/login
```
Now you're working on your own `feature/login` branch locally.

### 3. Work on the feature (add, commit regularly)
```bash
# make code changes
git add .
git commit -m "Implement login feature"
```
Repeat this as many times as needed.

### 4. Push the feature branch to the remote
```bash
git push -u origin feature/login
```
`-u` sets the upstream so future `git push` and `git pull` work without needing to specify the branch again.

### 5. Merge feature/login into develop (Integration Stage)
#### Option 1: Via GitHub Pull Request (Recommended)
1. Go to GitHub<br>
2. Open a pull request from feature/login → develop<br>
3. After code review and checks pass, merge the PR<br>

#### Option 2: Merge locally
```bash
git checkout develop
git pull origin develop         # make sure it's up to date
git merge feature/login         # merge your feature in
git push origin develop         # push merged result to remote
```

### 6. Merge develop into main (Release Stage)
Once all features are tested in `develop` and it's ready for production:
```bash
git checkout main
git pull origin main            # update your local main
git merge develop               # bring in all features
git push origin main            # deploy the stable code
```

### 7. Clean up the feature branch
Delete locally:
```bash
git branch -d feature/login
```
Delete from remote:
```bash
git push origin --delete feature/login
```

### Summary Diagram
```bash
# Starting point
develop
  |
  └──> create feature/login
            |
            └──> work & push to remote
                        |
                        └──> merge to develop (integration)
                                    |
                                    └──> merge develop → main (release)
                                                |
                                                └──> delete feature branch
```

## sync `develop` branch with the latest `main` branch
Merge main into develop (keeps history)
```bash
# Step 1: Checkout develop branch
git checkout develop

# Step 2: Pull the latest changes from origin
git pull origin develop

# Step 3: Merge main into develop
git merge main

# Step 4: Push the updated develop branch
git push origin develop
```

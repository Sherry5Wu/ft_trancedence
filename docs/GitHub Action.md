# GitHub Actions
This is basic tutorial for GitHub Actions.<br>

## What is GitHub Actions?
GitHub Actions is a CI/CD (Continuous Integration / Continuous Deployment) tool built into GitHub. It lets you automate tasks like:<br>
- Running tests every time someone pushes code<br>
- Building and deploying your app<br>
- Running scripts on a schedule<br>
- Automatically labeling issues or PRs<br>
- Running code checks like linters or formatters<br>

You define workflows (like automation recipes) using .yml files stored in .github/workflows/.<br>

## What Can You Do With GitHub Actions?
Here are some real-world things developers use it for:<br>
| Use Case                 | Example                                                 |
| ------------------------ | ------------------------------------------------------- |
| **Run Tests**            | Run unit tests on every commit to `main`                |
| **Build Code**           | Build a React app and output a production bundle        |
| **Deploy Automatically** | Deploy to Heroku or AWS after merging                   |
| **Lint Code**            | Auto-check formatting and style (e.g. ESLint, Prettier) |
| **Send Notifications**   | Notify Slack/Discord when builds fail                   |
| **Scheduled Jobs**       | Run backups or reports daily or weekly                  |

## How Does It Work?
1. Event triggers the workflow<br>
E.g., push, pull_request, or schedule<br>
2. GitHub runs the workflow on a virtual machine (like Ubuntu)<br>
3. Steps execute in order (install dependencies, run tests, etc.)<br>

## Example Workflow File
A file like .github/workflows/ci.yml:<br>
```yaml
name: CI

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
```
This will:
- Run every time you push code<br>
- Set up an Ubuntu machine<br>
- Checkout your repo<br>
- Install Node.js packages<br>
- Run your tests<br>

## Reusable Actions
GitHub Actions has a marketplace of pre-made actions you can reuse:<br>
- actions/checkout – checkout your repo code<br>
- actions/setup-node – install Node.js<br>
- docker/build-push-action – build and push Docker images<br>
- slackapi/slack-github-action – send Slack messages<br>

##  GitHub Actions = Workflows + Jobs + Steps
Think of it like this:<br>
```scss
Workflow (ci.yml)
└── Job (test, build, deploy)
    └── Steps (run commands, call actions)
```
Each step is like a shell command or a reusable script.<br>

## Tutorial
https://docs.github.com/en/actions/tutorials/creating-an-example-workflow

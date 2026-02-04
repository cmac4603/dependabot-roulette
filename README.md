# dependabot-jira-roulette

Randomly assign Dependabot pull requests to members of a GitHub team.

## Usage

Add this action to your workflow to automatically assign Dependabot PRs to a
random team member:

```yaml
name: Assign Dependabot PRs

on:
  pull_request:
    types: [opened]

jobs:
  assign:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Assign random team member
        uses: cmac4603/dependabot-jira-roulette@v1
        with:
          github_team: your-org/your-team
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

| Input          | Description                                                                         | Required |
| -------------- | ----------------------------------------------------------------------------------- | -------- |
| `github_team`  | GitHub team to randomly select a user from (format: `org/team-slug` or `team-slug`) | Yes      |
| `github_token` | GitHub token with permissions to read team & members                                | Yes      |

### Outputs

| Output     | Description                          |
| ---------- | ------------------------------------ |
| `username` | GitHub username of the assigned user |

### Permissions

The `github_token` needs the following permissions:

- `read:org` - to list team members
- `pull-requests: write` - to assign users to PRs

If using the default `GITHUB_TOKEN`, you may need to configure permissions in
your workflow:

```yaml
permissions:
  pull-requests: write
  organization: read
```

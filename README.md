# dependabot-roulette

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
        uses: cmac4603/dependabot-roulette@v1
        with:
          github_team: your-org/your-team
          github_token: ${{ secrets.ORG_TOKEN }}
```

> **Note:** The default `GITHUB_TOKEN` cannot read team membership. You must use
> a PAT or GitHub App token with `read:org` scope. See
> [Permissions](#permissions) for details.

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

The `github_token` needs a PAT or GitHub App token with the following scopes:

- `read:org` - to list team members
- `repo` - to assign users to PRs

**Important:** The default `GITHUB_TOKEN` does not have permission to read
organization team membership. You must use a Personal Access Token (PAT) or
GitHub App token.

#### Using a Personal Access Token

1. Create a PAT with `read:org` and `repo` scopes
2. Store it as a repository secret (e.g., `ORG_TOKEN`)
3. Use it in your workflow as shown in the example above

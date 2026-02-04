import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * The main function for the action.
 * Randomly assigns a Dependabot PR to a member of a GitHub team.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
    try {
        const githubTeam = core.getInput("github_team", { required: true });
        const githubToken = core.getInput("github_token", { required: true });

        const octokit = github.getOctokit(githubToken);
        const context = github.context;

        // validate this is a pull request event
        if (!context.payload.pull_request) {
            core.setFailed("This action must be run on a pull_request event");
            return;
        }

        // validate the pr was opened by dependabot
        const prAuthor = context.payload.pull_request.user.login;
        if (prAuthor !== "dependabot[bot]") {
            core.info(
                `PR was not opened by Dependabot (author: ${prAuthor}), skipping`,
            );
            return;
        }

        const prNumber = context.payload.pull_request.number;
        const owner = context.repo.owner;
        const repo = context.repo.repo;

        core.debug(`Processing PR #${prNumber} in ${owner}/${repo}`);
        core.debug(`Selecting random user from team: ${githubTeam}`);

        // parse team slug - expects format "org/team-slug" or just "team-slug"
        let orgName = owner;
        let teamSlug = githubTeam;

        if (githubTeam.includes("/")) {
            const parts = githubTeam.split("/");
            orgName = parts[0];
            teamSlug = parts[1];
        }

        // get team members
        core.debug(`Fetching members from org: ${orgName}, team: ${teamSlug}`);
        const { data: members } = await octokit.rest.teams.listMembersInOrg({
            org: orgName,
            team_slug: teamSlug,
        });

        if (members.length === 0) {
            core.setFailed(`No members found in team ${githubTeam}`);
            return;
        }

        core.debug(`Found ${members.length} team members`);

        // select a random member
        const randomIndex = Math.floor(Math.random() * members.length);
        const selectedUser = members[randomIndex];

        core.info(`Selected user: ${selectedUser.login}`);

        // assign the pr to the selected user
        await octokit.rest.issues.addAssignees({
            owner,
            repo,
            issue_number: prNumber,
            assignees: [selectedUser.login],
        });

        core.info(
            `Successfully assigned PR #${prNumber} to ${selectedUser.login}`,
        );

        // Set output for other workflow steps to use
        core.setOutput("username", selectedUser.login);
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message);
    }
}

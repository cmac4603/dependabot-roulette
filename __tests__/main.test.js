/**
 * Unit tests for the action's main functionality, src/main.js
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.js', () => {
  let mockOctokit

  beforeEach(() => {
    // Reset context to default values
    github.context.repo = { owner: 'test-owner', repo: 'test-repo' }
    github.context.payload = {
      pull_request: {
        number: 123,
        user: { login: 'dependabot[bot]' }
      }
    }

    // Setup mock octokit
    mockOctokit = {
      rest: {
        teams: {
          listMembersInOrg: jest.fn()
        },
        issues: {
          addAssignees: jest.fn()
        }
      }
    }
    github.getOctokit.mockReturnValue(mockOctokit)

    // Setup default input values
    core.getInput.mockImplementation((name) => {
      if (name === 'github_team') return 'my-org/my-team'
      if (name === 'github_token') return 'test-token'
      return ''
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Successfully assigns a random team member to the PR', async () => {
    const teamMembers = [
      { login: 'user1' },
      { login: 'user2' },
      { login: 'user3' }
    ]
    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({
      data: teamMembers
    })

    await run()

    // Verify team members were fetched
    expect(mockOctokit.rest.teams.listMembersInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team'
    })

    // Verify a user was assigned
    expect(mockOctokit.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 123,
      assignees: expect.arrayContaining([expect.stringMatching(/^user[123]$/)])
    })

    // Verify output was set
    expect(core.setOutput).toHaveBeenCalledWith(
      'username',
      expect.stringMatching(/^user[123]$/)
    )
  })

  it('Handles team slug without org prefix', async () => {
    core.getInput.mockImplementation((name) => {
      if (name === 'github_team') return 'my-team'
      if (name === 'github_token') return 'test-token'
      return ''
    })

    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({
      data: [{ login: 'user1' }]
    })

    await run()

    // Should use repo owner as org
    expect(mockOctokit.rest.teams.listMembersInOrg).toHaveBeenCalledWith({
      org: 'test-owner',
      team_slug: 'my-team'
    })
  })

  it('Fails when not run on a pull request event', async () => {
    github.context.payload = {}

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'This action must be run on a pull_request event'
    )
  })

  it('Skips PRs not opened by Dependabot', async () => {
    github.context.payload = {
      pull_request: {
        number: 123,
        user: { login: 'some-user' }
      }
    }

    await run()

    expect(core.info).toHaveBeenCalledWith(
      'PR was not opened by Dependabot (author: some-user), skipping'
    )
    expect(mockOctokit.rest.teams.listMembersInOrg).not.toHaveBeenCalled()
  })

  it('Fails when team has no members', async () => {
    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({
      data: []
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'No members found in team my-org/my-team'
    )
  })

  it('Fails when API call throws an error', async () => {
    mockOctokit.rest.teams.listMembersInOrg.mockRejectedValue(
      new Error('API rate limit exceeded')
    )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('API rate limit exceeded')
  })

  it('Creates octokit with the provided token', async () => {
    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({
      data: [{ login: 'user1' }]
    })

    await run()

    expect(github.getOctokit).toHaveBeenCalledWith('test-token')
  })
})

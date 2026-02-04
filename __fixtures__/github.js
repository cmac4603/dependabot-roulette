/**
 * This file is used to mock the `@actions/github` module in tests.
 */
import { jest } from '@jest/globals'

export const context = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  payload: {
    pull_request: {
      number: 123,
      user: {
        login: 'dependabot[bot]'
      }
    }
  }
}

export const getOctokit = jest.fn(() => ({
  rest: {
    teams: {
      listMembersInOrg: jest.fn()
    },
    issues: {
      addAssignees: jest.fn()
    }
  }
}))

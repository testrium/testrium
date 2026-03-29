import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Testrium',
  description: 'The open-source test case management system built for QA teams.',
  base: '/',
  ignoreDeadLinks: [/^http:\/\/localhost/],

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { property: 'og:title', content: 'Testrium — Test Case Management for QA Teams' }],
    ['meta', { property: 'og:description', content: 'Plan, execute, and report on test cases with ease. Open-source, self-hosted, Docker-ready.' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Testrium',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Features', link: '/features/' },
      { text: 'Configuration', link: '/configuration/' },
      { text: 'API', link: '/api/' },
      {
        text: 'v1.7.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/testrium/testrium/blob/master/CHANGELOG.md' },
          { text: 'Releases', link: 'https://github.com/testrium/testrium/releases' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Docker Setup', link: '/guide/docker-setup' },
            { text: 'Local Development', link: '/guide/local-dev' },
          ]
        }
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Overview', link: '/features/' },
            { text: 'Test Case Management', link: '/features/test-cases' },
            { text: 'Test Run Execution', link: '/features/test-runs' },
            { text: 'Bulk Operations', link: '/features/bulk-operations' },
            { text: 'JIRA Integration', link: '/features/jira-integration' },
            { text: 'Test Data Management', link: '/features/test-data' },
            { text: 'Reports & Analytics', link: '/features/reports' },
          ]
        }
      ],
      '/configuration/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Environment Variables', link: '/configuration/' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'Automation API',
          items: [
            { text: 'Overview', link: '/api/' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/testrium/testrium' },
      { icon: 'docker', link: 'https://hub.docker.com/r/sddmhossain/testrium' }
    ],

    footer: {
      message: 'Released under a Proprietary License.',
      copyright: 'Copyright © 2024-present Testrium'
    },

    editLink: {
      pattern: 'https://github.com/testrium/testrium/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    }
  }
})

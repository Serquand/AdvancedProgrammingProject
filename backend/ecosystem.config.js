module.exports = {
    apps: [
        {
            name: 'advanced-programming-http-server',
            script: './dist/apps/http-server/main.js',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        },
        {
            name: 'advanced-programming-auth-service',
            script: './dist/apps/auth/main.js',
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        },
        {
            name: 'advanced-programming-organization-service',
            script: './dist/apps/organizations/main.js',
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        },
        {
            name: 'advanced-programming-survey-service',
            script: './dist/apps/survey/main.js',
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        },
        {
            name: 'advanced-programming-user-service',
            script: './dist/apps/user/main.js',
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        },
        {
            name: 'advanced-programming-user-answers-service',
            script: './dist/apps/user-answers/main.js',
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1_000,
        }
    ],
};

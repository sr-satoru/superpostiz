module.exports = {
    apps: [
        {
            name: 'frontend',
            script: 'pnpm',
            args: 'start',
            cwd: './apps/frontend',
            instances: 1,
            autorestart: true,
            watch: false,
        },
        {
            name: 'backend',
            script: 'dist/apps/backend/src/main.js',
            cwd: './apps/backend',
            interpreter_args: '--experimental-require-module',
            node_args: '-r ../../node_modules/dotenv/config',
            env: {
                DOTENV_CONFIG_PATH: '../../.env'
            }
        },
        {
            name: 'workers',
            script: 'pnpm',
            args: 'start',
            cwd: './apps/workers',
            instances: 1,
            autorestart: true,
            watch: false,
        },
        {
            name: 'cron',
            script: 'pnpm',
            args: 'start',
            cwd: './apps/cron',
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};

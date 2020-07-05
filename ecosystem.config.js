module.exports = {
  apps : [{
    name: 'avnode-members-tools',
    max_memory_restart: "600M",
    script: 'app.js',
    log_file: "node_avnode_tools-combined.log",
    out_file: "node_avnode_tools-out.log",
    error_file: "node_avnode_tools-err.log",
    ignore_watch: [
      "public",
      "warehouse",
      "locales"
    ],
    time: true,
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: true,
    watch_options: {
      followSymlinks: false
    },
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],

  deploy : {
    production : {
      user : 'hyo',
      key: '~/.ssh/known_hosts',
      host : [{host : '176.9.142.221',port : '9922'}],
      ref  : 'origin/master',
      repo : 'git@github.com:gianlucadelgobbo/avnode-members-tools.git',
      path : '/sites/avnode-members-tools',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};

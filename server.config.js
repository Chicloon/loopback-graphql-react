module.exports = {
  apps : [{
      name: 'server-dev',
      script: 'server/server.js',
      node_args: '--inspect=6666',
      env: {
        PORT: 4444,
        DEBUG: "loopback:*,smartplatform:*",
      },
      log_date_format: 'DD.MM.YYYY HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/server-dev.err.log',
      out_file: 'logs/server-dev.out.log',
      pid_file: 'server-dev.pid',
  }],
};

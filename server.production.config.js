module.exports = {
  apps : [{
      name: 'server',
      script: 'server/server.js',
      env: {
        PORT: 5555,
        NODE_ENV: 'production',
      },
      log_date_format: 'DD.MM.YYYY HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/server.err.log',
      out_file: 'logs/server.out.log',
      pid_file: 'server.pid',
  }],
};

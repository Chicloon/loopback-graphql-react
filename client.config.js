module.exports = {
  apps : [{
      name: 'client-dev',
      script: 'node_modules/.bin/webpack-dev-server',
      args: '--config webpack.dev.js',
      env: {
        NODE_ENV: 'development',
      },
      log_date_format: 'DD.MM.YYYY HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/client-dev.err.log',
      out_file: 'logs/client-dev.out.log',
      pid_file: 'client-dev.pid',
  }],
};

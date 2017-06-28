module.exports = {
  apps : [{
      name: 'gql_server-dev',
      script: 'gql_server/server.js',
      // node_args: ' --ignore client',
      env: {
        PORT: 4000,
        // DEBUG: "loopback:*,smartplatform:*",
      },
      log_date_format: 'DD.MM.YYYY HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/gql_server-dev.err.log',
      out_file: 'logs/gql_server-dev.out.log',
      pid_file: 'gql_server-dev.pid',
  }],
};

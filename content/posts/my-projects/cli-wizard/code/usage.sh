my-cli config init
my-cli config set --param baseUrl --value https://staging.example.com
my-cli user ls
my-cli user get --user-id 42
MY_CLI_BASE_URL=https://api.example.com my-cli --profile prod user ls
my-cli --debug user ls

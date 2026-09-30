pip install cli-wizard
cli-wizard generate my-cli --configuration cli-wizard.yaml
pip install -e my-cli

my-cli users list-users
my-cli users get-user --user-id 42
my-cli users create-user --name Ada --admin

# nebulactl-setup-action

This action sets up [nebulactl](https://docs.datafabrichq.ai/projects/nebulactl/en/stable/) for use in actions.

## Usage

Refer to the [action.yml](https://github.com/datafabriclab/nebulactl-setup-action/blob/main/action.yml) to see all of the action parameters.


**Inputs**

Name | Description | Example
--- | --- | ---
version | The version of nebulactl to download and use, Default value is latest |  v0.2.20

Install specific version of nebulactl
```yaml
steps:
  - uses: actions/checkout@v2
  - uses: datafabriclab/nebulactl-setup-action@main
    with:
      version: '0.2.21' # The version of nebulactl to download and use.
  - run: nebulactl --help
```

Install latest version of nebulactl
```yaml
steps:
  - uses: actions/checkout@v2
  - uses: datafabriclab/nebulactl-setup-action@main
  - run: nebulactl --help
```

## Getting started Example
```bash
name: nebulactl-setup-action
on: [push]
jobs:
  install-nebulactl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: datafabriclab/nebulactl-setup-action@main
      - name: Setup demo cluster
        run: nebulactl demo start
      - name: Setup nebulactl config
        run: nebulactl config init
  
```

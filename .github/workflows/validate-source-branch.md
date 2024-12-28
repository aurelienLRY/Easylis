name: Validate Pull Request Source

on:
  pull_request:
    branches:
      - production
      - beta-produc

jobs:
  validate-production:
    if: github.event.pull_request.base.ref == 'production'
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR Source for Production
        run: |
          echo "Validating pull request source branch for 'production'..."
          if [[ "${{ github.event.pull_request.head.ref }}" != "beta-produc" ]]; then
            echo "❌ Pull requests to 'production' must originate from 'beta-produc'."
            exit 1
          else
            echo "✅ Pull request source branch is valid for 'production'."
          fi

  validate-beta-produc:
    if: github.event.pull_request.base.ref == 'beta-produc'
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR Source for Beta Production
        run: |
          echo "Validating pull request source branch for 'beta-produc'..."
          if [[ "${{ github.event.pull_request.head.ref }}" != "master" ]]; then
            echo "❌ Pull requests to 'beta-produc' must originate from 'master'."
            exit 1
          else
            echo "✅ Pull request source branch is valid for 'beta-produc'."
          fi

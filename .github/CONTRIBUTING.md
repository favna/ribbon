# Contributing

**The issue tracker is only for bug reports and enhancement suggestions. If you have a question, please ask it in the [Discord server](https://favware.tech/redirect/server) instead of opening an issue – you will get redirected there anyway.**

If you wish to contribute to the ribbon codebase or documentation, feel free to fork the repository and submit a
pull request. We use ESLint to enforce a consistent coding style, so having that set up in your editor of choice
is a great boon to your development process.

## Setup
To get ready to work on the codebase, please do the following:

0. Setup NodeJS as well as build tools for your OS
   - On Windows this can best be done by opening an administrative powershell and running `npm i -g windows-build-tools`
   - On MacOS this can best be done through `xcode-select --install`
   - On Debian / Ubuntu this can be done through `sudo apt install -y build-essential`
   - On Fedora / CentOS / RHEL this can be be done through `yum groupinstall 'Development Tools' -y`
1. Fork & clone the repository, and make sure you're on the **master** branch
   - If you forked in the past:
     - Add the upstream repository: `git remote add upstream https://github.com/favna/ribbon`
     - Checkout master: `git checkout master`
     - Fetch all remotes: `git fetch --all`
     - Pull upstream/master: `git pull upstream/master`
     - Push master: `git push origin/master --force`
2. Run `yarn install`
3. Code your heart out!
4. Run `yarn run lint` to run ESLint and ensure your code abides by the coding style
5. Run `yarn build` to ensure your code compiles
6. [Submit a pull request](https://github.com/favna/ribbon/compare)
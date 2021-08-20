# Overview

Based on the Repo for BuzzFlyHC in NG FFWD (L1NE product)

# Contribution guidelines

-   keep it clean
-   all merges to master should build & run

# Environments

-   node v10.16.0
-   npm v6.9.0
-   yarn v1.16.0

# Setting up Exercise Repo and Environment - Initial First Steps

### 1. Creating a new exercise from this template

-   First, create a new repository that will house the new exercise code: https://confluence.atlassian.com/bitbucket/create-a-git-repository-759857290.html
-   Mirror the exercise template repo to this new repo, using these instructions: https://help.github.com/en/articles/duplicating-a-repository

### 2. Installation of Environment (This is one approach, not required standard)

-   Install nvm and install/use node version

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
nvm install v10.16.0
nvm use v10.16.0
```

-   Install npm version

```sh
npm install -g npm@6.9.0
```

-   Install yarn as needed, if not using npm install approach

```sh
npm install -g yarn@1.16.0
```

### 3. Adding NPM token to environment variable

-   find actual npm token at wiki page - http://wiki.scilearn.com/display/prodmanagement/Geordi+Exercise+Architecture+and+Documentation
-   if PlayPower talk to Vivek about getting the npm token
-   Suggested way for mac setup

```sh
# go to your ~/.profile file and add this environment variable with the npm token
export NPM_SLC_AUTH_TOKEN="npm token"
```

-   For Windows use Git Bash to setup the environment variable via bash or use the following link to setup
-   http://www.dowdandassociates.com/blog/content/howto-set-an-environment-variable-in-windows-command-line-and-registry/
-   Either way use Git Bash to do any npm command including install
-   https://gitforwindows.org/

### 4. Installation Guide

-   Go inside root of directory
-   Install via yarn, do not use npm install or check in package-lock.json (remove it if it was generated by accident). It tends to interfere and mess up the yarn.lock which we need working a certain way for Pipelines.

```sh
yarn --ignore-engines
```

### 5. Build game

-   Source code including compiled files appear in the build directory.
-   The build directory is what will be loaded in the browser when the app starts.
-   The following command runs commands and scripts to compile the typescript files into javascript files via the Webpack module bundler.
-   Source Maps also show up in the browser and are used to map javascript files to their revelant typescript files for better debugging.
-   If you have changed the resources (audio or art) since the last build
    `yarn run copyRes`
-   Normal
    `yarn run build` note: build has `run copyRes` as part of the list of commands.
-   Watch Mode
    `yarn run build:watch`

### 6. Run Game

-   Port number can be configured in the node/run.js script during environment setup.
-   `yarn start`
-   `localhost:8000`
-   Note: if your learnflow-sdk lib is 1.1.420 or higher, you will need to add the "mode=dev" param to the URL to run as a standalone local. It's also recommended to use the "debugger_enabled=true" param, e.g. `localhost:8000/?mode=dev&debugger_enabled=true`

### 7. Run Unit Tests For Progression

Test cases are in `src/Progression/__tests__/` directory

-   run test cases : `npm test` (this is what Bamboo runs)

-   run test cases : `jest`

either of the above will re-generate the inital state files. If you have just changed content.yaml, run
`jest -t "record initial state files"` first.

-   run test cases (watch mode) : `npm t -- --watch`
-   run individual test case: `jest -t "test name"`

### 8. Update dev-env with newest exercises

-   Update the dev-env with the newest repo once you have bitbucket repo link ready.
-   See the following commit link on what files need to be updated in dev-env, please note for that change it was 3 exercises that were updated.
-   https://bitbucket.org/scilearn/dev-env/pull-requests/21/updating-dev-env-scripts-to-include-the
-   Alert team afterwards so everyone can update and re-run the nginx_setup.sh.

# Setting up PPDebugger

### Install PPDebugger

-   Go to site and download PPDebugger for Chrome or Firefox:
-   https://chrome.google.com/webstore/detail/debugger/mdnjmadddcdkhaleanoackombagjdfic?hl=en
-   https://addons.mozilla.org/en-US/firefox/addon/debugger/?src=api
-   For Chrome Incognito: Go to chrome://extensions/ in the browser url, click Details for the PPDebugger and turn on "Allow in Incognito".
-   To view the PPDebugger, open an exercise in the url, then open Inspector and go to the new tab in the JavaScript console named PPDebugger.
-   For additional documentation on functionality and features:
-   https://docs.google.com/document/d/1OKnj0vbGge4KFt7AxxEX-kGER85zeyKXqCUITtL-Ff0/edit#heading=h.ulcu7so810iy

# Setting up a generated content.yaml

-   You can either set up a content.yaml manually or using a generation script.
-   For an example of a generated content.yaml approach, you can check out Jen's Houndini and MoonRanch.
-   https://bitbucket.org/scilearn/houndinihc/src/master/src/Progression/generator/
-   https://bitbucket.org/scilearn/moonranch/src/master/src/Progression/new_generator.js

# Using Percent Thru tool (For Debug Panel example make sure PPDebugger is initialized first)

### Each exercise can still potentially have a different reaction to the change depending on how it was coded here. Here are general rules to follow:

-   Enter new percent complete desired only in debug panel when triggering change. Do not have other commands there as they will be ignored.
-   After change is triggered the percent progress change will be seen happening in the browser console as the percent is changing. Do not close the browser window or do anything as this is happening.
-   After change is completed and the post is sent to the server, finish the existing trial which will let the UI transition into the percent.
-   At this point all debug commands will not work, only percent changes will be allowed. Otherwise, the UI will work as expected.
-   An alternative would be to close the exercise by exiting to the exercise selector at this point and reopen it from there. You should see the percent being updated across all views (exercise selector, scorecard, and reports).
-   You can also trigger from the browser console using the webhook:
    window.dispatchEvent(new CustomEvent(“adjust-percent-complete”, {“detail”: 50}));

### Some notable exercise issues:

-   JumperGym - will do the percent complete change, but it will break in the same window. So you will need to exit to the exercise selector when the percent complete is done. Everything will be updated as expected.
-   PaintMatch - Cannot go up to 100% at this point in time using the tool due to the way the exercise handles posting to the server. Every other percent is supported.
-   Some exercises might throw a script error at 100%, however, once you exit the window everything should update to 100% as expected.

# Setting up Pipeline Build - Only do this step if we are ready to hook up to ffwd-server and slc.

### 1. Set up notifications for repo

-   Add a new chat/slack notification subscription for the #bots channel. Subscribe to repository-wide notifications for all build, pipelines, and deployment events: https://confluence.atlassian.com/bitbucket/bitbucket-cloud-for-slack-945096776.html#BitbucketCloudforSlack-SubscribeSlackchannelstoBitbucketrepositories
-   Add notifications for any other channels desired (eg #unicon-bots).

### 2. Update Exercise Name in Code

-   Update package.json and set the displayName of the exercise, it should be the name of the repo.
-   You will need to rename the ExerciseTemplate directory (src/ExerciseTemplate) to the exercise name from the package.json.
-   You will then need to modify all the paths in the code to match the new updated directory name.
-   Be sure you can build and run the app along with passing all tests before moving on.

### 3. Modify Pipeline settings in the exercise bitbucket repo

-   Enable bitbucket pipelines in the repo by clicking "Pipelines" then clicking the "Enable" button.
-   It starts building immediately, so be sure to stop it otherwise there will be aws upload discrepancies. You can go to Pipelines and manually stop the build by going into the build and clicking stop.
-   Go to "Settings", then "Repository variables" in the Pipelines section and add EXERCISE_LAUNCH_NAME as the name and use the exercise short name as the value for the new exercise (you can look up short names [here](https://docs.google.com/spreadsheets/d/1ALnsR2cjhduTjBMq_32UsFXKKQPiv_BsK0mM5zJ3IYU/edit#gid=0). This value will be used in the bitbucket-pipelines.yml to build the Pipeline build and push it to s3 under the right directory.
-   Wait until the first pipeline succeeds. If the pipeline fails, look at the logs to troubleshoot the build.
-   Ensure your exercise is supported by the exercise selector and scorecard.
-   Once the pipeline succeeds, add the exercise repo name to the `config/exercises` file in the [ffwd-client-deployment](https://bitbucket.org/scilearn/ffwd-client-deployment/) repo.
-   Once that file is committed, subsequent deployments will contain the new exercise.

### 4. Update ngffwd-node-processes with new Exercise gamePath

-   Modify main.ts in ngffwd-node-processes to include gamepath for new exercise.
-   Make sure the `yarn install` and `yarn test` commands run successfully on your local machine.
-   Be sure to publish a new version of ngffwd-node-processes and have all the exercises use that new version.
-   Download the update_lib.sh and set up your directory with all the exercises as mentioned in the snippet:
-   https://bitbucket.org/snippets/scilearn/Le9ybo/update-all-exercises-to-latest-learnflow
-   Wait till the Pipeline build is successful and then do the update_lib.sh script with ngffwd-node-processes as the value for all exercises.

### 5. After all the above is done, then start a ffwd client deployment build

-   After all exercises have finished building, build a ffwd client deployment build with the new pipeline build and the ngffwd-node-processes changes.

### 6. Once the ffwd client deployment build is done, verify it in s3

-   After the build is done uploading to ld and qa, go to s3 to verify the exercise appears as expected.
-   It would be under s3 > ngffwd > ffwd client build # > exercise directory name.
-   On paper, whatever was in your local build directory in the exercise repo should be the contents within this s3 exercise directory.

# Additional Commands and Functionality

-   Copies and moves various resources including plist, png, and sound files and zips them for build

```sh
 yarn run copyRes
```

-   Upgrades the latest learnflow-sdk through yarn

```
 yarn add @scilearn/learnflow-sdk
```

-   Upgrades the latest ngffwd-node-processes through yarn

```
 yarn add @scilearn/ngffwd-node-processes
```

-   Verify that registry is pointing to yarnpkg, do the following

```
yarn config list
```

-   the registry attribute should be registry: 'https://registry.yarnpkg.com'
-   Change registry attribute if needed

```
yarn config set registry https://registry.yarnpkg.com
```

-   Optimizes all .png and .plist files under the /res directory. May need to install ImageMagick to run.

```
brew install GraphicsMagick
npm install -g gm
npm run optimize
```

# Licence

This project is Copyright � 2018 Scientific Learning Corporation. All rights reserved. Redistribution or copying of this source code is prohibited. The binary code may be distributed only under and pursuant to the terms of a license agreement agreed to by Scientific Learning Corporation or one of its authorized distributors.
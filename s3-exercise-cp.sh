#!/bin/sh

if [ "$#" -ne 2 ]; then
    echo "You must enter exactly 2 command line arguments."
    exit -1
fi

exercise="$1"
buildNumber="$2"
LATEST_VERSION_FILENAME="latest"


echo `tar -cvzf build.tar.gz build/*`

if [ ! -f build.tar.gz ]; then
    echo "Unable to find build.tar.gz."
    exit -1
fi


# COPY to s3
echo "Copying build.tar.gz to s3://scilearn-pipeline/${exercise}/${buildNumber}/"
echo `aws s3 cp build.tar.gz "s3://scilearn-pipeline/${exercise}/${buildNumber}/build.tar.gz" --acl public-read `

# Write max-version file to s3.
# This will contain the current build we are on
echo ${buildNumber} >> "${LATEST_VERSION_FILENAME}"
echo `aws s3 cp ${LATEST_VERSION_FILENAME} "s3://scilearn-pipeline/${exercise}/${LATEST_VERSION_FILENAME}" --acl public-read `


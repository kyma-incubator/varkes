#!/usr/bin/env bash
changedDir=$(git diff pr-$PULL_NUMBER master --dirstat | cut -d' ' -f3-)
changedDirArray=$(echo $changedDir | tr " " "\n")
makeDirs=$(find . -type f -name '*make*' | sed -r 's|/[^/]+$||' |sort |uniq | cut -d' ' -f3-)
makeDirs=$(echo "${makeDirs//.}")
makeDirsArray=( $makeDirs )
for x in $changedDirArray
do
  for i in `seq 0 ${#makeDirsArray[@]}`
   do
        echo x "/$x"
        echo y "${makeDirsArray[$i-1]}"
        if [[ "/$x" == *"${makeDirsArray[$i-1]}"* ]];
        then
            echo "\"${makeDirsArray[$i-1]}\""
            cd "/varkes${makeDirsArray[$i-1]}"
            make ci
            cd "/varkes"
        fi
    done
done

#!/usr/bin/env bash
changedDir=$(git diff pr-$PULL_NUMBER master --dirstat | cut -d' ' -f3-)
changedDirArray=$(echo $changedDir | tr " " "\n")
makeDirs=$(find . -type f -name '*make*' | sed -r 's|/[^/]+$||' |sort |uniq)
makeDirsArray=$(echo $makeDir | tr " " "\n")
echo ${myArray[@]/green//} | cut -d/ -f1 | wc -w | tr -d ' '
for x in $changedDirArray
do
   for y in $makeDirsArray
   do
        if [[ "$x" == *"$y"* ]];
        then
            echo "\"$y\""
            cd "$y"
            make ci
        fi
    done
done

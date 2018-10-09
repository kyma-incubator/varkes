#!/usr/bin/env bash
echo $PULL_NUMBER
changedDir=$(git diff pr-$PULL_NUMBER master --dirstat | cut -d' ' -f3-)
echo $changedDir
arr=$(echo $changedDir | tr " " "\n")

for x in $arr
do
   if [[ "$x" == *\/* ]];
   then
	 echo "\"$x\""
	 cd "$x"
	 make ci
   fi
done
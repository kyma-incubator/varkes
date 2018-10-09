#!/usr/bin/env bash
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
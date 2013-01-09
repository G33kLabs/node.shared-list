#!/bin/sh

# Destination paths
WORKING=/Users/Guiltouf/Downloads/MovieConversion/working
COMPLETE=/Users/Guiltouf/Downloads/MovieConversion/complete
ARCHIVE=/Users/Guiltouf/Downloads/MovieConversion/originals

# Source file
SRC=`echo $1`

# Destination file
FILENAME=$(basename "$SRC")
FILENAME_NO_EXT="${FILENAME%.*}"
DEST="$FILENAME_NO_EXT.m4v"

# Report before compression
echo "Source File : $SRC";
echo "Destination File : $COMPLETE/$DEST";

# Make WORKING directory
mkdir -p "$WORKING"

# Only remove metadata and chapters
#ffmpeg -i "$SRC" -c:v copy -c:a copy -map_chapters -1 -map_metadata -1 "$WORKING/$DEST"

# Encode with ffmpeg
ffmpeg -i "$SRC" -acodec aac -ac 2 -strict experimental -ab 160k -s 640x272 -vcodec libx264 -preset slow -profile:v baseline -level 30 -maxrate 10000000 -bufsize 10000000 -b 1200k -f mp4 -threads 0 -map_chapters -1 -map_metadata -1 "$WORKING/$DEST"

# Move file to complete dir
mkdir -p "$COMPLETE"
mv "$WORKING/$DEST" "$COMPLETE/$DEST"

# Move source to complete files
mkdir -p "$ARCHIVE/"
mv "$SRC" "$ARCHIVE/$FILENAME"
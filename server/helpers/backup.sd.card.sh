#!/bin/sh

# Set paths 
# ----------
# /!\ Be carrefull of sd_card path ! 
# If you choose to restore an image, be sure that sd_card is not yout system hard drive :)

sd_card="/dev/disk1"
raspberry_img="/Users/Guiltouf/Backups/$(date +%Y%m%d).raspberry.wheezy.img";

# Backup without compression
#echo "[>] Copy $sd_card >> $raspberry_img"
# dd if=$sd_card of=$raspberry_img

# Backup with gzip compression
echo "[>] Copy and compress $sd_card >> $raspberry_img.gz"
dd if=$sd_card | gzip > $raspberry_img.gz

# Restore SD Card without image compression 
#echo "[>] Restore $raspberry_img >> $sd_card"
#dd if=$raspberry_img of=$sd_card

# Restore SD Card with gzip compression
#echo "[>] Uncompress and restore $raspberry_img.gz >> $sd_card"
#gzip -dc $raspberry_img.gz | dd of=$sd_card

# Say ok when all complete
say -v alex "Build complete !"
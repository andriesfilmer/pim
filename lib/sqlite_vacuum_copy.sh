#!/bin/bash

# Set the current date
CURRENT_DATE=$(date +'%Y-%m-%d')

# Define source and destination paths
SOURCE_DB="/var/www/pim-rails/db/pim.sqlite3"
DEST_DB="/var/backups/sqlite/pim_${CURRENT_DATE}.sqlite3"

# Perform the VACUUM INTO operation
/usr/bin/sqlite3 $SOURCE_DB "VACUUM INTO '${DEST_DB}';"


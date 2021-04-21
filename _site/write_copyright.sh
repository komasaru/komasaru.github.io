#!/bin/bash

TXT="©`date "+%Y"` mk-mode.com"

convert -size 340x50 xc:black -font Courier-Bold -pointsize 32 -gravity center \
        -draw "fill black  text 0,0  '$TXT'" \
        stamp_fgnd.png
convert -size 340x50 xc:black -font Courier-Bold -pointsize 32 -gravity center \
        -draw "fill white  text  1,1  '$TXT'  \
                           text  0,0  '$TXT'  \
               fill black  text -1,-1 '$TXT'" \
        +matte stamp_mask.png
composite -compose CopyOpacity  stamp_mask.png  stamp_fgnd.png  stamp.png
mogrify -trim +repage stamp.png

composite -gravity southeast -geometry +10+8 stamp.png $1 $1.wm


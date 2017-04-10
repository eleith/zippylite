# zippylite

unzip a bunch of csv files and import than into an sqlite database, all from the command line

## REQUIREMENTS

a zip file containing csv files of data. the names of the csv files will become your tables and the first row of each csv file will be your columns. all column types will be of type TEXT.

## INSTALLING

TBD

## EXAMPLE USAGE

```
chmod 700 zippylite.js
./zippylite.js -f path/to/archive.zip -o database.sqlite
```
	
## Authors

eleith

## Testing

TBD

## Contributions

issues and pull requests are welcome

## MISC

the original intent of this exercise was to produce a sqlite table from [caltrain's zipped data](http://www.caltrain.com/developer.html) for use in my android caltrain app.

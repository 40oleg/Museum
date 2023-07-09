# Museum
The aim of the project is to create software that would help to enlighten, interest, involve people who are far away and do not accept it in the study of art by showing works of art on the desktop screensaver and changing them with some frequency or just be a nice visual application for everyone.

* Application has more than 150 paintings:
  * Vincent van Gogh
  * Paul Cezanne
  * Isaac Levitan
  * Hieronymus Bosch
  * Pablo Picasso
  * Rene Magritte
  * Wassily Kandinsky
  * Salvador Dali
  * Claude Monet
  * Marc Chagall
  * Kazimir Malevich
  * Edouard Manet
  * Henri Matisse
  * Rembrandt Harmenszoon van Rijn
  * Ivan Aivazovsky
* 7 modes for changing wallpaper.
* It automatically loads after PC starts.
* Low CPU stress.
* Low memory consumption.
* Only Windows 10+ support.
* Only Russian language (English soon...)

## Installation
1) Download the archive suitable for your operating system (currently where is only one archive for win-x64)
2) Unpack the archive into some directory, for example D:/Museum
3) Create shortcut from binary.exe file
4) Open it's properties and in the "Object" field type "./../your_path/binary.exe boot.js"
5) Open the startup panel, hold down the win + r keyboard shortcut and write shell:startup in the drop-down window and press Enter
6) Move shortcut file in this directory
7) Then move the ./client/Museum.exe file to the desktop
8) Restart your computer

## Removal
1) Open the startup panel, hold down the win + r keyboard shortcut and write shell:startup in the drop-down window and press Enter
2) Delete shortcut file
3) Restart your computer
4) Delete all files from the directory where the archive was unpacked
5) Delete application's icon on desktop

## Folder structures
* code - source code of the application
* docs - contains documents for this project
* deprecated - files that are not used
* util - different additional utils for development

## Library versions
### Client
* Angular@13.1.0
* Taiga.ui@3.18.0
* Rx.js@7.4.0
* Typescript@4.5.2

### Server
* Nest.js@9.0.0
* Rx.js@7.2.0
* Jest@29.3.1
* Typescript@4.7.4
* Eslint@8.0.1

# Museum

## Native Windows edition (0.0.2 release branch)

Museum displays 151 annotated paintings from 15 artists as Windows wallpapers. This edition compiles to a Windows x64 executable with Nona v0.34.0. The portable package includes all 151 rendered 3840×2160 JPEGs. It runs on Windows 10/11 with the system Win32 libraries.

1. Extract the complete package to a permanent folder. Keep `wallpapers` next to `Museum.exe`.
2. Open `Museum.exe`, choose an interval, check **Включить смену картин**, and click **Сохранить**. Open the executable again to revisit settings. The worker stays active after the window closes. While the modal settings dialog is open rotation pauses, then resumes when it closes.
3. For autostart, run `.\Museum.exe --install` from the package folder. On the next Windows sign-in Museum starts in the background. Run the command again if you move the package.
4. To stop rotation and bring back your saved desktop image, choose **Вернуть исходные обои** in settings. Museum keeps its own copy in `%LOCALAPPDATA%\Museum`. To stop the worker and remove autostart run `.\Museum.exe --uninstall`. You can then remove the package folder. Keep the saved wallpaper while Windows uses it.

To verify a package, run `.\Museum.exe --check` and inspect its exit code. A fresh installation starts with rotation disabled. This edition keeps its own settings. When upgrading from the alpha, remove the old startup shortcut separately.

### Build

From the repository root in **Windows PowerShell 5.1**, pass the extracted [Nona v0.34.0 Windows x64 compiler](https://github.com/40oleg/nona/releases/tag/v0.34.0) and a new output directory:

```powershell
.\native\build\Build-Museum.ps1 -Nona C:\Tools\Nona\nona.exe -OutputDirectory C:\Builds\Museum-0.0.2
```

The build renders the catalog from the original images and Russian metadata. Windows CI builds the package again, exercises the settings window, wallpaper restoration, autostart and process coordination, and uploads a portable artifact. [Windows builds](https://github.com/40oleg/Museum/actions/workflows/museum-windows.yml)

## Original Electron and NestJS alpha

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

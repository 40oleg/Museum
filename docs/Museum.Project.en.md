# Museum Project
## Problem statement
### Goal:
<div style="text-align: justify;">
The goal of the project is to create software that would help to enlighten, interest, involve people who are far away and do not accept it in the study of art by showing works of art on the desktop screensaver and changing them with some frequency.
</div>

### Source data:
<div style="text-align:justify;">
The initial data for software operation is the configuration provided by the user after launching the application. The configuration is:
</div>

* <div style="text-align: justify;">genres of art to be displayed on the desktop screensaver
* <div style="text-align: justify;">type of splash screen design
* <div style="text-align:justify;">the frequency of changing the desktop screensaver
### A priori model representations:
<div style="text-align: justify;">The software should provide users with the following features:</div>

* <div style="text-align: justify;">create a program configuration file;</div>
* <div style="text-align: justify;">edit the program configuration file;</div>
* <div style="text-align:justify;">set the program to start automatically when the PC starts;</div>
* <div style="text-align: justify;">disable automatic startup of the program when starting the PC.</div>
### Expected result:
<div style="text-align: justify;">
A program that allows you to create a configuration file through the GUI and executes its purpose using it.
</div>

### Criteria for evaluating the result:
By should:
* <div style="text-align:justify;">work properly on any popular modern OS (Windows / Unix /Mac);</div>
* <div style="text-align:justify;">satisfy users with an external graphical interface, its functionality and the size of the application on the file system.</div>

## Functional requirements
* <div style="text-align: justify;">applications should allow you to set the desktop background from a pre-loaded gallery in the application</div>
* <div style="text-align: justify;">backgrounds must contain works of art</div>
* <div style="text-align: justify;">backgrounds should contain descriptions of works of art</div>
* <div style="text-align: justify;">the application should be configured once at the beginning, and then work automatically</div>
* <div style="text-align: justify;">if the user wishes, the configuration can be changed</div>
* <div style="text-align:justify;">the configuration must contain: the time of the change of the work of art, the category of art, the design of the background (on which the work of art is located)</div>

## Business entities
* <div style="text-align:justify;">Wallpaper - contains some kind of artwork in graphic image format;</div>
* <div style="text-align: justify;">Rule - is the condition under which the wallpaper is changed.</div>

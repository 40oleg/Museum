const { execSync } = require('node:child_process');

execSync('reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d  "C:/image.jpg"', {input: 'Y'})
execSync('RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters');

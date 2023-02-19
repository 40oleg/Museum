/**
 * This interface defines the methods of working with wallpapers on a computer regardless of the operating system.
 */
export interface IHaveWallpaperAPI {
    /**
     * Get wallpaper path
     */
    getWallpaper(): string;
    /**
     * Set wallpaper by path
     * @param imagePath - path to the image to set as wallpaper
     */
    setWallpaper(imagePath: string): void;
}

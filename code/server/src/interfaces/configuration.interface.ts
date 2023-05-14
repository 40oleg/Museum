export interface IConfiguration {
  /** Unique identifier */
  id: number;

  /** Is wallpaper changing active */
  enabledCarousel: boolean;

  /** Interval of changing wallpaper (watch interface IInterval) */
  changeInterval: IInterval;

  /** The last time changing of wallpaper by scheduler */
  lastChangeTimestamp: number;
}

export interface IInterval {
  /** Unique identifier */
  id: number;

  /** Name of interval for clarity in development */
  name: string;

  /** Time after wallpaper changing */
  timestamp: number;
}

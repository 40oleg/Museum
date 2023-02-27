export interface IConfiguration {
  id: number;
  enabledCarousel: boolean;
  changeInterval: IInterval;
}

export interface IInterval {
  id: number;
  name: string;
  timestamp: number;
}

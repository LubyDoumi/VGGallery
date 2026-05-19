export class VGImageZoomData {
  public static readonly Default: VGImageZoomData = new VGImageZoomData(
    1,
    0,
    0,
  );

  /////

  public readonly Scale: number = 1;
  public readonly X: number = 0;
  public readonly Y: number = 0;

  /////

  constructor(scale: number, x: number, y: number) {
    this.Scale = scale;
    this.X = x;
    this.Y = y;
  }
}

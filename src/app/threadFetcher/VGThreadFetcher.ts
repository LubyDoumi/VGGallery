export type VGImageTypeModel = "linked" | "directlinked";

export type VGImageModel = {
  imageURL: string;
  thumbnailURL: string;
  type: VGImageTypeModel;
};

export type VGPostModel = {
  imageCount: number;
  images: VGImageModel[];
  postID: number;
  title: string;
};

export type VGThreadModel = {
  title: string;
  posts: VGPostModel[];
};

export interface VGThreadFetcher {
  Fetch(): Promise<VGThreadModel>;
}

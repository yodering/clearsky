import { BskyAgent } from '@atproto/api';
import type { BlueskyPost } from '../../types/bluesky';

export class PostMapperService {
  static async mapPostFromResponse(item: any, agent: BskyAgent): Promise<BlueskyPost> {
    const embed = item.post.embed;
    const hasImage = this.hasImages(embed);
    const hasVideo = this.hasVideo(embed);

    return {
      uri: item.post.uri,
      cid: item.post.cid,
      text: item.post.record.text,
      createdAt: item.post.record.createdAt,
      hasImage,
      hasVideo,
      embed: embed ? {
        images: hasImage ? embed.images?.map((img: any) => ({
          fullsize: img.fullsize,
          alt: img.alt,
        })) : undefined,
        media: hasVideo ? {
          type: embed.media.type,
          url: embed.media.url,
        } : undefined,
      } : undefined,
    };
  }

  private static hasImages(embed: any): boolean {
    return embed?.images?.length > 0 || (embed?.media?.images?.length > 0);
  }

  private static hasVideo(embed: any): boolean {
    return embed?.media?.type === 'video';
  }

}
import { BskyAgent, AppBskyEmbedRecord } from '@atproto/api';
import type { BlueskyPost } from '../../types/bluesky';

export class PostMapperService {
  static async mapPostFromResponse(item: any, agent: BskyAgent): Promise<BlueskyPost> {
    const embed = item.post.embed;
    const hasImage = this.hasImages(embed);
    const hasVideo = this.hasVideo(embed);
    const isQuote = this.isQuotePost(embed);

    const isRepost = item.post.record?.$type === 'app.bsky.feed.repost';
    const originalAuthor = isRepost ? {
      handle: item.post.author.handle,
      displayName: item.post.author.displayName || item.post.author.handle
    } : undefined;

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
      isQuote,
      isRepost,
      originalAuthor,
      quotedPost: isQuote ? {
        uri: embed.record.uri,
        text: embed.record.value.text,
        author: {
          handle: embed.record.author.handle,
          displayName: embed.record.author.displayName || embed.record.author.handle
        }
      } : undefined
    };
  }

  private static hasImages(embed: any): boolean {
    return embed?.images?.length > 0 || (embed?.media?.images?.length > 0);
  }

  private static hasVideo(embed: any): boolean {
    return embed?.media?.type === 'video';
  }

  private static isQuotePost(embed: any): boolean {
    return AppBskyEmbedRecord.isView(embed) && 
           embed.record?.value !== null &&
           typeof embed.record?.value === 'object' &&
           'text' in embed.record.value;
  }
}
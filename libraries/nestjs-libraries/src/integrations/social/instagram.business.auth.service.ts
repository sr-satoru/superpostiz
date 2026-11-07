import { AuthTokenDetails } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { META_GRAPH_API_VERSION } from '@gitroom/nestjs-libraries/integrations/social/facebook.provider';
import dayjs from 'dayjs';

export class InstagramBusinessAuthService {
  /**
   * Generates the OAuth authorization URL using Meta's Facebook Login for Business (config_id).
   */
  generateAuthUrl(state: string, redirectUri: string) {
    const clientId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const configId = process.env.INSTAGRAM_CONFIG_ID;

    const url =
      `https://www.facebook.com/dialog/oauth?client_id=${clientId}` +
      `&config_id=${configId}` +
      `&display=popup` +
      `&override_default_response_type=true` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${state}` +
      `&prompt=login`;

    return url;
  }

  /**
   * Exchanges the authorization code for a long-lived access token and fetches the Instagram account details.
   */
  async authenticate(params: {
    code: string;
    redirectUri: string;
  }): Promise<AuthTokenDetails> {
    const clientId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const clientSecret =
      process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

    // 1. Exchange authorization code for short-lived user access token
    const tokenResponse = await (
      await fetch(
        `https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token` +
          `?client_id=${clientId}` +
          `&redirect_uri=${encodeURIComponent(params.redirectUri)}` +
          `&client_secret=${clientSecret}` +
          `&code=${params.code}`
      )
    ).json();

    if (!tokenResponse.access_token) {
      console.error(
        '[Instagram Business Auth] Token exchange failed:',
        JSON.stringify(tokenResponse)
      );
      throw new Error(
        tokenResponse.error?.message ||
          tokenResponse.error_message ||
          'Instagram Business token exchange failed'
      );
    }

    const shortLivedToken = tokenResponse.access_token;

    // 2. Exchange short-lived token for long-lived access token (~60 days)
    const longLivedResponse = await (
      await fetch(
        `https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token` +
          `?grant_type=fb_exchange_token` +
          `&client_id=${clientId}` +
          `&client_secret=${clientSecret}` +
          `&fb_exchange_token=${shortLivedToken}`
      )
    ).json();

    const accessToken = longLivedResponse.access_token || shortLivedToken;

    // 3. Find connected Instagram Business account
    // Try querying user's connected Instagram accounts via /me/accounts or direct Instagram endpoint
    let igUserId = '';
    let igUsername = '';
    let igName = '';
    let igPicture = '';

    // First attempt: check user's pages for linked instagram_business_account
    try {
      const accountsResponse = await (
        await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}&limit=100`
        )
      ).json();

      if (accountsResponse?.data?.length) {
        for (const page of accountsResponse.data) {
          if (page.instagram_business_account?.id) {
            igUserId = page.instagram_business_account.id;
            igUsername = page.instagram_business_account.username || '';
            igName = page.instagram_business_account.name || page.name || '';
            igPicture =
              page.instagram_business_account.profile_picture_url || '';
            break;
          }
        }
      }
    } catch (e) {
      console.warn('[Instagram Business Auth] Error fetching pages:', e);
    }

    // Second attempt: if direct instagram graph endpoint is used by this token
    if (!igUserId) {
      try {
        const directIg = await (
          await fetch(
            `https://graph.instagram.com/${META_GRAPH_API_VERSION}/me?fields=user_id,username,name,profile_picture_url&access_token=${accessToken}`
          )
        ).json();

        if (directIg?.user_id || directIg?.id) {
          igUserId = directIg.user_id || directIg.id;
          igUsername = directIg.username || '';
          igName = directIg.name || directIg.username || '';
          igPicture = directIg.profile_picture_url || '';
        }
      } catch (e) {
        console.warn('[Instagram Business Auth] Error fetching direct IG profile:', e);
      }
    }

    // Third attempt: fallback to /me profile
    if (!igUserId) {
      const me = await (
        await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me?fields=id,name,picture&access_token=${accessToken}`
        )
      ).json();

      igUserId = me.id;
      igName = me.name;
      igUsername = me.name;
      igPicture = me.picture?.data?.url || '';
    }

    return {
      id: igUserId,
      name: igName,
      accessToken,
      refreshToken: accessToken,
      expiresIn: dayjs().add(58, 'days').unix() - dayjs().unix(),
      picture: igPicture,
      username: igUsername,
    };
  }
}

export const instagramBusinessAuthService = new InstagramBusinessAuthService();


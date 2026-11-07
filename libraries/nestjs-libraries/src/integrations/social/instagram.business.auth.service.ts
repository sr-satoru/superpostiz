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
   * Exchanges the authorization code for a Business Integration System User Access Token (SUAT)
   * and fetches the authorized Instagram professional accounts via /me/assigned_instagram_accounts.
   */
  async authenticate(params: {
    code: string;
    redirectUri: string;
  }): Promise<AuthTokenDetails> {
    const clientId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const clientSecret =
      process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

    // 1. Exchange authorization code for Business Integration System User Access Token
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
        '[Instagram Unified Login] Token exchange failed:',
        JSON.stringify(tokenResponse)
      );
      throw new Error(
        tokenResponse.error?.message ||
          tokenResponse.error_message ||
          'Instagram Unified Login token exchange failed'
      );
    }

    const accessToken = tokenResponse.access_token;

    let igUserId = '';
    let igUsername = '';
    let igName = '';
    let igPicture = '';

    // 2. Fetch assigned Instagram accounts according to the official Unified Login documentation:
    // GET https://graph.facebook.com/v25.0/me/assigned_instagram_accounts
    try {
      const assignedResponse = await (
        await fetch(
          `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/assigned_instagram_accounts?fields=id,username&access_token=${accessToken}`
        )
      ).json();

      console.log(
        '[Instagram Unified Login] assigned_instagram_accounts response:',
        JSON.stringify(assignedResponse)
      );

      if (assignedResponse?.data && assignedResponse.data.length > 0) {
        const firstAccount = assignedResponse.data[0];
        igUserId = firstAccount.id;
        igUsername = firstAccount.username || '';

        // Fetch detailed profile information (name, profile_picture_url) for this Instagram User ID
        try {
          const profileResponse = await (
            await fetch(
              `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${igUserId}?fields=id,name,username,profile_picture_url&access_token=${accessToken}`
            )
          ).json();

          if (profileResponse?.id) {
            igName = profileResponse.name || profileResponse.username || igUsername;
            igUsername = profileResponse.username || igUsername;
            igPicture = profileResponse.profile_picture_url || '';
          }
        } catch (profileErr) {
          console.warn('[Instagram Unified Login] Error fetching account details:', profileErr);
        }
      }
    } catch (assignedErr) {
      console.error('[Instagram Unified Login] Error querying assigned_instagram_accounts:', assignedErr);
    }

    // 3. Fallback: Check user's pages if not found in assigned_instagram_accounts
    if (!igUserId) {
      try {
        const pagesResponse = await (
          await fetch(
            `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me/accounts?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}&limit=100`
          )
        ).json();

        if (pagesResponse?.data?.length) {
          for (const page of pagesResponse.data) {
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
      } catch (pagesErr) {
        console.warn('[Instagram Unified Login] Error querying pages fallback:', pagesErr);
      }
    }

    // 4. Fallback: Query /me directly
    if (!igUserId) {
      try {
        const me = await (
          await fetch(
            `https://graph.facebook.com/${META_GRAPH_API_VERSION}/me?fields=id,name,picture&access_token=${accessToken}`
          )
        ).json();

        if (me?.id) {
          igUserId = me.id;
          igName = me.name || '';
          igUsername = me.name || '';
          igPicture = me.picture?.data?.url || '';
        }
      } catch (meErr) {
        console.warn('[Instagram Unified Login] Error querying /me fallback:', meErr);
      }
    }

    if (!igUserId) {
      throw new Error(
        'Nenhuma conta do Instagram foi compartilhada durante o login. Por favor, verifique se você selecionou sua conta do Instagram na tela de autorização.'
      );
    }

    return {
      id: igUserId,
      name: igName || igUsername,
      accessToken,
      refreshToken: accessToken,
      expiresIn: dayjs().add(58, 'days').unix() - dayjs().unix(),
      picture: igPicture,
      username: igUsername || igName,
    };
  }
}

export const instagramBusinessAuthService = new InstagramBusinessAuthService();

import { Share } from 'react-native';

// The website has no page per company or office yet: the site itself, where
// the app can be downloaded. Point this at the profile once one exists
const SITE_URL = 'https://buyootna.cloud';

/** The share sheet with a company's or office's invitation to follow it. */
export async function shareProfile(name: string): Promise<void> {
  try {
    await Share.share({
      title: name,
      message: `تابع ${name} على بيوتنا\n${SITE_URL}`,
    });
  } catch (error) {
    console.warn('Sharing the profile failed:', error);
  }
}

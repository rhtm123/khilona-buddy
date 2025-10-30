import { PUBLIC_ESTORE_ID, PUBLIC_API_URL } from "$env/static/public";
import { myFetch } from "$lib/utils/myFetch";

export async function GET() {
  // Fetch from your DB or external API
  try {
    let url = `${PUBLIC_API_URL}/estore/theme/${PUBLIC_ESTORE_ID}`;
    console.log('Fetching theme from:', url);
    let data = await myFetch(url);
    
    if (!data || !data.variables) {
      // Return default toy store theme if API fails
      const defaultTheme = {
        '--color-primary': '#FF6B9D',
        '--color-secondary': '#4ECDC4',
        '--color-accent': '#FFE66D',
        '--color-base-100': '#FFFFFF'
      };
      return new Response(JSON.stringify(defaultTheme), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const theme = data.variables;
    return new Response(JSON.stringify(theme), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Theme API Error:', error);
    // Return default toy store theme on error
    const defaultTheme = {
      '--color-primary': '#FF6B9D',
      '--color-secondary': '#4ECDC4', 
      '--color-accent': '#FFE66D',
      '--color-base-100': '#FFFFFF'
    };
    return new Response(JSON.stringify(defaultTheme), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
